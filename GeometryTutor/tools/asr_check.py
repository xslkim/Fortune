# -*- coding: utf-8 -*-
"""用 FunASR(SenseVoiceSmall, CPU) 抽查语音转写与台词的相似度。

用法：
  /home/xsl/SoundGame/.venv-asr/bin/python tools/asr_check.py [id ...]
不带参数默认抽查 3 条（首、中、尾各一）。
"""
import difflib
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "assets", "audio", "voice")

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tts_lines import LINES  # noqa: E402


def clean(t):
    t = re.sub(r"<\|[^|]*\|>", "", t)
    return "".join(re.findall(r"[0-9a-zA-Z一-鿿]", t)).lower()


def main():
    ids = sys.argv[1:] or [LINES[0][0], LINES[len(LINES) // 2][0], LINES[-1][0]]
    expected = {fid: text for fid, _ins, text in LINES}
    from funasr import AutoModel
    model = AutoModel(model="iic/SenseVoiceSmall", vad_model=None,
                      device="cpu", disable_update=True)
    ok = True
    for fid in ids:
        path = os.path.join(OUT_DIR, fid + ".ogg")
        r = model.generate(input=path, cache={}, language="zh", use_itn=True)
        heard = clean(r[0]["text"]) if r else ""
        exp = clean(expected[fid])
        sim = difflib.SequenceMatcher(None, exp, heard).ratio()
        flag = "OK " if sim >= 0.8 else "LOW"
        if sim < 0.8:
            ok = False
        print(f"[{flag}] {fid} similarity={sim:.2f}")
        print(f"  expected: {expected[fid]}")
        print(f"  heard   : {r[0]['text'] if r else ''}")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
