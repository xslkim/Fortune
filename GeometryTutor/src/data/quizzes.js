// 题库：30 题（q01-q10 难度 1/1/1/2/2/2/2/3/3/3；q11-q30 难度 1×4、2×10、3×6 梯度分布）。
// 每题 explain 至少 2 步：第 1 步给关键思路，第 2 步给完整计算（个别题第 3 步补充易错点）。
//
// ===== 每题验算过程（出题人自验）=====
// q01 正方体棱长 2，面对角线：√(2²+2²) = √8 = 2√2。✓ 答案 B
// q02 圆锥侧面沿母线剪开摊平 = 扇形（弧长=底面周长 2πr，半径=母线 l）。
//     圆柱侧面展开是长方形，三棱柱侧面展开是长方形（三个小长方形拼成），球没有平面展开图。✓ 答案 C
// q03 三棱柱：V=6（上下各 3），E=9（底 3+顶 3+侧棱 3），F=5（2 底面+3 侧面）。
//     欧拉验证：6−9+5=2 ✓。棱数 9。✓ 答案 C
// q04 长方体 3×4×5：S表 = 2(3·4 + 3·5 + 4·5) = 2(12+15+20) = 2×47 = 94。✓ 答案 B
// q05 正方体棱长 2，体对角线：√(2²+2²+2²) = √12 = 2√3（=面对角线²+侧棱²=8+4）。✓ 答案 C
// q06 直三棱柱：底面直角三角形直角边 3、4，S=(3×4)/2=6，高=侧棱=5，V=Sh=6×5=30。✓ 答案 B
// q07 四棱锥：底面边长 4 的正方形 S=16，高 3，V=Sh/3=(16×3)/3=16。✓ 答案 A
// q08 圆锥 r=3, h=4：V=⅓·πr²·h=⅓·π·9·4=12π。（母线 l=√(3²+4²)=5 为干扰信息）✓ 答案 A
// q09 平面截正方体：截面边数=平面与几个面相交；正方体共 6 个面，故边数 ∈ {3,4,5,6}，
//     七边形不可能。✓ 答案 D
// q10 同底等高：V柱 = Sh，V锥 = Sh/3，V柱 = 3·V锥。和 = 4·V锥 = 48π → V锥 = 12π，V柱 = 36π。✓ 答案 B
// q11 圆柱轴竖直放置：主视图、左视图是长方形，俯视图（从上向下投影）= 底面圆。✓ 答案 A
// q12 三视图都是圆的几何体只有球；圆柱俯视是圆但主视图是长方形，圆锥主视图是三角形。✓ 答案 C
// q13 三视图都是全等正方形 → 正方体；球三视图是圆，长方体三视图是一般长方形，圆柱含圆。✓ 答案 B
// q14 正方体展开图：由 6 个正方形组成（A 错）；相对面折叠后相对，展开图中无公共边（B 错）；
//     本质不同的展开图共 11 种（C 对）；含"田"字形等连法折不成（D 错）。✓ 答案 C
// q15 展开图同行（列）中间隔一个格子的两个面折叠后相对——教材标准结论。✓ 答案 B
// q16 "一四一"、"二三一"、"三三"都在 11 种展开图之列；含"田"字形的六连方折叠时必有两面重叠，不能。✓ 答案 D
// q17 圆柱侧面展开：一边 = 底面周长 2πr = 2π，另一边 = 高 3。✓ 答案 B
// q18 球 r=3：S = 4πr² = 4π·9 = 36π。✓ 答案 C
// q19 球 r=3：V = (4/3)πr³ = (4/3)π·27 = 36π。✓ 答案 A
// q20 正方体棱长 2 的外接球：直径 = 体对角线 2√3 → R = √3，S = 4πR² = 4π·3 = 12π。✓ 答案 B
// q21 线面平行判定定理：平面外一条直线平行于平面内一条直线 → 线面平行。其余选项
//     （垂直面内一线 / 与面有一个公共点 / 线在面内）均不能推出 a∥α。✓ 答案 A
// q22 线面垂直判定定理：需垂直面内两条【相交】直线；一条、两条平行、三条两两平行都"卡不住"平面方向。✓ 答案 C
// q23 逐对检验（cube 坐标）：AB∥CD（同向 x 轴），AA₁∥CC₁（均竖直），AC∥A₁C₁（同在对角面内平行）；
//     AB（y=0,z=−1，沿 x 向）与 B₁C₁（x=1,y=2，沿 z 向）不平行不相交 → 异面。✓ 答案 C
// q24 圆锥轴截面 = 等腰三角形：底 = 2r = 6，高 = 锥高 h = 4，面积 = ½×6×4 = 12。（母线 5 为干扰）✓ 答案 A
// q25 正方体 12 条棱中：AB 本身 1 条；与 AB 平行 3 条（CD、A₁B₁、C₁D₁）；与 AB 相交 4 条
//     （AD、AA₁ 交于 A；BC、BB₁ 交于 B）；其余 12−1−3−4 = 4 条（CC₁、DD₁、A₁D₁、B₁C₁）与 AB 异面。✓ 答案 C
// q26 对角面 ACC₁A₁：宽 AC = 2√2（底面对角线），高 = 侧棱 2，面积 = 2√2 × 2 = 4√2。✓ 答案 B
// q27 圆台 R=2、r=1、h=3：V = ⅓πh(R²+Rr+r²) = ⅓π·3·(4+2+1) = 7π。✓ 答案 A
// q28 组合体：圆柱 π·2²·3 = 12π，圆锥 ⅓·π·2²·3 = 4π，合计 16π。✓ 答案 B
// q29 三条侧棱两两垂直且长均为 1 的三棱锥 = 单位正方体的"墙角"：外接球即该正方体外接球，
//     直径 = 体对角线 √3，R = √3/2。（验证：球心 (½,½,½)，到各顶点距离 √(3/4) = √3/2）✓ 答案 B
// q30 正方体 2³ = 8；圆柱孔 π·1²·2 = 2π；剩余 8 − 2π。✓ 答案 B
//
// q31-q50 坐标题统一以 D 为原点、DA/DC/DD₁ 为 x/y/z 轴（棱长 2）：
// D(0,0,0) A(2,0,0) C(0,2,0) B(2,2,0) D₁(0,0,2) A₁(2,0,2) B₁(2,2,2) C₁(0,2,2)
// q31 主/左视图为三角形、俯视图为带中心点的圆（锥顶投影）→ 圆锥。✓ 答案 A
// q32 俯视图四格层数 1+2+2+3 = 8 个小正方体。✓ 答案 C
// q33 主视图宽 4 = 底面直径 → r=2，高 5：V = π·2²·5 = 20π。✓ 答案 B
// q34 主视等腰三角形底 6、腰 5 → r=3、l=5、h=√(25−9)=4：V = ⅓π·9·4 = 12π。✓ 答案 A
// q35 C₁ = C + (0,0,2) = (0,2,2)。✓ 答案 A
// q36 AB = B − A = (2,2,0) − (2,0,0) = (0,2,0)。✓ 答案 A
// q37 a·b = 1·2 + 2·(−1) + (−1)·0 = 0 → 垂直。✓ 答案 A
// q38 a·b = 1，|a|=|b|=√2，cos = 1/2 → 60°。✓ 答案 C
// q39 法向量需与 u=(1,0,0)、v=(0,1,1) 点积均为 0：(0,1,−1)：0+1−1=0 ✓；其余逐项点积非零。✓ 答案 B
// q40 AC₁ = C₁ − A = (0,2,2) − (2,0,0) = (−2,2,2)。✓ 答案 A
// q41 线面角：AC₁=(−2,2,2)，底面法向量 n=(0,0,1)，sin θ = |2|/(2√3·1) = 1/√3 = √3/3。
//     几何验证：投影 AC=2√2，tan θ = CC₁/AC = 2/(2√2) → sin = 1/√3。✓ 答案 A
// q42 二面角：面 ABC₁ 内 AB=(0,1,0)、BC₁=(−1,0,1)，法向量 n₁=AB×BC₁=(1,0,1)；底面 n₂=(0,0,1)，
//     |cos| = 1/√2 → 45°。几何验证：AB⊥BC 且 AB⊥BC₁，二面角 = ∠C₁BC = arctan(2/2) = 45°。✓ 答案 B
// q43 异面直线 AB 与 A₁C：AB=(0,2,0)，A₁C=(−2,2,−2)，cos = |4|/(2·2√3) = √3/3，
//     所成角 = arccos(√3/3)。✓ 答案 A
// q44 俯视图为圆环（两同心圆）+ 主左视图长方形 → 空心圆柱（圆筒）；实心圆柱俯视图是整圆。✓ 答案 B
// q45 DB₁=(2,2,2)，AC=(−2,2,0)，点积 = −4+4+0 = 0（体对角线⊥该面对角线）。✓ 答案 A
// q46 A₁B=(0,2,−2)，sin θ = |−2|/(2√2) = √2/2 → 45°。几何：投影 AB 长 2、竖直落差 2 → 45°。✓ 答案 B
// q47 A₁B=(0,2,−2)，B₁C=(−2,0,−2)，cos = |0+0+4|/(2√2·2√2) = 1/2 → 60°。✓ 答案 C
// q48 |a| = √(4+1+4) = √9 = 3。✓ 答案 B
// q49 三视图读出 r=1、柱高 2、锥高 3：V = π·1·2 + ⅓π·1·3 = 2π + π = 3π。✓ 答案 B
// q50 AC₁=(−1,1,1)（方向）：·DA₁ = (2,0,2)·(−1,1,1) = −2+0+2 = 0；·DB = (2,2,0)·(−1,1,1) = −2+2+0 = 0；
//     DA₁ 与 DB 相交于 D → AC₁ ⊥ 平面 A₁BD（体对角线⊥三条面对角线构成的截面，经典结论）。✓ 答案 A

export const QUIZZES = [
  {
    id: 'q01',
    title: '正方体的面对角线',
    solid: 'cube',
    difficulty: 1,
    question: '正方体的棱长为 2，则它的一个面的<b>面对角线</b>（如前图中 AB<sub>1</sub>）的长为多少？',
    scene: {
      highlight: { points: ['A', 'B1'], edges: [['A', 'B'], ['B', 'B1'], ['A', 'B1']], faces: [2] },
      spin: false,
      section: null,
    },
    answer: {
      type: 'choice',
      options: ['√2', '2√2', '2√3', '4'],
      correct: 1,
    },
    explain: [
      {
        text: '<b>关键思路</b>：面对角线与两条棱构成一个直角三角形（这里是 △ABB<sub>1</sub>，直角在 B），直接用勾股定理。',
        audio: 'q01-ex1',
        scene: {
          highlight: { points: ['A', 'B', 'B1'], edges: [['A', 'B'], ['B', 'B1'], ['A', 'B1']], faces: [2] },
          spin: false,
          section: null,
        },
      },
      {
        text: '<b>完整计算</b>：AB = BB<sub>1</sub> = 2，所以 AB<sub>1</sub> = √(2<sup>2</sup> + 2<sup>2</sup>) = √8 = <b>2√2</b>。<br>结论：棱长为 a 的正方体，面对角线 = a√2。',
        audio: 'q01-ex2',
        scene: {
          highlight: { points: ['A', 'B1'], edges: [['A', 'B1']], faces: [2] },
          spin: false,
          section: null,
        },
      },
    ],
  },
  {
    id: 'q02',
    title: '侧面展开图判断',
    solid: 'cone',
    difficulty: 1,
    question: '下列几何体中，沿一条母线（或侧棱）剪开后，<b>侧面展开图是扇形</b>的是哪一个？',
    scene: { highlight: { points: ['P'], edges: [], faces: [0] }, spin: true, section: null },
    answer: {
      type: 'choice',
      options: ['圆柱', '三棱柱', '圆锥', '球'],
      correct: 2,
    },
    explain: [
      {
        text: '<b>关键思路</b>：想象把曲面沿一条母线剪开摊平。圆锥的侧面从锥顶 P 展开，所有母线等长，摊平后是一个<b>扇形</b>。',
        audio: 'q02-ex1',
        scene: { highlight: { points: ['P', 'A'], edges: [['A', 'P']], faces: [] }, spin: true, section: null },
      },
      {
        text: '<b>逐项分析</b>：圆柱侧面展开是<b>长方形</b>；三棱柱侧面展开是三个小长方形拼成的<b>大长方形</b>；球面根本不能摊成平面图形。<br>只有圆锥的侧面展开图是扇形（扇形弧长 = 底面周长，半径 = 母线），选 <b>C</b>。',
        audio: 'q02-ex2',
        scene: { highlight: { points: ['P'], edges: [], faces: [0] }, spin: true, section: null },
      },
    ],
  },
  {
    id: 'q03',
    title: '欧拉公式计数',
    solid: 'prism3',
    difficulty: 1,
    question: '三棱柱的棱的条数是多少？（提示：数一数底面、顶面和侧面各有几条棱）',
    scene: {
      highlight: {
        points: [],
        edges: [
          ['A', 'B'], ['B', 'C'], ['C', 'A'],
          ['A1', 'B1'], ['B1', 'C1'], ['C1', 'A1'],
          ['A', 'A1'], ['B', 'B1'], ['C', 'C1'],
        ],
        faces: [],
      },
      spin: true,
      section: null,
    },
    answer: {
      type: 'choice',
      options: ['6', '8', '9', '12'],
      correct: 2,
    },
    explain: [
      {
        text: '<b>关键思路</b>：分类数棱——底面 n 条、顶面 n 条、侧棱 n 条，n 棱柱共 3n 条棱。',
        audio: 'q03-ex1',
        scene: {
          highlight: { points: [], edges: [['A', 'A1'], ['B', 'B1'], ['C', 'C1']], faces: [] },
          spin: true,
          section: null,
        },
      },
      {
        text: '<b>完整计算</b>：三棱柱 n = 3，棱数 = 3 × 3 = <b>9</b>。<br>用欧拉公式验证：V = 6，F = 5，E = V + F − 2 = 6 + 5 − 2 = 9，一致，选 <b>C</b>。',
        audio: 'q03-ex2',
        scene: {
          highlight: {
            points: [],
            edges: [
              ['A', 'B'], ['B', 'C'], ['C', 'A'],
              ['A1', 'B1'], ['B1', 'C1'], ['C1', 'A1'],
              ['A', 'A1'], ['B', 'B1'], ['C', 'C1'],
            ],
            faces: [],
          },
          spin: true,
          section: null,
        },
      },
    ],
  },
  {
    id: 'q04',
    title: '长方体的表面积',
    solid: 'box',
    difficulty: 2,
    question: '长方体的长、宽、高分别为 3、4、5，则它的<b>表面积</b>为多少？',
    scene: { highlight: { points: [], edges: [], faces: [0, 1, 2, 3, 4, 5] }, spin: true, section: null },
    answer: {
      type: 'choice',
      options: ['47', '94', '60', '120'],
      correct: 1,
    },
    explain: [
      {
        text: '<b>关键思路</b>：长方体 6 个面两两全等，表面积 = 2 × (三种不同面的面积之和) = 2(ab + ac + bc)。',
        audio: 'q04-ex1',
        scene: { highlight: { points: [], edges: [], faces: [0, 1, 2] }, spin: false, section: null },
      },
      {
        text: '<b>完整计算</b>：3×4 = 12，3×5 = 15，4×5 = 20，相加得 47。<br>S<sub>表</sub> = 2 × 47 = <b>94</b>，选 <b>B</b>。注意 60 是<b>体积</b>（3×4×5），47 忘了乘 2，都是经典陷阱。',
        audio: 'q04-ex2',
        scene: { highlight: { points: [], edges: [], faces: [0, 1, 2, 3, 4, 5] }, spin: false, section: null },
      },
    ],
  },
  {
    id: 'q05',
    title: '正方体的体对角线',
    solid: 'cube',
    difficulty: 2,
    question: '正方体的棱长为 2，则<b>体对角线</b>（如 AC<sub>1</sub>）的长为多少？',
    scene: {
      highlight: { points: ['A', 'C1'], edges: [['A', 'C'], ['C', 'C1'], ['A', 'C1']], faces: [] },
      spin: true,
      section: null,
    },
    answer: {
      type: 'choice',
      options: ['2√2', '3√2', '2√3', '6'],
      correct: 2,
    },
    explain: [
      {
        text: '<b>关键思路</b>：体对角线 AC<sub>1</sub>、底面对角线 AC 和侧棱 CC<sub>1</sub> 构成直角三角形（CC<sub>1</sub> ⊥ 底面，所以直角在 C），分两次用勾股定理。',
        audio: 'q05-ex1',
        scene: {
          highlight: { points: ['A', 'C', 'C1'], edges: [['A', 'C'], ['C', 'C1'], ['A', 'C1']], faces: [] },
          spin: true,
          section: null,
        },
      },
      {
        text: '<b>完整计算</b>：底面对角线 AC = 2√2，于是 AC<sub>1</sub> = √(AC<sup>2</sup> + CC<sub>1</sub><sup>2</sup>) = √(8 + 4) = √12 = <b>2√3</b>。<br>结论：棱长为 a 的正方体，体对角线 = a√3，选 <b>C</b>。别和面对角线 a√2 混淆。',
        audio: 'q05-ex2',
        scene: {
          highlight: { points: ['A', 'C1'], edges: [['A', 'C1']], faces: [] },
          spin: true,
          section: null,
        },
      },
    ],
  },
  {
    id: 'q06',
    title: '三棱柱的体积',
    solid: 'prism3',
    difficulty: 2,
    question: '直三棱柱的底面是两条直角边为 3 和 4 的直角三角形，侧棱长为 5，则它的体积为多少？',
    scene: { highlight: { points: [], edges: [['A', 'B'], ['B', 'C'], ['C', 'A']], faces: [0] }, spin: true, section: null },
    answer: {
      type: 'choice',
      options: ['20', '30', '60', '15'],
      correct: 1,
    },
    explain: [
      {
        text: '<b>关键思路</b>：柱体体积 V = Sh。底面是直角三角形，两条直角边就是它的底和高；侧棱长 5 是棱柱的高 h。',
        audio: 'q06-ex1',
        scene: { highlight: { points: [], edges: [['A', 'A1']], faces: [0] }, spin: true, section: null },
      },
      {
        text: '<b>完整计算</b>：S = (3 × 4)/2 = 6，V = Sh = 6 × 5 = <b>30</b>，选 <b>B</b>。<br>陷阱：60 是忘了底面三角形要除以 2（直接 3×4×5）。',
        audio: 'q06-ex2',
        scene: { highlight: { points: [], edges: [], faces: [0, 1] }, spin: true, section: null },
      },
    ],
  },
  {
    id: 'q07',
    title: '四棱锥的体积',
    solid: 'pyramid4',
    difficulty: 2,
    question: '四棱锥的底面是边长为 4 的正方形，高为 3，则它的体积为多少？',
    scene: { highlight: { points: ['P'], edges: [], faces: [0] }, spin: true, section: null },
    answer: {
      type: 'choice',
      options: ['16', '48', '24', '12'],
      correct: 0,
    },
    explain: [
      {
        text: '<b>关键思路</b>：锥体体积 V = Sh/3。底面是正方形，S 好求；高 h = 3 已知——千万别忘记除以 3。',
        audio: 'q07-ex1',
        scene: { highlight: { points: ['P'], edges: [], faces: [0] }, spin: true, section: null },
      },
      {
        text: '<b>完整计算</b>：S = 4 × 4 = 16，V = Sh/3 = (16 × 3)/3 = <b>16</b>，选 <b>A</b>。<br>对照：同底等高的四棱柱体积是 48，恰为 3 倍——48 正是忘除 3 的陷阱答案。',
        audio: 'q07-ex2',
        scene: { highlight: { points: ['P'], edges: [['P', 'A'], ['P', 'B'], ['P', 'C'], ['P', 'D']], faces: [0] }, spin: true, section: null },
      },
    ],
  },
  {
    id: 'q08',
    title: '圆锥的体积',
    solid: 'cone',
    difficulty: 3,
    question: '圆锥的底面半径为 3，高为 4，母线长为 5，则它的体积为多少？',
    scene: { highlight: { points: ['P', 'A'], edges: [['A', 'P']], faces: [0] }, spin: true, section: null },
    answer: {
      type: 'choice',
      options: ['12π', '36π', '20π', '48π'],
      correct: 0,
    },
    explain: [
      {
        text: '<b>关键思路</b>：圆锥体积 V = πr<sup>2</sup>h/3，用的是<b>高 h = 4</b>；母线 5 是求侧面积用的，这里是干扰信息（3-4-5 恰好构成直角三角形）。',
        audio: 'q08-ex1',
        scene: { highlight: { points: ['P', 'A'], edges: [['A', 'P']], faces: [0] }, spin: true, section: null },
      },
      {
        text: '<b>完整计算</b>：V = (π × 3<sup>2</sup> × 4)/3 = 36π/3 = <b>12π</b>，选 <b>A</b>。<br>陷阱：36π 是忘除 3；若误用母线 5 当高会得 15π（选项里没有，所以算出来对不上时要回头检查）。',
        audio: 'q08-ex2',
        scene: { highlight: { points: ['P'], edges: [], faces: [0] }, spin: true, section: null },
      },
    ],
  },
  {
    id: 'q09',
    title: '正方体截面的边数',
    solid: 'cube',
    difficulty: 3,
    question: '用一个平面去截正方体，截面多边形的边数<b>不可能</b>是下列哪一个？',
    scene: {
      highlight: { points: [], edges: [], faces: [0, 2, 4, 5] },
      spin: true,
      section: { n: [1, 1, 0], d: 0.5 },
    },
    answer: {
      type: 'choice',
      options: ['3', '4', '6', '7'],
      correct: 3,
    },
    explain: [
      {
        text: '<b>关键思路</b>：截面的每条边都是平面与正方体<b>某一个面</b>的交线——与几个面相交，截面就是几边形。',
        audio: 'q09-ex1',
        scene: {
          highlight: { points: [], edges: [], faces: [0, 2, 4, 5] },
          spin: true,
          section: { n: [1, 1, 0], d: 0.5 },
        },
      },
      {
        text: '<b>完整推理</b>：正方体只有 6 个面，一个平面最多与全部 6 个面相交，所以截面边数最多为 <b>6</b>。<br>三角形、四边形（图中斜截面）、五边形、六边形都能截出来，<b>七边形不可能</b>，选 <b>D</b>。',
        audio: 'q09-ex2',
        scene: { highlight: { points: [], edges: [], faces: [0, 1, 2, 3, 4, 5] }, spin: true, section: null },
      },
    ],
  },
  {
    id: 'q10',
    title: '同底等高的柱与锥',
    solid: 'cylinder',
    difficulty: 3,
    question: '一个圆柱和一个圆锥<b>同底等高</b>，它们的体积之和为 48π，则圆柱的体积为多少？',
    scene: { highlight: { points: [], edges: [], faces: [0, 1] }, spin: true, section: null },
    answer: {
      type: 'choice',
      options: ['12π', '36π', '16π', '24π'],
      correct: 1,
    },
    explain: [
      {
        text: '<b>关键思路</b>：同底等高 ⇒ V<sub>柱</sub> = Sh，V<sub>锥</sub> = Sh/3，所以 V<sub>柱</sub> = 3·V<sub>锥</sub>。把体积和按 3 : 1 分配即可。',
        audio: 'q10-ex1',
        scene: { highlight: { points: [], edges: [], faces: [0, 1] }, spin: true, section: null },
      },
      {
        text: '<b>完整计算</b>：设 V<sub>锥</sub> = x，则 V<sub>柱</sub> = 3x，x + 3x = 48π，解得 x = 12π。<br>V<sub>柱</sub> = 3 × 12π = <b>36π</b>，选 <b>B</b>。12π 是圆锥的体积，审题要看清问的是谁。',
        audio: 'q10-ex2',
        scene: { highlight: { points: ['A', 'A1'], edges: [], faces: [0, 1] }, spin: true, section: null },
      },
    ],
  },
  {
    id: 'q11',
    title: '圆柱的三视图',
    solid: 'cylinder',
    difficulty: 1,
    question: '一个圆柱竖直放置（轴线竖直），它的主视图和左视图都是长方形，则它的<b>俯视图</b>是什么图形？',
    scene: { highlight: { points: [], edges: [], faces: [1] }, spin: true, section: null },
    answer: {
      type: 'choice',
      options: ['圆', '长方形', '正方形', '圆环'],
      correct: 0,
    },
    explain: [
      {
        text: '<b>关键思路</b>：俯视图是"从上往下看"的投影。竖放的圆柱，从上往下正好看到上底面。',
        audio: 'q11-ex1',
        scene: { highlight: { points: [], edges: [], faces: [1] }, spin: false, section: null },
      },
      {
        text: '<b>完整分析</b>：俯视方向沿轴线，投影就是底面的<b>圆</b>，选 <b>A</b>。<br>主视、左视方向与轴线垂直，所以看到长方形——三视图要分方向记忆。',
        audio: 'q11-ex2',
        scene: { highlight: { points: [], edges: [], faces: [0, 1] }, spin: true, section: null },
      },
    ],
  },
  {
    id: 'q12',
    title: '三视图都是圆',
    solid: 'sphere',
    difficulty: 1,
    question: '下列几何体中，<b>主视图、左视图、俯视图都是圆</b>的是哪一个？',
    scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
    answer: {
      type: 'choice',
      options: ['圆柱', '圆锥', '球', '圆台'],
      correct: 2,
    },
    explain: [
      {
        text: '<b>关键思路</b>：三视图全是圆，意味着从任何方向看轮廓都是圆——只有球有这种"处处对称"的性质。',
        audio: 'q12-ex1',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
      },
      {
        text: '<b>逐项排除</b>：圆柱主视图是长方形；圆锥主视图是三角形；圆台主视图是梯形。<br>只有球的三个视图都是圆，选 <b>C</b>。',
        audio: 'q12-ex2',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
      },
    ],
  },
  {
    id: 'q13',
    title: '三视图都是正方形',
    solid: 'cube',
    difficulty: 1,
    question: '一个几何体的主视图、左视图、俯视图都是<b>全等的正方形</b>，则这个几何体是？',
    scene: { highlight: { points: [], edges: [], faces: [0, 1, 2, 3, 4, 5] }, spin: true, section: null },
    answer: {
      type: 'choice',
      options: ['长方体', '正方体', '球', '圆柱'],
      correct: 1,
    },
    explain: [
      {
        text: '<b>关键思路</b>：视图都是正方形，说明几何体在三个方向上的"轮廓"都是等边的四边形。',
        audio: 'q13-ex1',
        scene: { highlight: { points: [], edges: [], faces: [2] }, spin: false, section: null },
      },
      {
        text: '<b>逐项排除</b>：球的视图是圆；长方体的视图是一般长方形（长宽不一定相等）；圆柱含圆形视图。<br>只有<b>正方体</b>三个视图都是全等正方形，选 <b>B</b>。',
        audio: 'q13-ex2',
        scene: { highlight: { points: [], edges: [], faces: [0, 1, 2, 3, 4, 5] }, spin: true, section: null },
      },
    ],
  },
  {
    id: 'q14',
    title: '展开图的说法判断',
    solid: 'cube',
    difficulty: 1,
    question: '关于正方体的展开图，下列说法<b>正确</b>的是哪一个？',
    scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null, unfold: 1 },
    answer: {
      type: 'choice',
      options: [
        '展开图由 5 个正方形组成',
        '相对的两个面在展开图中一定有公共边',
        '本质不同的展开图共有 11 种',
        '任意 6 个相连的正方形都能折成正方体',
      ],
      correct: 2,
    },
    explain: [
      {
        text: '<b>关键思路</b>：回忆展开图的基本事实——正方体有 6 个面，展开图必是 6 个正方形；选不同的棱剪开，形状不同。',
        audio: 'q14-ex1',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null, unfold: 0.5 },
      },
      {
        text: '<b>逐项分析</b>：展开图是 <b>6</b> 个正方形（A 错）；相对面在展开图中<b>没有</b>公共边（B 错）；含"田"字形等连法折不成（D 错）。<br>正方体本质不同的展开图共 <b>11 种</b>，选 <b>C</b>。',
        audio: 'q14-ex2',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null, unfold: 1 },
      },
    ],
  },
  {
    id: 'q15',
    title: '展开图中的相对面',
    solid: 'cube',
    difficulty: 2,
    question: '在正方体的展开图中，同一行（或同一列）上、<b>中间恰好隔一个正方形</b>的两个面，折叠后是？',
    scene: { highlight: { points: [], edges: [], faces: [2, 4] }, spin: true, section: null, unfold: 1 },
    answer: {
      type: 'choice',
      options: ['相邻的面', '相对的面', '重合的面', '无法确定'],
      correct: 1,
    },
    explain: [
      {
        text: '<b>关键思路</b>：想象中间那个面固定不动，两侧的面各自向上翻起 90°——它们恰好分居两侧、互相平行。',
        audio: 'q15-ex1',
        scene: { highlight: { points: [], edges: [], faces: [2, 4] }, spin: false, section: null, unfold: 0.5 },
      },
      {
        text: '<b>结论</b>：同一行（列）隔一个格子的两个面折叠后<b>相对</b>，选 <b>B</b>。<br>例如正方体的前面与后面（图中高亮）就是一对相对面。这是展开图找相对面最常用的口诀。',
        audio: 'q15-ex2',
        scene: { highlight: { points: [], edges: [], faces: [2, 4] }, spin: true, section: null, unfold: 0 },
      },
    ],
  },
  {
    id: 'q16',
    title: '能否折成正方体',
    solid: 'cube',
    difficulty: 2,
    question: '下列由 6 个正方形连成的图形中，<b>不能</b>折成正方体的是哪一种？',
    scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null, unfold: 1 },
    answer: {
      type: 'choice',
      options: ['"一四一"型', '"二三一"型', '"三三"型', '含"田"字形的连法'],
      correct: 3,
    },
    explain: [
      {
        text: '<b>关键思路</b>：对照 11 种展开图。"一四一"、"二三一"、"三三"、"二二二"都是合法类型；"<b>田</b>"字形是经典的反面教材。',
        audio: 'q16-ex1',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null, unfold: 0.5 },
      },
      {
        text: '<b>完整分析</b>：含"田"字形（四个正方形围成 2×2 方块）的连法，折叠时必有两个面<b>重叠</b>、同时缺一个面，永远封不成正方体。<br>选 <b>D</b>。记口诀："田"字出现，直接排除。',
        audio: 'q16-ex2',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null, unfold: 1 },
      },
    ],
  },
  {
    id: 'q17',
    title: '圆柱的侧面展开图',
    solid: 'cylinder',
    difficulty: 2,
    question: '圆柱的底面半径为 1，高为 3。它的侧面展开图是一个长方形，这个长方形相邻两边的长分别是？',
    scene: { highlight: { points: [], edges: [], faces: [0] }, spin: true, section: null },
    answer: {
      type: 'choice',
      options: ['1 和 3', '2π 和 3', 'π 和 3', '2 和 3'],
      correct: 1,
    },
    explain: [
      {
        text: '<b>关键思路</b>：侧面展开后，长方形的一条边是圆柱的<b>高</b>，另一条边卷成了<b>底面圆周</b>——它的长度等于底面周长。',
        audio: 'q17-ex1',
        scene: { highlight: { points: [], edges: [], faces: [0] }, spin: false, section: null },
      },
      {
        text: '<b>完整计算</b>：底面周长 = 2πr = 2π × 1 = 2π，高 = 3。<br>所以相邻两边为 <b>2π 和 3</b>，选 <b>B</b>。注意别用半径 1 或直径 2 代替周长。',
        audio: 'q17-ex2',
        scene: { highlight: { points: [], edges: [], faces: [0, 1] }, spin: true, section: null },
      },
    ],
  },
  {
    id: 'q18',
    title: '球的表面积',
    solid: 'sphere',
    difficulty: 2,
    question: '半径为 3 的球，它的<b>表面积</b>为多少？',
    scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
    answer: {
      type: 'choice',
      options: ['12π', '24π', '36π', '108π'],
      correct: 2,
    },
    explain: [
      {
        text: '<b>关键思路</b>：套球表面积公式 S = 4πr<sup>2</sup>。注意是半径的<b>平方</b>，不是立方。',
        audio: 'q18-ex1',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
      },
      {
        text: '<b>完整计算</b>：S = 4π × 3<sup>2</sup> = 4π × 9 = <b>36π</b>，选 <b>C</b>。<br>对照记忆：表面积带 r<sup>2</sup>，体积带 r<sup>3</sup>——量纲上一个是面积、一个是体积，不会混。',
        audio: 'q18-ex2',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
      },
    ],
  },
  {
    id: 'q19',
    title: '球的体积',
    solid: 'sphere',
    difficulty: 2,
    question: '半径为 3 的球，它的<b>体积</b>为多少？',
    scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
    answer: {
      type: 'choice',
      options: ['36π', '12π', '27π', '108π'],
      correct: 0,
    },
    explain: [
      {
        text: '<b>关键思路</b>：套球体积公式 V = (4/3)πr<sup>3</sup>。先算 r<sup>3</sup>，再乘 4/3，能约分先约分。',
        audio: 'q19-ex1',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
      },
      {
        text: '<b>完整计算</b>：r<sup>3</sup> = 27，V = (4/3)π × 27 = 4π × 9 = <b>36π</b>，选 <b>A</b>。<br>本题表面积和体积恰好都是 36π——纯属数字巧合（r = 3 时 4πr<sup>2</sup> = (4/3)πr<sup>3</sup>），含义完全不同。',
        audio: 'q19-ex2',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
      },
    ],
  },
  {
    id: 'q20',
    title: '正方体的外接球',
    solid: 'cube',
    difficulty: 2,
    question: '棱长为 2 的正方体的<b>外接球</b>（球过全部 8 个顶点）的表面积为多少？',
    scene: {
      highlight: { points: ['A', 'C1'], edges: [['A', 'C1']], faces: [] },
      spin: true,
      section: null,
    },
    answer: {
      type: 'choice',
      options: ['4π', '12π', '16π', '24π'],
      correct: 1,
    },
    explain: [
      {
        text: '<b>关键思路</b>：正方体外接球的直径 = 体对角线（体对角线的中点就是球心，两端点在球面上）。',
        audio: 'q20-ex1',
        scene: {
          highlight: { points: ['A', 'C1'], edges: [['A', 'C1']], faces: [] },
          spin: true,
          section: null,
        },
      },
      {
        text: '<b>完整计算</b>：体对角线 AC<sub>1</sub> = 2√3，所以 R = √3。<br>S = 4πR<sup>2</sup> = 4π × 3 = <b>12π</b>，选 <b>B</b>。',
        audio: 'q20-ex2',
        scene: {
          highlight: { points: ['A', 'C1'], edges: [['A', 'C1'], ['A', 'C'], ['C', 'C1']], faces: [] },
          spin: true,
          section: null,
        },
      },
    ],
  },
  {
    id: 'q21',
    title: '线面平行的判定条件',
    solid: 'cube',
    difficulty: 2,
    question: '直线 a 在平面 α 外（a ⊄ α）。下列条件中，<b>能判定 a ∥ α</b> 的是哪一个？',
    scene: {
      highlight: { points: [], edges: [['A1', 'B1'], ['A', 'B']], faces: [0] },
      spin: false,
      section: null,
    },
    answer: {
      type: 'choice',
      options: [
        'a 平行于 α 内的一条直线',
        'a 垂直于 α 内的一条直线',
        'a 与 α 只有一个公共点',
        'a 与 α 内的一条直线是异面直线',
      ],
      correct: 0,
    },
    explain: [
      {
        text: '<b>关键思路</b>：线面平行判定定理——面外一条直线平行于面内一条直线，则线面平行。图中 A<sub>1</sub>B<sub>1</sub> ∥ AB，AB ⊂ 底面，故 A<sub>1</sub>B<sub>1</sub> ∥ 底面。',
        audio: 'q21-ex1',
        scene: {
          highlight: { points: [], edges: [['A1', 'B1'], ['A', 'B']], faces: [0] },
          spin: false,
          section: null,
        },
      },
      {
        text: '<b>逐项分析</b>：A 正是判定定理，正确。<br>与 α 只有一个公共点（C）是线面<b>相交</b>；垂直面内一条直线（B）、与面内直线异面（D）都推不出平行。选 <b>A</b>。',
        audio: 'q21-ex2',
        scene: {
          highlight: { points: [], edges: [['A1', 'B1'], ['A', 'B']], faces: [0] },
          spin: true,
          section: null,
        },
      },
    ],
  },
  {
    id: 'q22',
    title: '线面垂直的判定条件',
    solid: 'cube',
    difficulty: 2,
    question: '下列条件中，<b>能判定直线 l ⊥ 平面 α</b> 的是哪一个？',
    scene: {
      highlight: { points: ['A'], edges: [['A', 'A1'], ['A', 'B'], ['A', 'D']], faces: [0] },
      spin: false,
      section: null,
    },
    answer: {
      type: 'choice',
      options: [
        'l 垂直于 α 内的一条直线',
        'l 垂直于 α 内的两条平行直线',
        'l 垂直于 α 内的两条相交直线',
        'l 垂直于 α 内的三条两两平行的直线',
      ],
      correct: 2,
    },
    explain: [
      {
        text: '<b>关键思路</b>：线面垂直判定定理的关键词是"<b>两条相交直线</b>"。图中 AA<sub>1</sub> ⊥ AB、AA<sub>1</sub> ⊥ AD，AB 与 AD 相交，故 AA<sub>1</sub> ⊥ 底面。',
        audio: 'q22-ex1',
        scene: {
          highlight: { points: ['A'], edges: [['A', 'A1'], ['A', 'B'], ['A', 'D']], faces: [0] },
          spin: false,
          section: null,
        },
      },
      {
        text: '<b>逐项分析</b>：只垂直一条（A）或两条平行直线（B、D），直线仍能"歪着"——平行线组卡不住平面的方向。<br>只有两条<b>相交</b>直线能确定平面方向，选 <b>C</b>。',
        audio: 'q22-ex2',
        scene: {
          highlight: { points: ['A'], edges: [['A', 'A1'], ['A', 'B']], faces: [0] },
          spin: true,
          section: null,
        },
      },
    ],
  },
  {
    id: 'q23',
    title: '异面直线的判断',
    solid: 'cube',
    difficulty: 2,
    question: '在正方体 ABCD-A<sub>1</sub>B<sub>1</sub>C<sub>1</sub>D<sub>1</sub> 中，下列哪一对直线是<b>异面直线</b>？',
    scene: {
      highlight: { points: [], edges: [['A', 'B'], ['B1', 'C1']], faces: [] },
      spin: true,
      section: null,
    },
    answer: {
      type: 'choice',
      options: ['AB 与 CD', 'AA₁ 与 CC₁', 'AB 与 B₁C₁', 'AC 与 A₁C₁'],
      correct: 2,
    },
    explain: [
      {
        text: '<b>关键思路</b>：异面直线 = 不平行、不相交、不共面。逐对检验：A、B、D 三对都是平行线（平行必共面），只剩 C 可疑。',
        audio: 'q23-ex1',
        scene: {
          highlight: { points: [], edges: [['A', 'B'], ['B1', 'C1']], faces: [] },
          spin: true,
          section: null,
        },
      },
      {
        text: '<b>完整验证</b>：AB 沿底面前缘，B<sub>1</sub>C<sub>1</sub> 沿顶面右缘——方向不同（不平行），一底一顶（不相交），若共面则该面要同时含它们，必然导致 AB ∥ B<sub>1</sub>C<sub>1</sub> 或相交，矛盾。<br>所以 AB 与 B<sub>1</sub>C<sub>1</sub> 是异面直线，选 <b>C</b>。',
        audio: 'q23-ex2',
        scene: {
          highlight: { points: [], edges: [['A', 'B'], ['B1', 'C1']], faces: [] },
          spin: true,
          section: null,
        },
      },
    ],
  },
  {
    id: 'q24',
    title: '圆锥的轴截面面积',
    solid: 'cone',
    difficulty: 2,
    question: '圆锥的底面半径为 3，高为 4，母线长为 5。它的<b>轴截面</b>（过轴线的截面）的面积为多少？',
    scene: {
      highlight: { points: ['A', 'P'], edges: [['A', 'P']], faces: [0] },
      spin: true,
      section: { n: [0, 0, 1], d: 0 },
    },
    answer: {
      type: 'choice',
      options: ['12', '15', '24', '20'],
      correct: 0,
    },
    explain: [
      {
        text: '<b>关键思路</b>：轴截面是一个<b>等腰三角形</b>：底边 = 底面直径 2r，腰 = 母线 l，三角形的高 = 圆锥的高 h。',
        audio: 'q24-ex1',
        scene: {
          highlight: { points: ['A', 'P'], edges: [['A', 'P']], faces: [0] },
          spin: false,
          section: { n: [0, 0, 1], d: 0 },
        },
      },
      {
        text: '<b>完整计算</b>：底 = 2 × 3 = 6，高 = 4，面积 = (6 × 4)/2 = <b>12</b>，选 <b>A</b>。<br>陷阱：用母线 5 当三角形的高会错算成 15——母线是<b>腰</b>，不是高。',
        audio: 'q24-ex2',
        scene: {
          highlight: { points: ['A', 'P'], edges: [['A', 'P']], faces: [0] },
          spin: true,
          section: { n: [0, 0, 1], d: 0 },
        },
      },
    ],
  },
  {
    id: 'q25',
    title: '与一条棱异面的棱有几条',
    solid: 'cube',
    difficulty: 3,
    question: '在正方体 ABCD-A<sub>1</sub>B<sub>1</sub>C<sub>1</sub>D<sub>1</sub> 中，与棱 AB 是<b>异面直线</b>的棱共有多少条？',
    scene: {
      highlight: {
        points: [],
        edges: [['A', 'B'], ['C', 'C1'], ['D', 'D1'], ['A1', 'D1'], ['B1', 'C1']],
        faces: [],
      },
      spin: true,
      section: null,
    },
    answer: {
      type: 'choice',
      options: ['2 条', '3 条', '4 条', '6 条'],
      correct: 2,
    },
    explain: [
      {
        text: '<b>关键思路</b>：分类排除。12 条棱中，与 AB 不异面的只有两类：<b>平行的</b>和<b>相交的</b>（含 AB 自身）。剩下的就是异面的。',
        audio: 'q25-ex1',
        scene: {
          highlight: { points: [], edges: [['A', 'B'], ['C', 'D'], ['A1', 'B1'], ['C1', 'D1']], faces: [] },
          spin: true,
          section: null,
        },
      },
      {
        text: '<b>完整计数</b>：与 AB 平行的 3 条（CD、A<sub>1</sub>B<sub>1</sub>、C<sub>1</sub>D<sub>1</sub>）；与 AB 相交的 4 条（A 点处 AD、AA<sub>1</sub>；B 点处 BC、BB<sub>1</sub>）；加上 AB 本身。<br>12 − 3 − 4 − 1 = <b>4</b> 条：CC<sub>1</sub>、DD<sub>1</sub>、A<sub>1</sub>D<sub>1</sub>、B<sub>1</sub>C<sub>1</sub>，选 <b>C</b>。',
        audio: 'q25-ex2',
        scene: {
          highlight: {
            points: [],
            edges: [['A', 'B'], ['C', 'C1'], ['D', 'D1'], ['A1', 'D1'], ['B1', 'C1']],
            faces: [],
          },
          spin: true,
          section: null,
        },
      },
    ],
  },
  {
    id: 'q26',
    title: '正方体对角面的面积',
    solid: 'cube',
    difficulty: 3,
    question: '棱长为 2 的正方体，用过底面对角线 AC 的竖直平面去截，截面（对角面 ACC<sub>1</sub>A<sub>1</sub>）的面积为多少？',
    scene: {
      highlight: { points: ['A', 'C', 'A1', 'C1'], edges: [['A', 'C'], ['A1', 'C1']], faces: [] },
      spin: true,
      section: { n: [1, 0, -1], d: 0 },
    },
    answer: {
      type: 'choice',
      options: ['4', '4√2', '8', '2√2'],
      correct: 1,
    },
    explain: [
      {
        text: '<b>关键思路</b>：对角面是<b>长方形</b>：一边 = 底面对角线 AC，另一边 = 侧棱 CC<sub>1</sub>。分别求出两边再相乘。',
        audio: 'q26-ex1',
        scene: {
          highlight: { points: ['A', 'C'], edges: [['A', 'C']], faces: [0] },
          spin: false,
          section: null,
        },
      },
      {
        text: '<b>完整计算</b>：AC = 2√2（底面正方形的对角线），CC<sub>1</sub> = 2。<br>面积 = 2√2 × 2 = <b>4√2</b>，选 <b>B</b>。误用棱长 2 × 2 = 4 是忘了截面"斜跨"底面。',
        audio: 'q26-ex2',
        scene: {
          highlight: { points: ['A', 'C', 'A1', 'C1'], edges: [['A', 'C'], ['C', 'C1'], ['A1', 'C1'], ['A', 'A1']], faces: [] },
          spin: true,
          section: { n: [1, 0, -1], d: 0 },
        },
      },
    ],
  },
  {
    id: 'q27',
    title: '圆台的体积',
    solid: 'frustum',
    difficulty: 3,
    question: '圆台的上底面半径为 1，下底面半径为 2，高为 3。它的体积为多少？',
    scene: { highlight: { points: [], edges: [], faces: [0, 1] }, spin: true, section: null },
    answer: {
      type: 'choice',
      options: ['7π', '21π', '9π', '5π'],
      correct: 0,
    },
    explain: [
      {
        text: '<b>关键思路</b>：套圆台体积公式 V = πh(R<sup>2</sup> + Rr + r<sup>2</sup>)/3。它长得像锥体公式，只是把 S 换成了"上、下底及过渡项"。',
        audio: 'q27-ex1',
        scene: { highlight: { points: [], edges: [], faces: [0, 1] }, spin: true, section: null },
      },
      {
        text: '<b>完整计算</b>：R<sup>2</sup> + Rr + r<sup>2</sup> = 4 + 2 + 1 = 7。<br>V = (π × 3 × 7)/3 = <b>7π</b>，选 <b>A</b>。验证：它介于两个极端之间——半径 1 的柱 3π 与半径 2 的柱 12π，7π 合理。',
        audio: 'q27-ex2',
        scene: { highlight: { points: [], edges: [], faces: [0, 1] }, spin: true, section: null },
      },
    ],
  },
  {
    id: 'q28',
    title: '组合体的体积',
    solid: 'cylinder',
    difficulty: 3,
    question: '一个"粮仓"由下方的圆柱与上方的圆锥组成：圆柱底面半径 2、高 3，圆锥与圆柱同底、高也是 3。这个组合体的体积为多少？',
    scene: { highlight: { points: [], edges: [], faces: [0, 1] }, spin: true, section: null },
    answer: {
      type: 'choice',
      options: ['12π', '16π', '24π', '20π'],
      correct: 1,
    },
    explain: [
      {
        text: '<b>关键思路</b>：组合体 = 分块求和。圆柱用 V = πr<sup>2</sup>h，圆锥用 V = πr<sup>2</sup>h/3，两者相加。',
        audio: 'q28-ex1',
        scene: { highlight: { points: [], edges: [], faces: [0] }, spin: true, section: null },
      },
      {
        text: '<b>完整计算</b>：V<sub>柱</sub> = π × 4 × 3 = 12π；V<sub>锥</sub> = 12π/3 = 4π。<br>合计 12π + 4π = <b>16π</b>，选 <b>B</b>。同底等高的锥是柱的 1/3，这里再次用到。',
        audio: 'q28-ex2',
        scene: { highlight: { points: [], edges: [], faces: [0, 1] }, spin: true, section: null },
      },
    ],
  },
  {
    id: 'q29',
    title: '三棱锥的外接球',
    solid: 'pyramid3',
    difficulty: 3,
    question: '三棱锥的三条侧棱两两垂直，长度都是 1（"墙角"模型）。它的<b>外接球</b>半径为多少？',
    scene: {
      highlight: { points: ['A', 'B', 'C', 'P'], edges: [['P', 'A'], ['P', 'B'], ['P', 'C']], faces: [] },
      spin: true,
      section: null,
    },
    answer: {
      type: 'choice',
      options: ['√2/2', '√3/2', '1', '√3'],
      correct: 1,
    },
    explain: [
      {
        text: '<b>关键思路</b>：三条侧棱两两垂直的三棱锥，可以补成一个棱长为 1 的<b>正方体</b>——三棱锥的 4 个顶点都是该正方体的顶点，外接球就是正方体的外接球。',
        audio: 'q29-ex1',
        scene: {
          highlight: { points: ['A', 'B', 'C', 'P'], edges: [['P', 'A'], ['P', 'B'], ['P', 'C']], faces: [] },
          spin: true,
          section: null,
        },
      },
      {
        text: '<b>完整计算</b>：正方体棱长 1，体对角线 = √3 = 外接球直径，R = <b>√3/2</b>，选 <b>B</b>。<br>验证：球心在 (1/2, 1/2, 1/2)，到任一顶点距离 = √(3/4) = √3/2，一致。',
        audio: 'q29-ex2',
        scene: {
          highlight: { points: ['A', 'B', 'C', 'P'], edges: [], faces: [0] },
          spin: true,
          section: null,
        },
      },
    ],
  },
  {
    id: 'q30',
    title: '挖孔后的体积',
    solid: 'cube',
    difficulty: 3,
    question: '在棱长为 2 的正方体中，沿竖直方向挖去一个半径为 1、上下贯通的圆柱形孔。剩余部分的体积为多少？',
    scene: { highlight: { points: [], edges: [], faces: [1] }, spin: true, section: null },
    answer: {
      type: 'choice',
      options: ['8 − π', '8 − 2π', '8 − 4π', '6'],
      correct: 1,
    },
    explain: [
      {
        text: '<b>关键思路</b>：剩余体积 = 正方体体积 − 圆柱孔体积。孔上下贯通，所以圆柱的高 = 正方体棱长 2。',
        audio: 'q30-ex1',
        scene: { highlight: { points: [], edges: [], faces: [0, 1] }, spin: true, section: null },
      },
      {
        text: '<b>完整计算</b>：V<sub>正方体</sub> = 2<sup>3</sup> = 8；V<sub>孔</sub> = π × 1<sup>2</sup> × 2 = 2π。<br>剩余 = <b>8 − 2π</b>，选 <b>B</b>。注意半径是 1 不是 2，别把底面积算成 4π。',
        audio: 'q30-ex2',
        scene: { highlight: { points: [], edges: [], faces: [1] }, spin: true, section: null },
      },
    ],
  },
  {
    id: 'q31',
    title: '由三视图认几何体',
    solid: 'cone',
    difficulty: 1,
    question: '某几何体的主视图和左视图都是三角形，俯视图是<b>带中心点的圆</b>。这个几何体是？',
    scene: { highlight: { points: ['P'], edges: [], faces: [0] }, spin: true, section: null, views: true },
    answer: {
      type: 'choice',
      options: ['圆锥', '三棱锥', '圆柱', '球'],
      correct: 0,
    },
    explain: [
      {
        text: '<b>关键思路</b>：俯视图是圆 → 底面是圆（排除棱锥）；主、左视图是三角形 → 上部收成尖顶（排除柱、球）。',
        audio: 'q31-ex1',
        scene: { highlight: { points: ['P'], edges: [], faces: [0] }, spin: true, section: null, views: true },
      },
      {
        text: '<b>完整分析</b>：圆形底面 + 尖顶 = <b>圆锥</b>；俯视图的中心点正是锥顶 P 的投影。选 <b>A</b>。<br>三棱锥的俯视图应是多边形，圆柱主视图是长方形，球的三个视图都是圆。',
        audio: 'q31-ex2',
        scene: { highlight: { points: ['P', 'A'], edges: [['A', 'P']], faces: [0] }, spin: true, section: null, views: true },
      },
    ],
  },
  {
    id: 'q32',
    title: '数小正方体',
    solid: 'cube',
    difficulty: 1,
    question: '一个几何体由棱长为 1 的小正方体搭成。俯视图是 2 × 2 的四个格子，格子上标注的层数分别为 1、2、2、3。这个几何体共有多少个小正方体？',
    scene: { highlight: { points: [], edges: [], faces: [1] }, spin: true, section: null, views: true },
    answer: {
      type: 'choice',
      options: ['6 个', '7 个', '8 个', '9 个'],
      correct: 2,
    },
    explain: [
      {
        text: '<b>关键思路</b>：俯视图的每个格子代表一根"柱子"，格子上的数字是这根柱子的高度（层数）。总数 = 各格层数相加。',
        audio: 'q32-ex1',
        scene: { highlight: { points: [], edges: [], faces: [1] }, spin: false, section: null, views: true },
      },
      {
        text: '<b>完整计算</b>：1 + 2 + 2 + 3 = <b>8</b> 个，选 <b>C</b>。<br>别把格子数 4 当成答案——数字才是层数。',
        audio: 'q32-ex2',
        scene: { highlight: { points: [], edges: [], faces: [1] }, spin: true, section: null, views: true },
      },
    ],
  },
  {
    id: 'q33',
    title: '由三视图算圆柱体积',
    solid: 'cylinder',
    difficulty: 2,
    question: '一个圆柱的三视图中，主视图是宽 4、高 5 的长方形，俯视图是圆。这个圆柱的体积是多少？',
    scene: { highlight: { points: [], edges: [], faces: [0, 1] }, spin: true, section: null, views: true },
    answer: {
      type: 'choice',
      options: ['10π', '20π', '40π', '25π'],
      correct: 1,
    },
    explain: [
      {
        text: '<b>关键思路</b>：圆柱主视图的<b>宽 = 底面直径</b>（不是半径！），<b>高 = 圆柱的高</b>。先读出 r 和 h，再套 V = πr<sup>2</sup>h。',
        audio: 'q33-ex1',
        scene: { highlight: { points: [], edges: [], faces: [0] }, spin: true, section: null, views: true },
      },
      {
        text: '<b>完整计算</b>：直径 4 → r = 2，h = 5。V = π × 2<sup>2</sup> × 5 = <b>20π</b>，选 <b>B</b>。<br>陷阱：误把 4 当半径会得 80π（不在选项中，正好自查）；10π 是忘了平方。',
        audio: 'q33-ex2',
        scene: { highlight: { points: [], edges: [], faces: [0, 1] }, spin: true, section: null, views: true },
      },
    ],
  },
  {
    id: 'q34',
    title: '由三视图算圆锥体积',
    solid: 'cone',
    difficulty: 2,
    question: '一个圆锥的主视图是底边为 6、腰长为 5 的等腰三角形。这个圆锥的体积是多少？',
    scene: { highlight: { points: ['P', 'A'], edges: [['A', 'P']], faces: [0] }, spin: true, section: null, views: true },
    answer: {
      type: 'choice',
      options: ['12π', '15π', '20π', '36π'],
      correct: 0,
    },
    explain: [
      {
        text: '<b>关键思路</b>：主视图就是轴截面——底边 = 底面直径 2r，腰 = 母线 l。由 3-4-5 直角三角形求出高 h。',
        audio: 'q34-ex1',
        scene: {
          highlight: { points: ['P', 'A'], edges: [['A', 'P']], faces: [0] },
          spin: true,
          section: { n: [0, 0, 1], d: 0 },
          views: true,
        },
      },
      {
        text: '<b>完整计算</b>：r = 3，l = 5，h = √(5<sup>2</sup> − 3<sup>2</sup>) = 4。<br>V = (π × 9 × 4)/3 = <b>12π</b>，选 <b>A</b>。15π 是误用母线当高的结果。',
        audio: 'q34-ex2',
        scene: { highlight: { points: ['P'], edges: [], faces: [0] }, spin: true, section: null, views: true },
      },
    ],
  },
  {
    id: 'q35',
    title: '空间直角坐标系中的点',
    solid: 'cube',
    difficulty: 1,
    question: '棱长为 2 的正方体中，以 D 为原点，DA、DC、DD<sub>1</sub> 方向分别为 x、y、z 轴建立坐标系。则顶点 C<sub>1</sub> 的坐标是？',
    scene: {
      highlight: { points: ['D', 'C', 'C1'], edges: [['D', 'C'], ['C', 'C1']], faces: [] },
      spin: false,
      section: null,
    },
    answer: {
      type: 'choice',
      options: ['(0, 2, 2)', '(2, 0, 2)', '(2, 2, 0)', '(2, 2, 2)'],
      correct: 0,
    },
    explain: [
      {
        text: '<b>关键思路</b>：从原点 D 出发"走"到 C<sub>1</sub>：先沿 y 轴走 2 到 C，再沿 z 轴走 2 到 C<sub>1</sub>。坐标 = 三个轴上各走了多少。',
        audio: 'q35-ex1',
        scene: {
          highlight: { points: ['D', 'C', 'C1'], edges: [['D', 'C'], ['C', 'C1']], faces: [] },
          spin: false,
          section: null,
        },
      },
      {
        text: '<b>完整答案</b>：x 方向走 0，y 方向走 2，z 方向走 2，C<sub>1</sub> = <b>(0, 2, 2)</b>，选 <b>A</b>。<br>对照：A(2,0,0)、C(0,2,0)、D<sub>1</sub>(0,0,2) 是三个轴上的"标杆点"。',
        audio: 'q35-ex2',
        scene: {
          highlight: { points: ['A', 'C', 'D1', 'C1'], edges: [], faces: [] },
          spin: true,
          section: null,
        },
      },
    ],
  },
  {
    id: 'q36',
    title: '向量的坐标表示',
    solid: 'cube',
    difficulty: 1,
    question: '同上建系（D 为原点，棱长 2）。向量 AB 的坐标是？',
    scene: {
      highlight: { points: ['A', 'B'], edges: [['A', 'B']], faces: [] },
      spin: false,
      section: null,
    },
    answer: {
      type: 'choice',
      options: ['(0, 2, 0)', '(2, 0, 0)', '(0, −2, 0)', '(2, 2, 0)'],
      correct: 0,
    },
    explain: [
      {
        text: '<b>关键思路</b>：向量坐标 = <b>终点 − 起点</b>。先写出 A、B 两点的坐标再相减。',
        audio: 'q36-ex1',
        scene: {
          highlight: { points: ['A', 'B'], edges: [['A', 'B']], faces: [] },
          spin: false,
          section: null,
        },
      },
      {
        text: '<b>完整计算</b>：A(2,0,0)，B(2,2,0)，AB = B − A = <b>(0, 2, 0)</b>，选 <b>A</b>。<br>几何检验：AB 沿 y 轴（DC）方向走 2，x、z 不变——完全吻合。(0,−2,0) 是 BA，方向反了。',
        audio: 'q36-ex2',
        scene: {
          highlight: { points: ['A', 'B'], edges: [['A', 'B'], ['D', 'C']], faces: [] },
          spin: true,
          section: null,
        },
      },
    ],
  },
  {
    id: 'q37',
    title: '数量积判垂直',
    solid: 'cube',
    difficulty: 2,
    question: '已知向量 a = (1, 2, −1)，b = (2, −1, 0)。则 a 与 b 的位置关系是？',
    scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
    answer: {
      type: 'choice',
      options: ['垂直', '平行', '夹角 60°', '夹角 45°'],
      correct: 0,
    },
    explain: [
      {
        text: '<b>关键思路</b>：算数量积。a·b = 0 ⇔ 垂直；平行要看是否成比例。先算点积再说。',
        audio: 'q37-ex1',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
      },
      {
        text: '<b>完整计算</b>：a·b = 1×2 + 2×(−1) + (−1)×0 = 2 − 2 + 0 = <b>0</b>，所以 a ⊥ b，选 <b>A</b>。<br>坐标不成比例（1/2 ≠ 2/−1），排除平行。',
        audio: 'q37-ex2',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
      },
    ],
  },
  {
    id: 'q38',
    title: '数量积求夹角',
    solid: 'cube',
    difficulty: 2,
    question: '已知向量 a = (1, 0, 1)，b = (0, 1, 1)。则 a 与 b 的夹角为？',
    scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
    answer: {
      type: 'choice',
      options: ['30°', '45°', '60°', '90°'],
      correct: 2,
    },
    explain: [
      {
        text: '<b>关键思路</b>：cos θ = (a·b)/(|a||b|)。分别算点积和两个模长。',
        audio: 'q38-ex1',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
      },
      {
        text: '<b>完整计算</b>：a·b = 0 + 0 + 1 = 1；|a| = √2，|b| = √2。<br>cos θ = 1/2，θ = <b>60°</b>，选 <b>C</b>。',
        audio: 'q38-ex2',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
      },
    ],
  },
  {
    id: 'q39',
    title: '求平面的法向量',
    solid: 'cube',
    difficulty: 2,
    question: '平面 α 内有两条相交直线，方向向量分别为 u = (1, 0, 0)、v = (0, 1, 1)。下列向量中，是平面 α 的法向量的是？',
    scene: {
      highlight: { points: ['D'], edges: [['D', 'A'], ['D', 'C']], faces: [0] },
      spin: false,
      section: null,
    },
    answer: {
      type: 'choice',
      options: ['(0, 1, 1)', '(0, 1, −1)', '(1, 1, −1)', '(0, 0, 1)'],
      correct: 1,
    },
    explain: [
      {
        text: '<b>关键思路</b>：法向量必须与面内<b>两条相交直线</b>都垂直——即与 u、v 的点积都为 0。逐个选项代入验证最快。',
        audio: 'q39-ex1',
        scene: {
          highlight: { points: ['D'], edges: [['D', 'A'], ['D', 'C']], faces: [0] },
          spin: false,
          section: null,
        },
      },
      {
        text: '<b>逐项验证</b>：B (0,1,−1)：与 u 点积 0 ✓，与 v 点积 0 + 1 − 1 = 0 ✓。<br>A 与 v 点积为 2，C 与 u 点积为 1，D 与 v 点积为 1，都不行。选 <b>B</b>。',
        audio: 'q39-ex2',
        scene: {
          highlight: { points: ['D'], edges: [['D', 'A'], ['D', 'C'], ['D', 'D1']], faces: [0] },
          spin: true,
          section: null,
        },
      },
    ],
  },
  {
    id: 'q40',
    title: '体对角线的向量坐标',
    solid: 'cube',
    difficulty: 2,
    question: '以 D 为原点、DA/DC/DD<sub>1</sub> 为 x/y/z 轴（棱长 2）。体对角线向量 AC<sub>1</sub> 的坐标是？',
    scene: {
      highlight: { points: ['A', 'C1'], edges: [['A', 'C1']], faces: [] },
      spin: true,
      section: null,
    },
    answer: {
      type: 'choice',
      options: ['(−2, 2, 2)', '(2, 2, 2)', '(2, −2, −2)', '(0, 2, 2)'],
      correct: 0,
    },
    explain: [
      {
        text: '<b>关键思路</b>：终点 C<sub>1</sub> 减起点 A。先写准两点坐标：A(2,0,0)，C<sub>1</sub>(0,2,2)。',
        audio: 'q40-ex1',
        scene: {
          highlight: { points: ['A', 'C1'], edges: [['A', 'C1']], faces: [] },
          spin: true,
          section: null,
        },
      },
      {
        text: '<b>完整计算</b>：AC<sub>1</sub> = (0−2, 2−0, 2−0) = <b>(−2, 2, 2)</b>，选 <b>A</b>。<br>检验模长：|AC<sub>1</sub>| = √(4+4+4) = 2√3，正是棱长 2 的体对角线。注意 (2,−2,−2) 是反向的 C<sub>1</sub>A。',
        audio: 'q40-ex2',
        scene: {
          highlight: { points: ['A', 'C1'], edges: [['A', 'C1']], faces: [] },
          spin: true,
          section: null,
        },
      },
    ],
  },
  {
    id: 'q41',
    title: '向量法求线面角',
    solid: 'cube',
    difficulty: 3,
    question: '棱长为 2 的正方体中，体对角线 AC<sub>1</sub> 与底面 ABCD 所成角的正弦值为？',
    scene: {
      highlight: { points: ['A', 'C', 'C1'], edges: [['A', 'C1'], ['A', 'C'], ['C', 'C1']], faces: [0] },
      spin: true,
      section: null,
    },
    answer: {
      type: 'choice',
      options: ['√3/3', '√6/3', '1/2', '√2/2'],
      correct: 0,
    },
    explain: [
      {
        text: '<b>关键思路</b>：sin θ = |cos〈v, n〉|，v 是直线方向向量，n 是平面法向量。取 v = AC<sub>1</sub> = (−2,2,2)，底面 n = (0,0,1)。',
        audio: 'q41-ex1',
        scene: {
          highlight: { points: ['A', 'C1'], edges: [['A', 'C1']], faces: [0] },
          spin: false,
          section: null,
        },
      },
      {
        text: '<b>完整计算</b>：sin θ = |2|/(2√3 × 1) = 1/√3 = <b>√3/3</b>，选 <b>A</b>。<br>几何验证：投影 AC = 2√2，竖直落差 2，tan θ = 2/(2√2) = 1/√2，化出 sin θ = 1/√3，一致。',
        audio: 'q41-ex2',
        scene: {
          highlight: { points: ['A', 'C', 'C1'], edges: [['A', 'C1'], ['A', 'C'], ['C', 'C1']], faces: [0] },
          spin: true,
          section: null,
        },
      },
    ],
  },
  {
    id: 'q42',
    title: '向量法求二面角',
    solid: 'cube',
    difficulty: 3,
    question: '棱长为 2 的正方体中，平面 ABC<sub>1</sub> 与底面 ABCD 所成二面角的大小为？',
    scene: {
      highlight: { points: ['A', 'B', 'C1'], edges: [['A', 'B'], ['B', 'C1'], ['A', 'C1']], faces: [0] },
      spin: true,
      section: null,
    },
    answer: {
      type: 'choice',
      options: ['30°', '45°', '60°', '90°'],
      correct: 1,
    },
    explain: [
      {
        text: '<b>关键思路</b>：二面角 = 两个半平面法向量的夹角（或其补角，取锐角）。底面 n<sub>2</sub> = (0,0,1)；平面 ABC<sub>1</sub> 内取 AB = (0,1,0)、BC<sub>1</sub> = (−1,0,1)，叉乘得 n<sub>1</sub> = (1,0,1)。',
        audio: 'q42-ex1',
        scene: {
          highlight: { points: ['A', 'B', 'C1'], edges: [['A', 'B'], ['B', 'C1']], faces: [0] },
          spin: false,
          section: null,
        },
      },
      {
        text: '<b>完整计算</b>：|cos| = |n<sub>1</sub>·n<sub>2</sub>|/(|n<sub>1</sub>||n<sub>2</sub>|) = 1/(√2 × 1) = √2/2，二面角 = <b>45°</b>，选 <b>B</b>。<br>几何验证：交线为 AB，BC ⊥ AB 且 BC<sub>1</sub> ⊥ AB，二面角即 ∠C<sub>1</sub>BC = arctan(CC<sub>1</sub>/BC) = arctan 1 = 45°，一致。',
        audio: 'q42-ex2',
        scene: {
          highlight: { points: ['B', 'C', 'C1'], edges: [['B', 'C'], ['B', 'C1'], ['C', 'C1']], faces: [] },
          spin: true,
          section: null,
        },
      },
    ],
  },
  {
    id: 'q43',
    title: '异面直线所成角',
    solid: 'cube',
    difficulty: 2,
    question: '棱长为 2 的正方体中，异面直线 AB 与 A<sub>1</sub>C 所成角的大小为？',
    scene: {
      highlight: { points: ['A', 'B', 'A1', 'C'], edges: [['A', 'B'], ['A1', 'C']], faces: [] },
      spin: true,
      section: null,
    },
    answer: {
      type: 'choice',
      options: ['arccos(√3/3)', '45°', '60°', '90°'],
      correct: 0,
    },
    explain: [
      {
        text: '<b>关键思路</b>：异面直线所成角 = 两方向向量夹角的锐角，cos θ = |v<sub>1</sub>·v<sub>2</sub>|/(|v<sub>1</sub>||v<sub>2</sub>|)。取 AB = (0,2,0)，A<sub>1</sub>C = (−2,2,−2)。',
        audio: 'q43-ex1',
        scene: {
          highlight: { points: [], edges: [['A', 'B'], ['A1', 'C']], faces: [] },
          spin: true,
          section: null,
        },
      },
      {
        text: '<b>完整计算</b>：点积 = 0 + 4 + 0 = 4；|AB| = 2，|A<sub>1</sub>C| = 2√3。<br>cos θ = 4/(4√3) = √3/3，θ = <b>arccos(√3/3)</b>，选 <b>A</b>。注意取绝对值保证锐角。',
        audio: 'q43-ex2',
        scene: {
          highlight: { points: ['A', 'B', 'A1', 'C'], edges: [['A', 'B'], ['A1', 'C']], faces: [] },
          spin: true,
          section: null,
        },
      },
    ],
  },
  {
    id: 'q44',
    title: '由三视图还原（圆筒）',
    solid: 'cylinder',
    difficulty: 2,
    question: '某几何体的主视图和左视图都是长方形，俯视图是<b>圆环</b>（两个同心圆）。这个几何体是？',
    scene: { highlight: { points: [], edges: [], faces: [1] }, spin: true, section: null, views: true },
    answer: {
      type: 'choice',
      options: ['圆柱', '空心圆柱（圆筒）', '圆台', '球'],
      correct: 1,
    },
    explain: [
      {
        text: '<b>关键思路</b>：俯视图的圆环意味着从上往下看有"外圈"和"内孔"两个圆——几何体是中空的。',
        audio: 'q44-ex1',
        scene: { highlight: { points: [], edges: [], faces: [1] }, spin: false, section: null, views: true },
      },
      {
        text: '<b>完整分析</b>：长方形的主/左视图说明是直壁柱体；圆环俯视说明中间贯通一个圆柱孔——即<b>空心圆柱（圆筒）</b>，选 <b>B</b>。<br>实心圆柱的俯视图是整个圆（无虚线内圈），圆台的主视图是梯形。',
        audio: 'q44-ex2',
        scene: { highlight: { points: [], edges: [], faces: [0, 1] }, spin: true, section: null, views: true },
      },
    ],
  },
  {
    id: 'q45',
    title: '数量积综合（体对角线⊥面对角线）',
    solid: 'cube',
    difficulty: 3,
    question: '棱长为 2 的正方体（D 为原点建系）中，计算 DB<sub>1</sub> · AC 的值为？',
    scene: {
      highlight: { points: ['D', 'B1', 'A', 'C'], edges: [['D', 'B1'], ['A', 'C']], faces: [] },
      spin: true,
      section: null,
    },
    answer: {
      type: 'choice',
      options: ['0', '4', '−4', '8'],
      correct: 0,
    },
    explain: [
      {
        text: '<b>关键思路</b>：先写坐标。DB<sub>1</sub> = B<sub>1</sub> − D = (2,2,2)；AC = C − A = (−2,2,0)。再逐分量相乘相加。',
        audio: 'q45-ex1',
        scene: {
          highlight: { points: ['D', 'B1'], edges: [['D', 'B1']], faces: [] },
          spin: true,
          section: null,
        },
      },
      {
        text: '<b>完整计算</b>：DB<sub>1</sub>·AC = 2×(−2) + 2×2 + 2×0 = −4 + 4 + 0 = <b>0</b>，选 <b>A</b>。<br>几何含义：点积为 0 说明体对角线 DB<sub>1</sub> ⊥ 底面对角线 AC——一个漂亮的垂直结论。',
        audio: 'q45-ex2',
        scene: {
          highlight: { points: ['D', 'B1', 'A', 'C'], edges: [['D', 'B1'], ['A', 'C']], faces: [] },
          spin: true,
          section: null,
        },
      },
    ],
  },
  {
    id: 'q46',
    title: '面对角线与底面所成角',
    solid: 'cube',
    difficulty: 2,
    question: '棱长为 2 的正方体中，面对角线 A<sub>1</sub>B 与底面 ABCD 所成角的大小为？',
    scene: {
      highlight: { points: ['A1', 'B', 'A'], edges: [['A1', 'B'], ['A', 'B'], ['A', 'A1']], faces: [2] },
      spin: true,
      section: null,
    },
    answer: {
      type: 'choice',
      options: ['30°', '45°', '60°', '90°'],
      correct: 1,
    },
    explain: [
      {
        text: '<b>关键思路</b>：A<sub>1</sub>B 在底面上的投影就是 AB。线面角看"竖直落差"与"投影长度"：tan θ = A<sub>1</sub>A / AB。',
        audio: 'q46-ex1',
        scene: {
          highlight: { points: ['A1', 'B', 'A'], edges: [['A1', 'B'], ['A', 'B'], ['A', 'A1']], faces: [2] },
          spin: false,
          section: null,
        },
      },
      {
        text: '<b>完整计算</b>：tan θ = 2/2 = 1，θ = <b>45°</b>，选 <b>B</b>。<br>向量验证：A<sub>1</sub>B = (0,2,−2)，sin θ = |−2|/(2√2) = √2/2，θ = 45°，一致。',
        audio: 'q46-ex2',
        scene: {
          highlight: { points: ['A1', 'B'], edges: [['A1', 'B']], faces: [2] },
          spin: true,
          section: null,
        },
      },
    ],
  },
  {
    id: 'q47',
    title: '两条面对角线所成角',
    solid: 'cube',
    difficulty: 3,
    question: '棱长为 2 的正方体中，异面直线 A<sub>1</sub>B 与 B<sub>1</sub>C（都是面对角线）所成角的大小为？',
    scene: {
      highlight: { points: ['A1', 'B', 'B1', 'C'], edges: [['A1', 'B'], ['B1', 'C']], faces: [] },
      spin: true,
      section: null,
    },
    answer: {
      type: 'choice',
      options: ['30°', '45°', '60°', '90°'],
      correct: 2,
    },
    explain: [
      {
        text: '<b>关键思路</b>：用方向向量。A<sub>1</sub>B = (0,2,−2)，B<sub>1</sub>C = (−2,0,−2)，cos θ = |v<sub>1</sub>·v<sub>2</sub>|/(|v<sub>1</sub>||v<sub>2</sub>|)。',
        audio: 'q47-ex1',
        scene: {
          highlight: { points: [], edges: [['A1', 'B'], ['B1', 'C']], faces: [] },
          spin: true,
          section: null,
        },
      },
      {
        text: '<b>完整计算</b>：点积 = 0 + 0 + 4 = 4；模长都是 2√2。<br>cos θ = 4/8 = 1/2，θ = <b>60°</b>，选 <b>C</b>。几何巧解：连接 A<sub>1</sub>C<sub>1</sub>……平移 B<sub>1</sub>C 到 A<sub>1</sub>D，三角形 A<sub>1</sub>BD 三边都是面对角线，等边三角形，直接得 60°。',
        audio: 'q47-ex2',
        scene: {
          highlight: { points: ['A1', 'B', 'D'], edges: [['A1', 'B'], ['B', 'D'], ['A1', 'D']], faces: [] },
          spin: true,
          section: null,
        },
      },
    ],
  },
  {
    id: 'q48',
    title: '向量的模长',
    solid: 'cube',
    difficulty: 2,
    question: '已知空间向量 a = (2, 1, −2)，则 |a| = ？',
    scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
    answer: {
      type: 'choice',
      options: ['2', '3', '√5', '9'],
      correct: 1,
    },
    explain: [
      {
        text: '<b>关键思路</b>：模长公式 |a| = √(x<sup>2</sup> + y<sup>2</sup> + z<sup>2</sup>)——空间版勾股定理，三个分量平方和再开方。',
        audio: 'q48-ex1',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
      },
      {
        text: '<b>完整计算</b>：|a| = √(4 + 1 + 4) = √9 = <b>3</b>，选 <b>B</b>。<br>9 是忘了开方；√5 是漏了一个分量。',
        audio: 'q48-ex2',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
      },
    ],
  },
  {
    id: 'q49',
    title: '三视图还原组合体并求体积',
    solid: 'cylinder',
    difficulty: 3,
    question: '某几何体的三视图中，主视图是"下方长方形（宽 2、高 2）+ 上方三角形（底 2、高 3）"的组合，左视图相同，俯视图是带中心点的圆。该几何体的体积为？',
    scene: { highlight: { points: [], edges: [], faces: [0, 1] }, spin: true, section: null, views: true },
    answer: {
      type: 'choice',
      options: ['2π', '3π', '4π', '5π'],
      correct: 1,
    },
    explain: [
      {
        text: '<b>关键思路</b>：由三视图还原——俯视圆 + 长方形下半部 = 圆柱（r = 1，h = 2）；俯视圆心点 + 三角形上半部 = 圆锥（r = 1，h = 3）。体积分块求和。',
        audio: 'q49-ex1',
        scene: { highlight: { points: [], edges: [], faces: [0, 1] }, spin: true, section: null, views: true },
      },
      {
        text: '<b>完整计算</b>：V<sub>柱</sub> = π × 1<sup>2</sup> × 2 = 2π；V<sub>锥</sub> = (π × 1 × 3)/3 = π。<br>合计 2π + π = <b>3π</b>，选 <b>B</b>。三角形的高 3 就是圆锥的高，别当成母线。',
        audio: 'q49-ex2',
        scene: { highlight: { points: [], edges: [], faces: [1] }, spin: true, section: null, views: true },
      },
    ],
  },
  {
    id: 'q50',
    title: '向量法判线面位置关系',
    solid: 'cube',
    difficulty: 3,
    question: '棱长为 2 的正方体（D 为原点建系）中，体对角线 AC<sub>1</sub> 与平面 A<sub>1</sub>BD 的位置关系是？',
    scene: {
      highlight: { points: ['A1', 'B', 'D'], edges: [['A1', 'B'], ['B', 'D'], ['A1', 'D'], ['A', 'C1']], faces: [] },
      spin: true,
      section: null,
    },
    answer: {
      type: 'choice',
      options: ['垂直', '平行', '斜交但不垂直', '直线在平面内'],
      correct: 0,
    },
    explain: [
      {
        text: '<b>关键思路</b>：要证线面垂直，只需 AC<sub>1</sub> 与平面内<b>两条相交直线</b>的方向向量点积都为 0。取 DA<sub>1</sub> = (2,0,2)、DB = (2,2,0)。',
        audio: 'q50-ex1',
        scene: {
          highlight: { points: ['A1', 'B', 'D'], edges: [['A1', 'B'], ['B', 'D'], ['A1', 'D']], faces: [] },
          spin: false,
          section: null,
        },
      },
      {
        text: '<b>完整验证</b>：AC<sub>1</sub> 方向 (−1,1,1)。(−1,1,1)·(2,0,2) = −2+0+2 = 0；(−1,1,1)·(2,2,0) = −2+2+0 = 0。<br>两条相交直线都垂直 ⇒ AC<sub>1</sub> ⊥ 平面 A<sub>1</sub>BD，选 <b>A</b>。这就是"体对角线垂直于面对角线三角形截面"的经典结论。',
        audio: 'q50-ex2',
        scene: {
          highlight: { points: ['A', 'C1', 'A1', 'B', 'D'], edges: [['A', 'C1'], ['A1', 'B'], ['B', 'D'], ['A1', 'D']], faces: [] },
          spin: true,
          section: null,
        },
      },
    ],
  },
];
