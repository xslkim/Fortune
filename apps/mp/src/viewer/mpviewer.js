// GeoViewerMP：立体几何 3D 查看器的小程序移植版（three-platformize，无 DOM）。
// 逻辑对齐 web 版 src/viewer/viewer.js：
// - 按面建半透明 mesh（正浅内暗）；边按 topology.js 正/背/轮廓分类渲染（实线/虚线/软边只画轮廓）
// - 高亮支持点/边（加粗圆柱）/面；支持自转、平面截面、展开动画
// 差异：
// - 顶点标注不用 HTML div，改为每帧投影后经 onLabels 回调把 {key,text,x,y,dim} 交给页面
//   用绝对定位 view 渲染（节流 ~50ms）。
// - 触控不由 three-platformize 的 dispatchTouchEvent/TouchEventHandler 转发（社区报告
//   BytePlatform 控制器有 bug），改由页面 bindtouchstart/move/end 直接把原始事件喂给
//   viewer.touchStart/touchMove/touchEnd，复用 web 版轨道参数（theta/phi/radius）。
import * as THREE from 'three-platformize';
import { PLATFORM } from 'three-platformize';
import { WechatPlatform } from 'three-platformize/src/WechatPlatform/index.js';
import { BytePlatform } from 'three-platformize/src/BytePlatform/index.js';
import {
  buildEdges,
  classifyFaces,
  classifyEdges,
  sectionPolygon,
  normFace,
} from '@geo/core/geo/topology.js';
import { unfoldLayout, applyPoint } from '@geo/core/geo/unfold.js';
import { sub } from '@geo/core/geo/solids.js';

const COLORS = {
  faceFront: 0xbcd4f0,
  faceBack: 0x64748b,
  faceHighlight: 0xf59e0b,
  edgeFront: 0x274156,
  edgeBack: 0x93a7bd,
  highlight: 0xe8491d,
  point: 0x274156,
  section: 0xf2a93b,
};

const V = new THREE.Vector3();
const V2 = new THREE.Vector3();

function makePlatform(canvas, width, height) {
  // 编译期按端注入平台实现；微信用 WechatPlatform，抖音（头条系）用 BytePlatform。
  if (process.env.UNI_PLATFORM === 'mp-toutiao') {
    return new BytePlatform(canvas, width, height);
  }
  return new WechatPlatform(canvas, width, height);
}

export class GeoViewerMP {
  /**
   * @param canvas 小程序 canvas 组件的 node（type="webgl"）
   * @param {{width:number, height:number, dpr:number}} size CSS 尺寸与像素比
   */
  constructor(canvas, size) {
    this.canvas = canvas;
    this.width = size.width || 1;
    this.height = size.height || 1;
    this.dpr = Math.min(size.dpr || 1, 2);

    this.platform = makePlatform(canvas, this.width, this.height);
    PLATFORM.set(this.platform);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.setSize(this.width, this.height, false);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf6f8fb);
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 200);

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const dir = new THREE.DirectionalLight(0xffffff, 1.1);
    dir.position.set(5, 9, 6);
    this.scene.add(dir);

    // 轨道状态：围绕 target 的球坐标
    this.target = new THREE.Vector3(0, 1.2, 0);
    this.radius = 7;
    this.theta = 0.65;
    this.phi = 1.05;
    this.minPhi = 0.12;
    this.maxPhi = Math.PI / 2 + 0.45;
    this._foldedMaxPhi = this.maxPhi;

    this.spin = false;
    this.labelsVisible = true;
    this.solid = null;
    this.solidGroup = null;
    this.onLabels = null; // (labels: [{key,text,x,y,dim}]) => void，页面 setData 用
    this._lastLabelPush = 0;

    this._pointers = new Map();
    this._pinchDist = 0;

    this._disposed = false;
    this._tick = this._tick.bind(this);
    const win = this.platform.window;
    this._raf = win.requestAnimationFrame.call(canvas, this._tick);
    this._win = win;
  }

  // ---------- 触控（页面 bindtouch* 直接调用） ----------

  _touchId(t) {
    return t.identifier != null ? t.identifier : t.id;
  }

  touchStart(e) {
    for (const t of e.changedTouches || []) {
      this._pointers.set(this._touchId(t), { x: t.x, y: t.y });
    }
    if (this._pointers.size === 2) {
      const [a, b] = [...this._pointers.values()];
      this._pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
    }
  }

  touchMove(e) {
    for (const t of e.changedTouches || []) {
      const p = this._pointers.get(this._touchId(t));
      if (!p) continue;
      if (this._pointers.size === 1) {
        const dx = t.x - p.x;
        const dy = t.y - p.y;
        this.theta -= dx * 0.006;
        this.phi = Math.min(this.maxPhi, Math.max(this.minPhi, this.phi - dy * 0.006));
        p.x = t.x;
        p.y = t.y;
      } else if (this._pointers.size === 2) {
        p.x = t.x;
        p.y = t.y;
        const [a, b] = [...this._pointers.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (this._pinchDist > 0 && d > 0) {
          this.radius = this._clampRadius(this.radius * (this._pinchDist / d));
        }
        this._pinchDist = d;
      }
    }
  }

  touchEnd(e) {
    for (const t of e.changedTouches || []) {
      this._pointers.delete(this._touchId(t));
    }
    if (this._pointers.size < 2) this._pinchDist = 0;
  }

  _clampRadius(r) {
    return Math.min(40, Math.max(2.5, r));
  }

  // ---------- 几何体 ----------

  setSolid(data) {
    this._clearSolid();
    this.solid = data;
    this.edges = buildEdges(data.faces);

    this.pointFaces = data.points.map(() => []);
    data.faces.forEach((face, fi) => {
      for (const i of normFace(face).idx) this.pointFaces[i].push(fi);
    });

    const bb = new THREE.Box3();
    for (const q of data.points) bb.expandByPoint(V.set(q.p[0], q.p[1], q.p[2]));
    bb.getCenter(this.target);
    const size = bb.getSize(V2).length();
    this.radius = this._clampRadius(size * 1.9);
    this._unit = size * 0.012;

    const group = new THREE.Group();
    this.solidGroup = group;
    this.scene.add(group);

    this.unfold = unfoldLayout(data);
    this.unfoldT = 0;

    this.matEdgeFront = new THREE.LineBasicMaterial({ color: COLORS.edgeFront });
    this.matEdgeBack = new THREE.LineDashedMaterial({
      color: COLORS.edgeBack,
      dashSize: 0.09,
      gapSize: 0.07,
      transparent: true,
      opacity: 0.9,
    });

    this.faceGroups = data.faces.map((face) => {
      const idx = normFace(face).idx;
      const pos = [];
      for (let i = 1; i < idx.length - 1; i++) {
        for (const k of [0, i, i + 1]) {
          const p = data.points[idx[k]].p;
          pos.push(p[0], p[1], p[2]);
        }
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      geo.computeVertexNormals();
      const matFront = new THREE.MeshLambertMaterial({
        color: COLORS.faceFront,
        transparent: true,
        opacity: 0.6,
        side: THREE.FrontSide,
      });
      const matBack = new THREE.MeshLambertMaterial({
        color: COLORS.faceBack,
        transparent: true,
        opacity: 0.28,
        side: THREE.BackSide,
      });
      const front = new THREE.Mesh(geo, matFront);
      const back = new THREE.Mesh(geo, matBack);
      const border = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(
          idx.map((i) => {
            const p = data.points[i].p;
            return new THREE.Vector3(p[0], p[1], p[2]);
          }),
        ),
        this.matEdgeFront,
      );
      border.visible = false;
      const holder = new THREE.Group();
      holder.matrixAutoUpdate = false;
      holder.add(front, back, border);
      group.add(holder);
      return { holder, front, back, border, geo, matFront, matBack };
    });

    this.edgeLines = this.edges.map((e) => {
      const pa = data.points[e.a].p,
        pb = data.points[e.b].p;
      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(pa[0], pa[1], pa[2]),
        new THREE.Vector3(pb[0], pb[1], pb[2]),
      ]);
      const line = new THREE.Line(geo, this.matEdgeFront);
      line.computeLineDistances();
      group.add(line);
      return { line, edge: e, cls: null };
    });

    // 顶点标记（小球）；文字标注经 onLabels 交给页面渲染
    this.pointMarkers = [];
    const sphereGeo = new THREE.SphereGeometry(this._unit, 12, 10);
    data.points.forEach((q, i) => {
      if (!q.label) return;
      const mat = new THREE.MeshBasicMaterial({ color: COLORS.point });
      const marker = new THREE.Mesh(sphereGeo, mat);
      marker.position.set(q.p[0], q.p[1], q.p[2]);
      group.add(marker);
      this.pointMarkers.push({ index: i, marker, mat, label: q.label });
    });

    // 展开时的逐面顶点副本
    this.faceLabels = [];
    data.faces.forEach((face, fi) => {
      for (const i of normFace(face).idx) {
        const q = data.points[i];
        if (!q.label) continue;
        const marker = new THREE.Mesh(
          sphereGeo,
          new THREE.MeshBasicMaterial({ color: COLORS.point }),
        );
        marker.position.set(q.p[0], q.p[1], q.p[2]);
        marker.visible = false;
        this.faceGroups[fi].holder.add(marker);
        this.faceLabels.push({ face: fi, index: i, marker });
      }
    });

    this.highlightGroup = new THREE.Group();
    group.add(this.highlightGroup);
    this.sectionMesh = null;
    this._facing = null;
    this._updateClassification(true);
  }

  _clearSolid() {
    if (!this.solidGroup) return;
    this.solidGroup.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        for (const m of Array.isArray(o.material) ? o.material : [o.material]) m.dispose();
      }
    });
    this.scene.remove(this.solidGroup);
    this.solidGroup = null;
    this.solid = null;
    this.unfold = null;
    this.unfoldT = 0;
    this.pointMarkers = [];
    this.faceLabels = [];
    this.sectionMesh = null;
    this._pushLabels([]); // 清空页面标签层
  }

  // ---------- 高亮 ----------

  highlight(h = {}) {
    this.clearHighlight();
    if (!this.solid) return;
    const { points = [], edges = [], faces = [] } = h;
    const labelToIndex = new Map(this.solid.points.map((q, i) => [q.label, i]));

    for (const label of points) {
      const pm = this.pointMarkers.find((m) => m.label === label);
      if (pm) {
        pm.marker.scale.setScalar(1.9);
        pm.mat.color.set(COLORS.highlight);
      }
    }

    // 高亮边用加粗圆柱（Line 的线宽在小程序 WebGL 里同样不生效）
    const r = this._unit * 0.45;
    const mat = new THREE.MeshBasicMaterial({ color: COLORS.highlight });
    for (const [la, lb] of edges) {
      const ia = labelToIndex.get(la),
        ib = labelToIndex.get(lb);
      if (ia == null || ib == null) continue;
      const pa = this.solid.points[ia].p,
        pb = this.solid.points[ib].p;
      const a = new THREE.Vector3(pa[0], pa[1], pa[2]);
      const b = new THREE.Vector3(pb[0], pb[1], pb[2]);
      const dir = new THREE.Vector3().subVectors(b, a);
      const len = dir.length();
      if (len < 1e-6) continue;
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 10), mat);
      mesh.position.copy(a).addScaledVector(dir, 0.5);
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
      this.highlightGroup.add(mesh);
    }

    for (const fi of faces) {
      const fg = this.faceGroups[fi];
      if (!fg) continue;
      fg.matFront.color.set(COLORS.faceHighlight);
      fg.matFront.opacity = 0.85;
      fg.matBack.color.set(COLORS.faceHighlight);
      fg.matBack.opacity = 0.4;
    }
  }

  clearHighlight() {
    if (!this.solid) return;
    for (const pm of this.pointMarkers) {
      pm.marker.scale.setScalar(1);
      pm.mat.color.set(COLORS.point);
    }
    for (const fg of this.faceGroups) {
      fg.matFront.color.set(COLORS.faceFront);
      fg.matFront.opacity = 0.6;
      fg.matBack.color.set(COLORS.faceBack);
      fg.matBack.opacity = 0.28;
    }
    this.highlightGroup.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) o.material.dispose();
    });
    this.highlightGroup.clear();
  }

  // ---------- 展示 ----------

  setSpin(on) {
    this.spin = !!on;
  }

  setLabelsVisible(on) {
    this.labelsVisible = !!on;
    if (!on) this._pushLabels([]);
  }

  setSection(plane) {
    if (this.sectionMesh) {
      this.sectionMesh.geometry.dispose();
      this.sectionMesh.material.dispose();
      this.solidGroup.remove(this.sectionMesh);
      this.sectionMesh = null;
    }
    if (!plane || !this.solid) return;
    const poly = sectionPolygon(this.solid.points, this.edges, plane);
    if (poly.length < 3) return;
    const pos = [];
    for (let i = 1; i < poly.length - 1; i++) {
      for (const p of [poly[0], poly[i], poly[i + 1]]) pos.push(p[0], p[1], p[2]);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.computeVertexNormals();
    this.sectionMesh = new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({
        color: COLORS.section,
        transparent: true,
        opacity: 0.65,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    this.solidGroup.add(this.sectionMesh);
  }

  // ---------- 展开图 ----------

  canUnfold() {
    return !!this.unfold;
  }

  setUnfold(t) {
    if (!this.solid) return;
    const v = this.unfold ? Math.min(1, Math.max(0, t || 0)) : 0;
    const prev = this.unfoldT || 0;
    if (v === prev) return;
    this.unfoldT = v;
    const active = v > 0;

    if (this.unfold) {
      const mats = active ? this.unfold.transformsAt(v) : null;
      this.faceGroups.forEach((fg, fi) => {
        if (mats) fg.holder.matrix.fromArray(mats[fi]);
        else fg.holder.matrix.identity();
        fg.holder.matrixWorldNeedsUpdate = true;
      });
    }

    for (const rec of this.edgeLines) rec.line.visible = !active;
    for (const fg of this.faceGroups) fg.border.visible = active;
    for (const pm of this.pointMarkers) pm.marker.visible = !active;
    for (const fl of this.faceLabels) fl.marker.visible = active;
    this._updateClassification(true);

    this.maxPhi = active ? Math.PI - 0.05 : this._foldedMaxPhi;
    if (!active) this.phi = Math.min(this.phi, this.maxPhi);

    if (active && prev === 0) this._suggestUnfoldView();
  }

  _suggestUnfoldView() {
    const mats = this.unfold.transformsAt(1);
    const bb = new THREE.Box3();
    this.solid.faces.forEach((face, fi) => {
      for (const i of normFace(face).idx) {
        const p = applyPoint(mats[fi], this.solid.points[i].p);
        bb.expandByPoint(V.set(p[0], p[1], p[2]));
      }
    });
    bb.getCenter(this.target);
    const size = bb.getSize(V2).length();
    this.radius = this._clampRadius(size * 1.5);
    const n = this.unfold.planeNormal;
    this.phi = Math.min(
      this.maxPhi,
      Math.max(this.minPhi, Math.acos(Math.min(1, Math.max(-1, n[1])))),
    );
    this.theta = Math.atan2(n[0], n[2]);
  }

  // ---------- 每帧 ----------

  _updateCamera() {
    const sp = Math.sin(this.phi),
      cp = Math.cos(this.phi);
    this.camera.position.set(
      this.target.x + this.radius * sp * Math.sin(this.theta),
      this.target.y + this.radius * cp,
      this.target.z + this.radius * sp * Math.cos(this.theta),
    );
    this.camera.lookAt(this.target);
  }

  _updateClassification(force = false) {
    if (!this.solid) return;
    if (this.unfoldT > 0) {
      if (this._facing !== null || force) {
        this._facing = null;
        for (const rec of this.edgeLines) rec.line.visible = false;
      }
      return;
    }
    this.solidGroup.updateWorldMatrix(true, false);
    const eye = V.copy(this.camera.position);
    this.solidGroup.worldToLocal(eye);
    const facing = classifyFaces(this.solid.points, this.solid.faces, [eye.x, eye.y, eye.z]);
    const cls = classifyEdges(this.edges, facing);
    this._facing = facing;
    this.edgeLines.forEach((rec, i) => {
      const c = cls[i];
      if (!force && rec.cls === c) return;
      rec.cls = c;
      const { line, edge } = rec;
      line.visible = !edge.smooth || c === 'silhouette';
      line.material = c === 'back' ? this.matEdgeBack : this.matEdgeFront;
    });
  }

  /** 计算顶点标签的屏幕位置并节流推给页面（CSS px 坐标）。 */
  _updateLabels() {
    if (!this.solid || !this.labelsVisible || !this.onLabels) return;
    const now = Date.now();
    if (now - this._lastLabelPush < 50) return; // 节流 ~20fps，降低 setData 压力
    this._lastLabelPush = now;

    const w = this.width,
      h = this.height;
    const labels = [];
    if (this.unfoldT > 0) {
      // 展开时：逐面标签副本，随各自的面变换
      this.solidGroup.updateMatrixWorld(true);
      for (const fl of this.faceLabels) {
        const q = this.solid.points[fl.index];
        V.set(q.p[0], q.p[1], q.p[2]);
        this.faceGroups[fl.face].holder.localToWorld(V);
        V.project(this.camera);
        if (V.z > 1) continue;
        labels.push({
          key: `f${fl.face}-${fl.index}`,
          text: sub(q.label),
          x: ((V.x + 1) / 2) * w,
          y: ((1 - V.y) / 2) * h,
          dim: false,
        });
      }
    } else {
      for (const pm of this.pointMarkers) {
        const q = this.solid.points[pm.index];
        V.set(q.p[0], q.p[1], q.p[2]);
        this.solidGroup.localToWorld(V);
        V.project(this.camera);
        if (V.z > 1) continue;
        const hidden =
          this._facing && this.pointFaces[pm.index].every((f) => this._facing[f] === 'back');
        labels.push({
          key: `p${pm.index}`,
          text: sub(q.label),
          x: ((V.x + 1) / 2) * w,
          y: ((1 - V.y) / 2) * h,
          dim: !!hidden,
        });
      }
    }
    this._pushLabels(labels);
  }

  _pushLabels(labels) {
    if (this.onLabels) this.onLabels(labels);
  }

  _tick() {
    if (this._disposed) return;
    this._raf = this._win.requestAnimationFrame.call(this.canvas, this._tick);
    if (this.spin && this.solidGroup) this.solidGroup.rotation.y += 0.0045;
    this._updateCamera();
    this._updateClassification();
    this._updateLabels();
    this.renderer.render(this.scene, this.camera);
  }

  resize(size) {
    this.width = size.width || 1;
    this.height = size.height || 1;
    this.renderer.setSize(this.width, this.height, false);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  dispose() {
    this._disposed = true;
    try {
      this._win.cancelAnimationFrame.call(this.canvas, this._raf);
    } catch {
      /* 忽略 */
    }
    this._clearSolid();
    this.renderer.dispose();
    try {
      PLATFORM.dispose();
    } catch {
      /* 忽略 */
    }
  }
}
