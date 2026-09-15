// 实验室视图：几何体自由观察（旋转/缩放/标注/三视图）、水平截面滑杆、
// 展开图动画与欧拉公式验证。状态挂在壳的 state.lab 上（切走再切回不丢）。
import { catalog } from '@geo/core/geo/solids.js';
import { buildEdges } from '@geo/core/geo/topology.js';
import * as audio from '../../engine/audio.js';
import { state, viewer, panel, setViewsVisible } from '../app.js';
import { el, makeSolid } from './common.js';

export function renderLab() {
  audio.stopAll();
  const lab = state.lab;
  const solidData = makeSolid(lab.solidId);
  viewer.setSolid(solidData);
  viewer.setSpin(lab.spin);
  viewer.setLabelsVisible(lab.labels);
  viewer.setSection(null);
  viewer.setUnfold(lab.unfold);
  setViewsVisible(lab.views);

  let minY = Infinity,
    maxY = -Infinity;
  for (const q of solidData.points) {
    minY = Math.min(minY, q.p[1]);
    maxY = Math.max(maxY, q.p[1]);
  }

  panel.innerHTML = '';
  panel.appendChild(el('h2', 'panel-title', '实验室'));

  const selWrap = el('div', 'lab-row');
  selWrap.appendChild(el('label', null, '几何体：'));
  const sel = el('select', 'lab-select');
  for (const c of catalog()) {
    const o = el('option', null, c.name);
    o.value = c.id;
    if (c.id === lab.solidId) o.selected = true;
    sel.appendChild(o);
  }
  sel.addEventListener('change', () => {
    lab.solidId = sel.value;
    lab.unfold = 0;
    renderLab();
  });
  selWrap.appendChild(sel);
  panel.appendChild(selWrap);

  const toggles = el('div', 'lab-row lab-toggles');
  const mkToggle = (label, checked, onChange) => {
    const l = el('label', 'lab-toggle');
    const c = document.createElement('input');
    c.type = 'checkbox';
    c.checked = checked;
    c.addEventListener('change', () => onChange(c.checked));
    l.appendChild(c);
    l.appendChild(document.createTextNode(' ' + label));
    return l;
  };
  toggles.appendChild(
    mkToggle('自转', lab.spin, (v) => {
      lab.spin = v;
      viewer.setSpin(v);
    }),
  );
  toggles.appendChild(
    mkToggle('顶点标注', lab.labels, (v) => {
      lab.labels = v;
      viewer.setLabelsVisible(v);
    }),
  );
  toggles.appendChild(
    mkToggle('三视图', lab.views, (v) => {
      lab.views = v;
      setViewsVisible(v);
    }),
  );
  toggles.appendChild(
    mkToggle('水平截面', lab.sectionOn, (v) => {
      lab.sectionOn = v;
      updateSection();
      sliderWrap.style.display = v ? '' : 'none';
    }),
  );
  panel.appendChild(toggles);

  const sliderWrap = el('div', 'lab-row lab-slider');
  sliderWrap.style.display = lab.sectionOn ? '' : 'none';
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = 0;
  slider.max = 1000;
  slider.value = Math.round(lab.t * 1000);
  const valLabel = el('span', 'muted');
  const updateVal = () => {
    const h = lab.t * (maxY - minY);
    valLabel.textContent = `截面高度 h = ${h.toFixed(2)} / ${(maxY - minY).toFixed(2)}`;
  };
  slider.addEventListener('input', () => {
    lab.t = slider.value / 1000;
    updateSection();
    updateVal();
  });
  sliderWrap.appendChild(slider);
  sliderWrap.appendChild(valLabel);
  panel.appendChild(sliderWrap);
  updateVal();

  function updateSection() {
    if (!lab.sectionOn) {
      viewer.setSection(null);
      return;
    }
    viewer.setSection({ n: [0, 1, 0], d: minY + lab.t * (maxY - minY) });
  }
  updateSection();

  // 展开图：滑杆 + 展开/收起动画按钮（球等不支持的几何体置灰）
  const unfoldable = viewer.canUnfold();
  const unfoldWrap = el('div', 'lab-row lab-slider');
  const unfoldBtn = el('button', 'btn btn-small', lab.unfold >= 1 ? '收起' : '展开');
  const unfoldSlider = document.createElement('input');
  unfoldSlider.type = 'range';
  unfoldSlider.min = 0;
  unfoldSlider.max = 1000;
  unfoldSlider.value = Math.round(lab.unfold * 1000);
  const unfoldVal = el('span', 'muted');
  const updateUnfoldVal = () => {
    unfoldVal.textContent = unfoldable
      ? `展开程度 ${(lab.unfold * 100).toFixed(0)}%`
      : '该几何体不支持展开';
    unfoldBtn.textContent = lab.unfold >= 1 ? '收起' : '展开';
  };
  const setUnfold = (v) => {
    lab.unfold = Math.min(1, Math.max(0, v));
    viewer.setUnfold(lab.unfold);
    unfoldSlider.value = Math.round(lab.unfold * 1000);
    updateUnfoldVal();
  };
  if (!unfoldable) {
    unfoldSlider.disabled = true;
    unfoldBtn.disabled = true;
  }
  unfoldSlider.addEventListener('input', () => setUnfold(unfoldSlider.value / 1000));
  unfoldBtn.addEventListener('click', () => {
    const from = lab.unfold,
      to = lab.unfold >= 1 ? 0 : 1;
    // 减少动态偏好：跳过 600ms 缓动，直接到位
    const reduce =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setUnfold(to);
      return;
    }
    // 600ms 缓动动画到 0 或 1
    const token = (lab._animToken = (lab._animToken || 0) + 1);
    const start = performance.now();
    const ease = (x) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2);
    const frame = (now) => {
      if (lab._animToken !== token) return; // 被新的动画/操作打断
      const k = Math.min(1, (now - start) / 600);
      setUnfold(from + (to - from) * ease(k));
      if (k < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });
  unfoldWrap.appendChild(unfoldBtn);
  unfoldWrap.appendChild(unfoldSlider);
  unfoldWrap.appendChild(unfoldVal);
  panel.appendChild(unfoldWrap);
  updateUnfoldVal();

  // 顶点/棱/面统计 + 欧拉公式实时验证
  const V = solidData.points.length;
  const F = solidData.faces.length;
  const E = buildEdges(solidData.faces).length;
  const euler = V - E + F;
  const stats = el('div', 'stats');
  stats.appendChild(el('div', 'stat', `<strong>${V}</strong><span>顶点 V</span>`));
  stats.appendChild(el('div', 'stat', `<strong>${E}</strong><span>棱 E</span>`));
  stats.appendChild(el('div', 'stat', `<strong>${F}</strong><span>面 F</span>`));
  panel.appendChild(stats);
  panel.appendChild(
    el(
      'div',
      `euler ${euler === 2 ? 'ok' : 'no'}`,
      `欧拉公式：V − E + F = ${V} − ${E} + ${F} = <strong>${euler}</strong>${euler === 2 ? ' ✓ 成立' : ''}`,
    ),
  );
  panel.appendChild(el('p', 'muted lab-hint', '拖动 3D 区域旋转视角，滚轮或双指缩放。'));
}
