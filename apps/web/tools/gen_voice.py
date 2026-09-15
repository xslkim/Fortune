# -*- coding: utf-8 -*-
"""GeometryTutor 讲解语音生成管线（复用 SoundGame Qwen3-TTS 环境）。

台词表：tools/tts_lines.py 的 LINES = [(id, instruct, 文本), ...]
  注意：生成时统一使用 UNIFORM_INSTRUCT 覆盖逐条 instruct（语气/音色一致性，
  台词表里的 instruct 字段保留给内容方参考，不参与生成）。
输出：  assets/audio/voice/<id>.ogg (libvorbis q3, 44.1kHz)
        assets/audio/voice/<id>.m4a (AAC 128k)
  转码前先做 ffmpeg loudnorm 两遍法响度归一（I=-16 LUFS, TP=-1.5, LRA=11）。
staging wav 在 tools/tts_wav/<id>.wav（24kHz），已存在的有效 wav 会跳过，可断点续跑。

用法（WSL + GPU 串行，遵守 SoundGame 的 flock 约定；monorepo 后路径已更新）：
  cd /mnt/f/Fortune/apps/web
  PYTHONPATH=/mnt/f/Fortune/packages/core/tools flock /home/xsl/SoundGame/.gpu.lock \
    /home/xsl/SoundGame/.venv-tts/bin/python tools/gen_voice.py
  PYTHONPATH=/mnt/f/Fortune/packages/core/tools \
    /home/xsl/SoundGame/.venv-tts/bin/python tools/gen_voice.py --convert   # 无需 GPU
  只补某几条：... tools/gen_voice.py --only id1,id2（id 直接写命令行，勿用命令替换读盘）

新增台词：在 packages/core/tools/tts_lines.py 的 LINES 追加 (id, instruct, 文本) 后重跑即可
（生成幂等：已有 wav 跳过；--convert 只按台词表落地）。
"""
import argparse
import os
import subprocess
import sys

SOUNDGAME_TOOLS = "/home/xsl/SoundGame/tools"
sys.path.insert(0, SOUNDGAME_TOOLS)
# 复用 gen_voice_dual 的拆句/校验/常量（import 时顺带设好 HF_HOME/HF_ENDPOINT）
from gen_voice_dual import split_text, valid_wav, GAP_SEC, PEAK_NORM, BATCH_LONG  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STAGING = os.path.join(ROOT, "tools", "tts_wav")
OUT_DIR = os.path.join(ROOT, "assets", "audio", "voice")
SPEAKER = "Serena"  # 温暖柔和的年轻女声，贴合数学老师人设
# 统一 instruct：全量重录后逐条 instruct 差异是音色/韵律漂移的来源之一，强制覆盖。
UNIFORM_INSTRUCT = "耐心的中学数学老师，语气温和清晰，语速平稳"
# loudnorm 两遍法目标（转码环节，见 convert）
LOUDNESS = {"I": "-16", "TP": "-1.5", "LRA": "11"}

_HERE = os.path.dirname(os.path.abspath(__file__))
_ROOT = os.path.dirname(os.path.dirname(_HERE))  # apps/web
# 台词表单一事实源在 packages/core/tools（monorepo）；保留本目录兼容旧布局
for _p in (os.path.join(_ROOT, '..', '..', 'packages', 'core', 'tools'), _HERE):
    if os.path.isfile(os.path.join(_p, 'tts_lines.py')):
        sys.path.insert(0, _p)
        break
from tts_lines import LINES  # noqa: E402


def generate(only):
    import numpy as np
    import soundfile as sf
    import torch
    from qwen_tts import Qwen3TTSModel

    os.makedirs(STAGING, exist_ok=True)
    lines = [x for x in LINES if not only or x[0] in only]

    model = Qwen3TTSModel.from_pretrained(
        "Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice",
        device_map="cuda:0",
        dtype=torch.bfloat16,
    )
    print("model loaded", flush=True)

    # 展开成 (fid, chunk_idx, n_chunks, text, instruct)，跳过已完成
    # instruct 统一覆盖为 UNIFORM_INSTRUCT（忽略台词表逐条差异，避免韵律漂移）
    items = []
    for fid, _instruct, text in lines:
        path = os.path.join(STAGING, fid + ".wav")
        if valid_wav(path):
            continue
        chunks = split_text(text)
        for ci, ctext in enumerate(chunks):
            items.append((fid, ci, len(chunks), ctext, UNIFORM_INSTRUCT))
    if not items:
        print("nothing to do", flush=True)
        return

    results = {}  # fid -> {chunk_idx: wav}
    queue = [items[i:i + BATCH_LONG] for i in range(0, len(items), BATCH_LONG)]
    for bi, batch in enumerate(queue):
        wavs, sr = model.generate_custom_voice(
            text=[b[3] for b in batch],
            language=["Chinese"] * len(batch),
            speaker=[SPEAKER] * len(batch),
            instruct=[b[4] for b in batch],
            max_new_tokens=2048,
        )
        for (fid, ci, _n, _t, _i), wav in zip(batch, wavs):
            results.setdefault(fid, {})[ci] = np.asarray(wav, dtype=np.float32)
        print(f"batch {bi + 1}/{len(queue)} (n={len(batch)})", flush=True)

    gap = np.zeros(int(GAP_SEC * sr), dtype=np.float32)
    for fid, _instruct, text in lines:
        path = os.path.join(STAGING, fid + ".wav")
        if valid_wav(path):
            continue
        got = results.get(fid, {})
        n_chunks = len(split_text(text))
        assert len(got) == n_chunks, f"{fid}: 缺 chunk {len(got)}/{n_chunks}"
        wav = got[0]
        for ci in range(1, n_chunks):
            wav = np.concatenate([wav, gap, got[ci]])
        peak = float(np.max(np.abs(wav)))
        assert peak > 0.05, f"{fid}: peak {peak:.3f}"
        wav = wav / peak * PEAK_NORM
        dur = len(wav) / sr
        assert dur > 0.3, f"{fid}: dur {dur:.2f}s"
        sf.write(path, wav, sr)
        print(f"[ok] {fid}  {dur:.2f}s chunks={n_chunks}", flush=True)


def _loudnorm_filter(src):
    """第一遍测量，返回带 measured_* 参数的 loudnorm 滤镜串（linear 模式）。"""
    import json
    import re
    target = f"loudnorm=I={LOUDNESS['I']}:TP={LOUDNESS['TP']}:LRA={LOUDNESS['LRA']}"
    p = subprocess.run(["ffmpeg", "-v", "info", "-i", src,
                        "-af", target + ":print_format=json", "-f", "null", "-"],
                       capture_output=True, text=True, check=True)
    m = re.search(r"\{\s*\"input_i\".*?\}", p.stderr, re.S)
    meas = json.loads(m.group(0))
    return (target +
            f":measured_I={meas['input_i']}:measured_TP={meas['input_tp']}"
            f":measured_LRA={meas['input_lra']}:measured_thresh={meas['input_thresh']}"
            f":offset={meas['target_offset']}:linear=true")


def convert(only):
    os.makedirs(OUT_DIR, exist_ok=True)
    total = 0
    for fid, _instruct, _text in LINES:
        if only and fid not in only:
            continue
        src = os.path.join(STAGING, fid + ".wav")
        if not os.path.exists(src):
            print(f"[convert] WARN missing {fid}.wav")
            continue
        base = os.path.join(OUT_DIR, fid)
        af = _loudnorm_filter(src)
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", src, "-af", af,
                        "-ar", "44100", "-c:a", "libvorbis", "-q:a", "3", base + ".ogg"], check=True)
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", src, "-af", af,
                        "-ar", "44100", "-c:a", "aac", "-b:a", "128k", base + ".m4a"], check=True)
        total += 1
    print(f"converted {total} ids (loudnorm I={LOUDNESS['I']} LUFS, ogg+m4a each)")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--convert", action="store_true", help="只做 staging wav -> ogg/m4a 转码，不用 GPU")
    ap.add_argument("--only", default="", help="逗号分隔的 id 列表，只处理这些")
    args = ap.parse_args()
    only = set(x for x in args.only.split(",") if x)
    if args.convert:
        convert(only)
    else:
        generate(only)


if __name__ == "__main__":
    main()
