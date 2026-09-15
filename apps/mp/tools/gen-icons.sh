#!/usr/bin/env bash
# 生成 tabBar 图标（4 tab × 2 态，81×81 透明 PNG）到 src/static/tabbar/。可复跑。
# 依赖：python3 + PIL（Pillow）。
set -euo pipefail
cd "$(dirname "$0")"
python3 gen_icons.py
ls -l ../src/static/tabbar/
