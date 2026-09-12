#!/usr/bin/env bash
# 从 web 版项目（单一事实源）同步几何核心 / 课程题库数据 / 单元测试到本工程。
# 用法：npm run sync-core
# 注意：web 项目目录对移植工程是只读的，本脚本只从这里拷贝，不写回。
set -euo pipefail

SRC="${GEOMETRY_TUTOR_WEB:-/home/xsl/Fortune/GeometryTutor}"
DST="$(cd "$(dirname "$0")/.." && pwd)"

for f in solids topology unfold views; do
  cp "$SRC/src/geo/$f.js" "$DST/src/geo/$f.js"
done
for f in lessons quizzes; do
  cp "$SRC/src/data/$f.js" "$DST/src/data/$f.js"
done
cp "$SRC"/tests/*.test.mjs "$DST/tests/"
# content.test.mjs 会核对 tools/tts_lines.py 台词表，一并同步
cp "$SRC/tools/tts_lines.py" "$DST/tools/tts_lines.py"

echo "已同步：src/geo/{solids,topology,unfold,views}.js"
echo "已同步：src/data/{lessons,quizzes}.js"
echo "已同步：tests/*.test.mjs + tools/tts_lines.py"
