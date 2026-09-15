// 「展开图闯关」进度（mp 薄包装）：纯逻辑在 @geo/core/data/netgame.js（normalizeProgress /
// isLevelUnlocked），存储走本地 engine/storage.js（uni.setStorageSync），key 与 web 一致：
// gt_netgame_v1，结构一致：{ levels: [{ stars: 0-3, passed: bool }] }，旧版星级数组按无记录处理。
import { normalizeProgress, isLevelUnlocked } from '@geo/core/data/netgame.js';
import { readRaw, writeRaw } from './storage.js';

export { normalizeProgress, isLevelUnlocked };

const NETGAME_KEY = 'netgame_v1';

export function loadProgress() {
  return normalizeProgress(readRaw(NETGAME_KEY));
}

export function saveProgress(prog) {
  writeRaw(NETGAME_KEY, prog);
}
