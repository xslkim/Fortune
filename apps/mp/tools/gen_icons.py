# 生成 tabBar 图标：4 个 tab × 2 态（普通灰 / 选中深蓝）= 8 张 81×81 透明背景 PNG。
# 用 PIL 在 4 倍分辨率（324×324）画线条图标再 LANCZOS 降采样到 81×81（抗锯齿）。
# 由 tools/gen-icons.sh 调用，可复跑。
import os
from PIL import Image, ImageDraw

SCALE = 4          # 超采样倍数
SIZE = 81          # 输出尺寸
STROKE = 4.6       # 1x 线宽
NORMAL = (0x7A, 0x86, 0x99, 255)   # #7a8699
ACTIVE = (0x1F, 0x3A, 0x5F, 255)   # #1f3a5f

OUT = os.path.join(os.path.dirname(__file__), '..', 'src', 'static', 'tabbar')


def canvas():
    img = Image.new('RGBA', (SIZE * SCALE, SIZE * SCALE), (0, 0, 0, 0))
    return img, ImageDraw.Draw(img)


def line(d, pts, color, width=STROKE):
    d.line([(x * SCALE, y * SCALE) for x, y in pts], fill=color,
           width=int(width * SCALE), joint='curve')


def dot(d, x, y, r, color):
    d.ellipse([(x - r) * SCALE, (y - r) * SCALE, (x + r) * SCALE, (y + r) * SCALE], fill=color)


def save(img, name):
    img = img.resize((SIZE, SIZE), Image.LANCZOS)
    os.makedirs(OUT, exist_ok=True)
    img.save(os.path.join(OUT, name), optimize=True)


# ---------- 课程：翻开的书 ----------
def draw_book(color):
    img, d = canvas()
    # 左右两页外轮廓（顶部内凹弧线用折线近似）
    line(d, [(12, 22), (28, 16), (40.5, 20), (53, 16), (69, 22)], color)
    line(d, [(12, 22), (12, 64), (28, 58), (40.5, 62), (53, 58), (69, 64), (69, 22)], color)
    line(d, [(40.5, 20), (40.5, 62)], color)  # 书脊中线
    return img


# ---------- 题库：清单 + 对勾 ----------
def draw_checklist(color):
    img, d = canvas()
    line(d, [(20, 12), (60, 12), (60, 70), (20, 70), (20, 12)], color)  # 板面
    for y in (26, 40):
        dot(d, 28, y, 2.2, color)
        line(d, [(36, y), (52, y)], color, width=3.6)
    # 底部对勾
    line(d, [(26, 55), (33, 62), (48, 47)], color, width=5.2)
    return img


# ---------- 错题本：笔记本 + 叉 ----------
def draw_wrongbook(color):
    img, d = canvas()
    line(d, [(24, 12), (62, 12), (62, 70), (24, 70), (24, 12)], color)  # 封面
    line(d, [(24, 12), (24, 70)], color, width=STROKE * 1.2)            # 书脊
    line(d, [(30, 18), (30, 24)], color, width=3.6)                     # 标签线
    # 中央叉号
    line(d, [(36, 36), (52, 56)], color, width=5.2)
    line(d, [(52, 36), (36, 56)], color, width=5.2)
    return img


# ---------- 实验室：立方体线框 ----------
def draw_cube(color):
    img, d = canvas()
    cx, cy, r = 40.5, 42, 26
    import math
    # 外六边形（等轴测投影外轮廓）
    hexpts = [(cx + r * math.cos(math.radians(a)), cy + r * math.sin(math.radians(a)))
              for a in (-90, -30, 30, 90, 150, 210)]
    line(d, hexpts + [hexpts[0]], color)
    # 中心点到相间三顶点（看得见的三个面交界）
    inner = [hexpts[0], hexpts[2], hexpts[4]]
    for p in inner:
        line(d, [(cx, cy), p], color)
    return img


ICONS = {
    'lessons': draw_book,
    'quiz': draw_checklist,
    'wrong': draw_wrongbook,
    'lab': draw_cube,
}

for name, draw in ICONS.items():
    save(draw(NORMAL), f'{name}.png')
    save(draw(ACTIVE), f'{name}-active.png')
    print(f'{name}: 普通+选中 已生成')
