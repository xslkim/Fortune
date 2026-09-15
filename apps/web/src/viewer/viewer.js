// GeoViewer：立体几何 3D 查看器。
// - 按面建半透明 mesh，正浅内暗；边按 topology.js 的 正/背/轮廓 分类渲染（实线/虚线/软边只画轮廓）
// - 顶点标签用 HTML div 投影，被遮挡变淡；高亮支持点/边/面；支持自转与平面截面
import * as THREE from 'three';
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

const V = new THREE.Vector3(); // 复用的临时向量
const V2 = new THREE.Vector3();

export class GeoViewer {
  // options.onUserInteract：用户首次拖拽/缩放模型时的一次性回调（默认空函数，node 测试安全）
  constructor(container, options = {}) {
    this.container = container;
    container.classList.add('geo-viewer');

    this.onUserInteract =
      typeof options.onUserInteract === 'function' ? options.onUserInteract : () => {};
    this._interacted = false;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.domElement.classList.add('geo-canvas');
    container.appendChild(this.renderer.domElement);

    this.labelLayer = document.createElement('div');
    this.labelLayer.className = 'geo-labels';
    container.appendChild(this.labelLayer);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf6f8fb);
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);

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
    this.maxPhi = Math.PI / 2 + 0.45; // 允许略低于地平线看底面，但不翻转
    this._foldedMaxPhi = this.maxPhi;

    this.spin = false;
    this.labelsVisible = true;
    this.solid = null;
    this.solidGroup = null;

    this._pointers = new Map();
    this._pinchDist = 0;
    this._bindInput();

    this._resizeObserver = new ResizeObserver(() => this.resize());
    this._resizeObserver.observe(container);
    this.resize();

    this._disposed = false;
    this._tick = this._tick.bind(this);
    this._raf = requestAnimationFrame(this._tick);
  }

  // ---------- 交互 ----------

  _bindInput() {
    const el = this.renderer.domElement;
    this._onPointerDown = (e) => {
      this._notifyInteract();
      el.setPointerCapture(e.pointerId);
      this._pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (this._pointers.size === 2) {
        const [a, b] = [...this._pointers.values()];
        this._pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
      }
    };
    this._onPointerMove = (e) => {
      const p = this._pointers.get(e.pointerId);
      if (!p) return;
      if (this._pointers.size === 1) {
        const dx = e.clientX - p.x;
        const dy = e.clientY - p.y;
        this.theta -= dx * 0.006;
        this.phi = Math.min(this.maxPhi, Math.max(this.minPhi, this.phi - dy * 0.006));
      } else if (this._pointers.size === 2) {
        p.x = e.clientX;
        p.y = e.clientY;
        const [a, b] = [...this._pointers.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (this._pinchDist > 0 && d > 0) {
          this.radius = this._clampRadius(this.radius * (this._pinchDist / d));
        }
        this._pinchDist = d;
        return;
      }
      p.x = e.clientX;
      p.y = e.clientY;
    };
    const release = (e) => {
      this._pointers.delete(e.pointerId);
      this._pinchDist = 0;
    };
    this._onPointerUp = release;
    this._onPointerCancel = release;
    this._onWheel = (e) => {
      e.preventDefault();
      this.radius = this._clampRadius(this.radius * (1 + e.deltaY * 0.0012));
    };
    el.addEventListener('pointerdown', this._onPointerDown);
    el.addEventListener('pointermove', this._onPointerMove);
    el.addEventListener('pointerup', this._onPointerUp);
    el.addEventListener('pointercancel', this._onPointerCancel);
    el.addEventListener('wheel', this._onWheel, { passive: false });
  }

  _notifyInteract() {
    if (this._interacted) return;
    this._interacted = true;
    try {
      this.onUserInteract();
    } catch {
      /* 回调异常不影响交互 */
    }
  }

  _clampRadius(r) {
    return Math.min(40, Math.max(2.5, r));
  }

  // ---------- 几何体 ----------

  setSolid(data) {
    this._clearSolid();
    this.solid = data;
    this.edges = buildEdges(data.faces);

    // 顶点入面表（用于标签遮挡判断）
    this.pointFaces = data.points.map(() => []);
    data.faces.forEach((face, fi) => {
      for (const i of normFace(face).idx) this.pointFaces[i].push(fi);
    });

    // 取景：包围盒中心 + 半径
    const bb = new THREE.Box3();
    for (const q of data.points) bb.expandByPoint(V.set(q.p[0], q.p[1], q.p[2]));
    bb.getCenter(this.target);
    const size = bb.getSize(V2).length();
    this.radius = this._clampRadius(size * 1.9);
    this._unit = size * 0.012; // 点/高亮边的尺寸基准

    const group = new THREE.Group();
    this.solidGroup = group;
    this.scene.add(group);

    // 展开布局（球等不支持的为 null）与展开程度
    this.unfold = unfoldLayout(data);
    this.unfoldT = 0;

    // 边线材质（全局边线与展开时每面边界线共用）
    this.matEdgeFront = new THREE.LineBasicMaterial({ color: COLORS.edgeFront });
    this.matEdgeBack = new THREE.LineDashedMaterial({
      color: COLORS.edgeBack,
      dashSize: 0.09,
      gapSize: 0.07,
      transparent: true,
      opacity: 0.9,
    });

    // 面：每面一个 holder（展开动画按面变换），内含正面浅色 / 背面暗色一对 mesh + 边界线
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
      // 展开时显示的面边界线（随面动，用 front 面色）
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
      holder.matrixAutoUpdate = false; // 展开变换由 setUnfold 直接写 matrix
      holder.add(front, back, border);
      group.add(holder);
      return { holder, front, back, border, geo, matFront, matBack };
    });

    // 边：线段，分类时只换材质/显隐，不重建
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

    // 顶点：小球标记 + HTML 标签（只给有 label 的点）
    this.pointMarkers = [];
    const sphereGeo = new THREE.SphereGeometry(this._unit, 12, 10);
    data.points.forEach((q, i) => {
      if (!q.label) return;
      const mat = new THREE.MeshBasicMaterial({ color: COLORS.point });
      const marker = new THREE.Mesh(sphereGeo, mat);
      marker.position.set(q.p[0], q.p[1], q.p[2]);
      group.add(marker);
      const el = document.createElement('div');
      el.className = 'vtx-label';
      el.textContent = sub(q.label);
      this.labelLayer.appendChild(el);
      this.pointMarkers.push({ index: i, marker, mat, el, label: q.label });
    });

    // 展开时的逐面顶点副本：同一顶点在每个相邻面上各自标注（展示"哪些顶点粘合"）
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
        const el = document.createElement('div');
        el.className = 'vtx-label';
        el.textContent = sub(q.label);
        el.style.display = 'none';
        this.labelLayer.appendChild(el);
        this.faceLabels.push({ face: fi, index: i, marker, el });
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
    this.labelLayer.innerHTML = '';
    this.pointMarkers = [];
    this.faceLabels = [];
    this.sectionMesh = null;
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
        pm.el.classList.add('hl');
      }
    }

    // 高亮边用加粗圆柱（Line 的线宽在多数平台不生效）
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
      pm.el.classList.remove('hl');
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
    // 减少动态偏好：不自动旋转（用户明确调 setSpin(true) 也尊重系统设置）
    const reduce =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.spin = !!on && !reduce;
  }

  setLabelsVisible(on) {
    this.labelsVisible = !!on;
    this.labelLayer.style.display = on ? '' : 'none';
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

  /** 当前几何体是否支持展开。 */
  canUnfold() {
    return !!this.unfold;
  }

  /**
   * 设置展开程度 t∈[0,1]：t=0 完全折叠（原样），t=1 完全展开成平面网格。
   * 展开时隐藏全局边线，改用每面自带边界线；顶点标签切换为逐面副本（同一顶点
   * 在多个面上各自标注）。首次从折叠进入展开时给出建议视角（不锁定交互）。
   */
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

    // 全局边线 vs 每面边界线；全局顶点标记 vs 逐面副本
    for (const rec of this.edgeLines) rec.line.visible = !active;
    for (const fg of this.faceGroups) fg.border.visible = active;
    for (const pm of this.pointMarkers) {
      pm.marker.visible = !active;
      if (active) pm.el.style.display = 'none'; // 展开时全局标签让位给逐面副本
    }
    for (const fl of this.faceLabels) {
      fl.marker.visible = active;
      if (!active) fl.el.style.display = 'none';
    }
    this._updateClassification(true);

    // 展开时放宽俯仰限制（正对摊平的网可能需要从正下方平视），折叠时恢复
    this.maxPhi = active ? Math.PI - 0.05 : this._foldedMaxPhi;
    if (!active) this.phi = Math.min(this.phi, this.maxPhi);

    if (active && prev === 0) this._suggestUnfoldView();
  }

  /** 展开时的建议视角：对准展开图中心、沿展开平面法线看过去，并拉远容纳整张网。 */
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
      // 展开时全局边线隐藏，无需正背面分类；标签也不做遮挡变淡
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

  _updateLabels() {
    if (!this.solid || !this.labelsVisible) return;
    const w = this.container.clientWidth,
      h = this.container.clientHeight;
    if (this.unfoldT > 0) {
      // 展开时：逐面标签副本，随各自的面变换（同一顶点在多个面上重复标注）
      this.solidGroup.updateMatrixWorld(true);
      for (const fl of this.faceLabels) {
        const q = this.solid.points[fl.index];
        V.set(q.p[0], q.p[1], q.p[2]);
        this.faceGroups[fl.face].holder.localToWorld(V);
        V.project(this.camera);
        if (V.z > 1) {
          fl.el.style.display = 'none';
          continue;
        }
        fl.el.style.display = '';
        fl.el.style.transform = `translate(-50%, -130%) translate(${((V.x + 1) / 2) * w}px, ${((1 - V.y) / 2) * h}px)`;
        fl.el.classList.remove('dim');
      }
      return;
    }
    for (const pm of this.pointMarkers) {
      const q = this.solid.points[pm.index];
      V.set(q.p[0], q.p[1], q.p[2]);
      this.solidGroup.localToWorld(V);
      V.project(this.camera);
      if (V.z > 1) {
        pm.el.style.display = 'none';
        continue;
      }
      pm.el.style.display = '';
      pm.el.style.transform = `translate(-50%, -130%) translate(${((V.x + 1) / 2) * w}px, ${((1 - V.y) / 2) * h}px)`;
      // 所有入面都背向视线 → 点被遮挡，标签变淡
      const hidden =
        this._facing && this.pointFaces[pm.index].every((f) => this._facing[f] === 'back');
      pm.el.classList.toggle('dim', !!hidden);
    }
  }

  _tick() {
    if (this._disposed) return;
    this._raf = requestAnimationFrame(this._tick);
    if (this.spin && this.solidGroup) this.solidGroup.rotation.y += 0.0045;
    this._updateCamera();
    this._updateClassification();
    this._updateLabels();
    this.renderer.render(this.scene, this.camera);
  }

  resize() {
    const w = this.container.clientWidth || 1;
    const h = this.container.clientHeight || 1;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  dispose() {
    this._disposed = true;
    cancelAnimationFrame(this._raf);
    this._resizeObserver.disconnect();
    const el = this.renderer.domElement;
    el.removeEventListener('pointerdown', this._onPointerDown);
    el.removeEventListener('pointermove', this._onPointerMove);
    el.removeEventListener('pointerup', this._onPointerUp);
    el.removeEventListener('pointercancel', this._onPointerCancel);
    el.removeEventListener('wheel', this._onWheel);
    this._clearSolid();
    this.renderer.dispose();
    el.remove();
    this.labelLayer.remove();
  }
}
