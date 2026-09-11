# -*- coding: utf-8 -*-
"""GeometryTutor 讲解语音生成管线（复用 SoundGame Qwen3-TTS 环境）。

台词表：tools/tts_lines.py 的 LINES = [(id, instruct, 文本), ...]
输出：  assets/audio/voice/<id>.ogg (libvorbis q3, 44.1kHz)
        assets/audio/voice/<id>.m4a (AAC 128k)
staging wav 在 tools/tts_wav/<id>.wav（24kHz），已存在的有效 wav 会跳过，可断点续跑。

用法（GPU 串行，遵守 SoundGame 的 flock 约定）：
  cd /home/xsl/Fortune/GeometryTutor
  flock /home/xsl/SoundGame/.gpu.lock \
    /home/xsl/SoundGame/.venv-tts/bin/python tools/gen_voice.py
  /home/xsl/SoundGame/.venv-tts/bin/python tools/gen_voice.py --convert   # 无需 GPU
  只补某几条：... tools/gen_voice.py --only id1,id2

新增台词：在 tools/tts_lines.py 的 LINES 追加 (id, instruct, 文本) 后重跑即可
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

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
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
    items = []
    for fid, instruct, text in lines:
        path = os.path.join(STAGING, fid + ".wav")
        if valid_wav(path):
            continue
        chunks = split_text(text)
        for ci, ctext in enumerate(chunks):
            items.append((fid, ci, len(chunks), ctext, instruct))
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
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", src,
                        "-ar", "44100", "-c:a", "libvorbis", "-q:a", "3", base + ".ogg"], check=True)
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", src,
                        "-ar", "44100", "-c:a", "aac", "-b:a", "128k", base + ".m4a"], check=True)
        total += 1
    print(f"converted {total} ids (ogg+m4a each)")


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
