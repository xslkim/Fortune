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
//
// ===== q51-q100 验算 =====
// q51 正方体：顶点 8 + 面 6 = 14。✓ 答案 B
// q52 四棱锥：棱 = 底面 4 + 侧棱 4 = 8（欧拉 5+5−2=8 ✓）。✓ 答案 B
// q53 V=6, F=5 → E = V+F−2 = 9（即三棱柱）。✓ 答案 B
// q54 六棱柱：面 = 2 底 + 6 侧 = 8（欧拉 12+8−2=18 条棱 ✓）。✓ 答案 C
// q55 每顶点 3 条棱：3V = 2E = 24 → V = 8。✓ 答案 B
// q56 正方体棱长 3：S = 6×3² = 54。✓ 答案 B
// q57 直三棱柱：S底=6，周长=3+4+5=12，S表 = 2×6 + 12×5 = 72。✓ 答案 C
// q58 圆锥侧面积 = πrl = π×3×5 = 15π。✓ 答案 B
// q59 扇形弧长 = (120/360)×2π×6 = 4π = 底面周长 2πr → r = 2。✓ 答案 B
// q60 换底法：V = 6×4/3 = 8；以面 PAB（面积 4）为底：8 = 4h/3 → h = 6。✓ 答案 B
// q61 圆柱桶：V = π×2²×5 = 20π ≈ 62.8 升（π 取 3.14）。✓ 答案 B
// q62 无盖笔筒用料 = 底 + 侧 = π×1² + 2π×1×4 = 9π。✓ 答案 B
// q63 组合体表面积：正方体 24 − 被盖圆 π + 圆柱侧 2π×1×1 + 上底 π = 24 + 2π。✓ 答案 B
// q64 球截面：r = √(R²−d²) = √(25−9) = 4，S = 16π。✓ 答案 B
// q65 正四棱锥：底 4 + 侧 4×(½×2×2) = 4 + 8 = 12。✓ 答案 B
// q66 蚂蚁最短路径：展开相邻两面成长方形 2×(2+2)，对角线 = √(4+16) = √20 = 2√5。✓ 答案 A
// q67 正三棱柱侧面展开：面积 = 底面周长×高 = (2×3)×5 = 30。✓ 答案 B
// q68 一行四格折成一圈侧面，① 与 ③ 中间隔一格 → 相对面。✓ 答案 A
// q69 侧面展开成长方形 2π × 3，绕侧面一周的最短路线 = 对角线 √(4π²+9)。✓ 答案 A
// q70 俯视图 2×2 层数 [[1,2],[2,3]]，主视图各列取列内最大：max(1,2)=2，max(2,3)=3 → 2 和 3。✓ 答案 B
// q71 主/左视图等腰梯形 + 俯视带中心点的圆 → 圆台。✓ 答案 C
// q72 正四棱锥主视底 4 高 3 → 底面边长 4、高 3：V = 16×3/3 = 16。✓ 答案 B
// q73 三视图读出长方体 3×4×2：S = 2×(12+6+8) = 52。✓ 答案 B
// q74 d = √(R²−r²) = √(25−9) = 4。✓ 答案 C
// q75 圆柱平行轴截面：弦长 = 2√(4−1) = 2√3，面积 = 2√3×3 = 6√3。✓ 答案 B
// q76 截面宽 = AB、AD 中点连线 = 底面对角线一半 = √2，高 2，面积 = 2√2。
//     （solids 坐标验证：中点 (0,0,−1) 与 (−1,0,0) 间距 √2 ✓；截面平面 x+z=−1）✓ 答案 B
// q77 平面斜截圆柱（不平行底面、不平行轴）→ 椭圆。✓ 答案 B
// q78 棱锥平行底面截面：中点高度处相似比 1/2，面积比 1/4。✓ 答案 B
// q79 垂直于同一直线的两直线：平行/相交/异面都可能（如正方体中 AB、AD 都⊥AA₁ 但相交；
//     AB、C₁D₁ 平行；AD、BB₁ 异面）。✓ 答案 D
// q80 平行于同一平面的两直线：同样三种都可能。✓ 答案 D
// q81 平移法：CC₁ 平移到 BB₁，AB ⊥ BB₁ → 所成角 90°。✓ 答案 C
// q82 平移法：A₁C₁ ∥ AC，AB 与底面对角线 AC 成 45°。✓ 答案 B
// q83 a∥α、b⊂α：a 与 b 平行或异面（不一定平行）。✓ 答案 C
// q84 线面垂直定义：a⊥α、b⊂α → a⊥b。✓ 答案 A
// q85 面面平行判定：一个面内两条【相交】直线分别平行另一平面。✓ 答案 B
// q86 垂直同一平面的两直线平行（线面垂直性质定理）。✓ 答案 A
// q87 面面垂直性质：α⊥β，a⊂α 且 a⊥交线 → a⊥β。✓ 答案 B
// q88 B₁D 与底面：投影为 BD，tan θ = B₁B/BD = 2/(2√2) = √2/2。✓ 答案 A
// q89 正四棱锥底面边长 2、高 1：底面中心到边中点距离 = 1，tan θ = 1/1 = 1 → 45°。✓ 答案 B
// q90 a+b = (1+0, 2+1, 0+3) = (1,3,3)。✓ 答案 A
// q91 BC 中点 = ((2+0)/2, (2+2)/2, 0) = (1,2,0)。✓ 答案 A
// q92 a·b = 2×1 + (−1)×2 + 2×(−1) = −2。✓ 答案 A
// q93 b = 2a → 共线（平行）。✓ 答案 A
// q94 cos = 1/(√2·√2) = 1/2 → 60°。✓ 答案 C
// q95 AA₁=(0,0,2)，BD=D−B=(−2,−2,0)，点积 = 0 → 垂直。✓ 答案 A
// q96 DB₁=(2,2,2)，sin θ = |2|/(2√3) = √3/3。✓ 答案 A
// q97 面 A₁BD 法向量 = DA₁×DB = (2,0,2)×(2,2,0) = (−4,4,4)∥(−1,1,1)，
//     与底面法向量 (0,0,1) 的 |cos| = 1/√3 = √3/3。✓ 答案 A
// q98 面 DAA₁D₁ 内含 DA=(2,0,0)、DD₁=(0,0,2)，法向量须与二者点积为 0 → (0,1,0)。✓ 答案 A
// q99 E=DD₁ 中点 (0,0,1)：AE=(−2,0,1)，AC₁=(−2,2,2)，点积 6，|AE|=√5，|AC₁|=2√3，
//     cos = 6/(2√15) = 3/√15 = √15/5。✓ 答案 A
// q100 平面 A₁BD 过顶点 A 的三个邻点，截去三棱锥 A-A₁BD：三条棱两两垂直长均为 2，
//      V = (1/3)×(½×2×2)×2 = 4/3（即 abc/6 = 8/6）。✓ 答案 A

export const QUIZZES = [
  {
    id: 'q01',
    category: '结构',
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
    category: '展开图',
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
    category: '结构',
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
    category: '表面积体积',
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
    category: '结构',
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
    category: '表面积体积',
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
    category: '表面积体积',
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
    category: '表面积体积',
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
    category: '截面',
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
    category: '表面积体积',
    challenge: { lStars: 2, eHint: '不用设未知数，直接按 3:1 分配体积和' },
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
    category: '三视图',
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
    category: '三视图',
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
    category: '三视图',
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
    category: '展开图',
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
    category: '展开图',
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
    category: '展开图',
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
    category: '展开图',
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
    category: '表面积体积',
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
    category: '表面积体积',
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
    category: '表面积体积',
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
    category: '平行垂直',
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
    category: '平行垂直',
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
    category: '位置关系',
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
    category: '截面',
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
    category: '位置关系',
    challenge: { lStars: 2, eHint: '别逐条判断，先数「不异面」的：平行的加相交的，再做减法' },
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
    category: '截面',
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
    category: '表面积体积',
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
    category: '表面积体积',
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
    category: '表面积体积',
    challenge: { lStars: 3, eHint: '试试把这个三棱锥补成正方体' },
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
    category: '表面积体积',
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
    category: '三视图',
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
    category: '三视图',
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
    category: '三视图',
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
    category: '三视图',
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
    category: '空间向量',
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
    category: '空间向量',
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
    category: '空间向量',
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
    category: '空间向量',
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
    category: '空间向量',
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
    category: '空间向量',
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
    category: '空间向量',
    challenge: { lStars: 2, eHint: '不用建系，先找 AC₁ 在底面上的投影' },
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
    category: '空间向量',
    challenge: { lStars: 2, eHint: '交线是 AB，在点 B 处找两条都垂直 AB 的线，直接看平面角' },
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
    category: '空间向量',
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
    category: '三视图',
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
    category: '空间向量',
    challenge: { lStars: 3, eHint: '不用坐标：底面正方形对角线互相垂直，想想三垂线定理' },
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
    category: '空间向量',
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
    category: '空间向量',
    challenge: { lStars: 3, eHint: '不用建系，把 B₁C 平移到 A₁D，找等边三角形' },
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
    category: '空间向量',
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
    category: '三视图',
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
    category: '空间向量',
    challenge: { lStars: 2, eHint: '不用建系：AC₁ 在底面的投影是 AC，对 BD 用三垂线定理' },
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
  {
    id: 'q51',
    category: '结构',
    title: '顶点数与面数',
    solid: 'cube',
    difficulty: 1,
    question: '正方体的顶点数与面数之和为多少？',
    scene: {
      highlight: { points: ['A', 'B', 'C', 'D', 'A1', 'B1', 'C1', 'D1'], edges: [], faces: [0, 1, 2, 3, 4, 5] },
      spin: true,
      section: null,
    },
    answer: {
      type: 'choice',
      options: ['12', '14', '16', '10'],
      correct: 1,
    },
    explain: [
      {
        text: '<b>关键思路</b>：分别数顶点（底面 4 + 顶面 4）和面（上下 2 + 四周 4），再相加。',
        audio: 'q51-ex1',
        scene: {
          highlight: { points: ['A', 'B', 'C', 'D', 'A1', 'B1', 'C1', 'D1'], edges: [], faces: [] },
          spin: true,
          section: null,
        },
      },
      {
        text: '<b>完整计算</b>：顶点 8 个，面 6 个，8 + 6 = <b>14</b>，选 <b>B</b>。<br>顺便记住棱是 12 条——8、12、6 这组数用欧拉公式串起来：8 − 12 + 6 = 2。',
        audio: 'q51-ex2',
        scene: {
          highlight: { points: ['A', 'B', 'C', 'D', 'A1', 'B1', 'C1', 'D1'], edges: [], faces: [0, 1, 2, 3, 4, 5] },
          spin: true,
          section: null,
        },
      },
    ],
  },
  {
    id: 'q52',
    category: '结构',
    title: '四棱锥的棱数',
    solid: 'pyramid4',
    difficulty: 2,
    question: '四棱锥共有多少条棱？',
    scene: { highlight: { points: ['P'], edges: [['P', 'A'], ['P', 'B'], ['P', 'C'], ['P', 'D']], faces: [0] }, spin: true, section: null },
    answer: {
      type: 'choice',
      options: ['6 条', '8 条', '10 条', '12 条'],
      correct: 1,
    },
    explain: [
      {
        text: '<b>关键思路</b>：分两类数——底面多边形的边，加上锥顶 P 连出的侧棱。',
        audio: 'q52-ex1',
        scene: { highlight: { points: ['P'], edges: [['P', 'A'], ['P', 'B'], ['P', 'C'], ['P', 'D']], faces: [0] }, spin: true, section: null },
      },
      {
        text: '<b>完整计算</b>：底面 4 条边 + 侧棱 4 条 = <b>8</b> 条，选 <b>B</b>。<br>欧拉公式验证：V = 5，F = 5，E = 5 + 5 − 2 = 8，一致。',
        audio: 'q52-ex2',
        scene: { highlight: { points: ['A', 'B', 'C', 'D', 'P'], edges: [], faces: [] }, spin: true, section: null },
      },
    ],
  },
  {
    id: 'q53',
    category: '结构',
    title: '欧拉公式求棱数',
    solid: 'prism3',
    difficulty: 2,
    question: '一个凸多面体有 6 个顶点、5 个面，则它有多少条棱？',
    scene: {
      highlight: { points: [], edges: [['A', 'B'], ['B', 'C'], ['C', 'A'], ['A1', 'B1'], ['B1', 'C1'], ['C1', 'A1'], ['A', 'A1'], ['B', 'B1'], ['C', 'C1']], faces: [] },
      spin: true,
      section: null,
    },
    answer: {
      type: 'choice',
      options: ['8 条', '9 条', '10 条', '11 条'],
      correct: 1,
    },
    explain: [
      {
        text: '<b>关键思路</b>：直接用欧拉公式 V − E + F = 2，解出 E = V + F − 2。',
        audio: 'q53-ex1',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
      },
      {
        text: '<b>完整计算</b>：E = 6 + 5 − 2 = <b>9</b> 条，选 <b>B</b>。<br>这个多面体就是三棱柱（如图）：6 顶点、5 面、9 棱，可以亲自数一遍验证。',
        audio: 'q53-ex2',
        scene: {
          highlight: { points: [], edges: [['A', 'B'], ['B', 'C'], ['C', 'A'], ['A1', 'B1'], ['B1', 'C1'], ['C1', 'A1'], ['A', 'A1'], ['B', 'B1'], ['C', 'C1']], faces: [] },
          spin: true,
          section: null,
        },
      },
    ],
  },
  {
    id: 'q54',
    category: '结构',
    title: '六棱柱的面数',
    solid: 'prism6',
    difficulty: 2,
    question: '六棱柱共有多少个面？',
    scene: { highlight: { points: [], edges: [], faces: [0, 1] }, spin: true, section: null },
    answer: {
      type: 'choice',
      options: ['6 个', '7 个', '8 个', '12 个'],
      correct: 2,
    },
    explain: [
      {
        text: '<b>关键思路</b>：n 棱柱的面 = 2 个底面 + n 个侧面。',
        audio: 'q54-ex1',
        scene: { highlight: { points: [], edges: [], faces: [0, 1] }, spin: true, section: null },
      },
      {
        text: '<b>完整计算</b>：六棱柱 = 2 + 6 = <b>8</b> 个面，选 <b>C</b>。<br>欧拉验证：12 顶点、18 条棱，12 − 18 + 8 = 2 ✓。',
        audio: 'q54-ex2',
        scene: { highlight: { points: [], edges: [], faces: [0, 1, 2, 3, 4, 5, 6, 7] }, spin: true, section: null },
      },
    ],
  },
  {
    id: 'q55',
    category: '结构',
    title: '由棱数反推顶点数',
    solid: 'cube',
    difficulty: 3,
    question: '一个多面体每个顶点处恰好有 3 条棱相交，它共有 12 条棱。这个多面体有多少个顶点？',
    scene: {
      highlight: { points: ['A'], edges: [['A', 'B'], ['A', 'D'], ['A', 'A1']], faces: [] },
      spin: true,
      section: null,
    },
    answer: {
      type: 'choice',
      options: ['6 个', '8 个', '10 个', '12 个'],
      correct: 1,
    },
    explain: [
      {
        text: '<b>关键思路</b>：用"握手"计数——每个顶点数出 3 条棱，总次数 3V；每条棱被它的两个端点各数一次，总次数 2E。',
        audio: 'q55-ex1',
        scene: {
          highlight: { points: ['A'], edges: [['A', 'B'], ['A', 'D'], ['A', 'A1']], faces: [] },
          spin: false,
          section: null,
        },
      },
      {
        text: '<b>完整计算</b>：3V = 2E = 2 × 12 = 24，V = <b>8</b>，选 <b>B</b>。<br>正方体正是这样的多面体——图中顶点 A 处恰好 3 条棱相交。',
        audio: 'q55-ex2',
        scene: {
          highlight: { points: ['A', 'B', 'C', 'D', 'A1', 'B1', 'C1', 'D1'], edges: [], faces: [] },
          spin: true,
          section: null,
        },
      },
    ],
  },
  {
    id: 'q56',
    category: '表面积体积',
    title: '正方体的表面积',
    solid: 'cube',
    difficulty: 1,
    question: '棱长为 3 的正方体，表面积是多少？',
    scene: { highlight: { points: [], edges: [], faces: [0, 1, 2, 3, 4, 5] }, spin: true, section: null },
    answer: {
      type: 'choice',
      options: ['27', '54', '81', '36'],
      correct: 1,
    },
    explain: [
      {
        text: '<b>关键思路</b>：正方体 6 个面全等，每个面是边长 3 的正方形。',
        audio: 'q56-ex1',
        scene: { highlight: { points: [], edges: [], faces: [2] }, spin: false, section: null },
      },
      {
        text: '<b>完整计算</b>：一个面 3 × 3 = 9，S = 6 × 9 = <b>54</b>，选 <b>B</b>。<br>27 是体积（3<sup>3</sup>），注意区分表面积与体积。',
        audio: 'q56-ex2',
        scene: { highlight: { points: [], edges: [], faces: [0, 1, 2, 3, 4, 5] }, spin: true, section: null },
      },
    ],
  },
  {
    id: 'q57',
    category: '表面积体积',
    title: '三棱柱表面积综合',
    solid: 'prism3',
    difficulty: 2,
    question: '直三棱柱的底面是直角边为 3、4 的直角三角形，侧棱长 5。它的表面积是多少？',
    scene: { highlight: { points: [], edges: [['A', 'B'], ['B', 'C'], ['C', 'A']], faces: [0] }, spin: true, section: null },
    answer: {
      type: 'choice',
      options: ['60', '66', '72', '78'],
      correct: 2,
    },
    explain: [
      {
        text: '<b>关键思路</b>：S<sub>表</sub> = 2S<sub>底</sub> + S<sub>侧</sub>，其中 S<sub>侧</sub> = 底面周长 × 高。先算底面面积和周长（斜边 5）。',
        audio: 'q57-ex1',
        scene: { highlight: { points: [], edges: [['A', 'B'], ['B', 'C'], ['C', 'A']], faces: [0] }, spin: false, section: null },
      },
      {
        text: '<b>完整计算</b>：S<sub>底</sub> = 6，周长 = 3 + 4 + 5 = 12，S<sub>侧</sub> = 12 × 5 = 60。<br>S<sub>表</sub> = 2 × 6 + 60 = <b>72</b>，选 <b>C</b>。60 只是侧面积，别忘了两个底面。',
        audio: 'q57-ex2',
        scene: { highlight: { points: [], edges: [], faces: [0, 1, 2, 3, 4] }, spin: true, section: null },
      },
    ],
  },
  {
    id: 'q58',
    category: '表面积体积',
    title: '圆锥的侧面积',
    solid: 'cone',
    difficulty: 2,
    question: '圆锥的底面半径为 3，母线长为 5。它的侧面积是多少？',
    scene: { highlight: { points: ['P', 'A'], edges: [['A', 'P']], faces: [] }, spin: true, section: null },
    answer: {
      type: 'choice',
      options: ['12π', '15π', '20π', '24π'],
      correct: 1,
    },
    explain: [
      {
        text: '<b>关键思路</b>：圆锥侧面积公式 S = πrl，其中 l 是<b>母线</b>。也可以理解为展开扇形的面积。',
        audio: 'q58-ex1',
        scene: { highlight: { points: ['P', 'A'], edges: [['A', 'P']], faces: [] }, spin: true, section: null },
      },
      {
        text: '<b>完整计算</b>：S = π × 3 × 5 = <b>15π</b>，选 <b>B</b>。<br>12π 是体积（h = 4 时），注意这题问的是侧面积。',
        audio: 'q58-ex2',
        scene: { highlight: { points: ['P'], edges: [], faces: [0] }, spin: true, section: null },
      },
    ],
  },
  {
    id: 'q59',
    category: '表面积体积',
    title: '扇形展开反求底面半径',
    solid: 'cone',
    difficulty: 2,
    question: '一个圆锥的侧面展开图是圆心角 120°、半径 6 的扇形。这个圆锥的底面半径是多少？',
    scene: { highlight: { points: ['P', 'A'], edges: [['A', 'P']], faces: [0] }, spin: true, section: null },
    answer: {
      type: 'choice',
      options: ['1', '2', '3', '4'],
      correct: 1,
    },
    explain: [
      {
        text: '<b>关键思路</b>：扇形的<b>弧长</b>卷起来就是底面圆周——弧长 = 底面周长。扇形半径就是母线。',
        audio: 'q59-ex1',
        scene: { highlight: { points: ['P', 'A'], edges: [['A', 'P']], faces: [] }, spin: true, section: null },
      },
      {
        text: '<b>完整计算</b>：弧长 = (120/360) × 2π × 6 = 4π；由 2πr = 4π 得 r = <b>2</b>，选 <b>B</b>。<br>误把扇形半径 6 当底面半径是最常见错误。',
        audio: 'q59-ex2',
        scene: { highlight: { points: [], edges: [], faces: [0] }, spin: true, section: null },
      },
    ],
  },
  {
    id: 'q60',
    category: '表面积体积',
    challenge: { lStars: 2, eHint: '别硬作垂线，同一个三棱锥换个底面算体积' },
    title: '换底法求高',
    solid: 'pyramid3',
    difficulty: 3,
    question: '三棱锥 P-ABC 中，底面 ABC 的面积为 6，P 到底面的距离为 4。若以侧面 PAB（面积为 4）为底面，则 C 到平面 PAB 的距离是多少？',
    scene: { highlight: { points: ['A', 'B', 'C', 'P'], edges: [['P', 'A'], ['P', 'B'], ['P', 'C']], faces: [0] }, spin: true, section: null },
    answer: {
      type: 'choice',
      options: ['4', '6', '8', '3'],
      correct: 1,
    },
    explain: [
      {
        text: '<b>关键思路</b>：<b>等积变换</b>——同一个三棱锥，换不同的面当底，体积不变。先以 ABC 为底算出体积。',
        audio: 'q60-ex1',
        scene: { highlight: { points: ['A', 'B', 'C'], edges: [], faces: [0] }, spin: true, section: null },
      },
      {
        text: '<b>完整计算</b>：V = (6 × 4)/3 = 8。换底：V = (4 × h)/3 = 8，解得 h = <b>6</b>，选 <b>B</b>。<br>换底法是求点面距离（尤其是不好直接作垂线时）的利器。',
        audio: 'q60-ex2',
        scene: { highlight: { points: ['A', 'B', 'P'], edges: [['P', 'A'], ['P', 'B'], ['A', 'B']], faces: [] }, spin: true, section: null },
      },
    ],
  },
  {
    id: 'q61',
    category: '表面积体积',
    title: '容器容积（应用）',
    solid: 'cylinder',
    difficulty: 2,
    question: '一个圆柱形水桶，底面半径 2 dm，高 5 dm。它最多能装水约多少升？（π 取 3.14，1 升 = 1 立方分米）',
    scene: { highlight: { points: [], edges: [], faces: [0, 1] }, spin: true, section: null },
    answer: {
      type: 'choice',
      options: ['31.4 升', '62.8 升', '125.6 升', '20 升'],
      correct: 1,
    },
    explain: [
      {
        text: '<b>关键思路</b>：容积就是圆柱体积 V = πr<sup>2</sup>h，再代入 π ≈ 3.14 换成升。',
        audio: 'q61-ex1',
        scene: { highlight: { points: [], edges: [], faces: [0] }, spin: true, section: null },
      },
      {
        text: '<b>完整计算</b>：V = 3.14 × 2<sup>2</sup> × 5 = 62.8 立方分米 = <b>62.8 升</b>，选 <b>B</b>。<br>31.4 是只算了底面积乘高的一半——应用题算完要回看数量级是否合理。',
        audio: 'q61-ex2',
        scene: { highlight: { points: [], edges: [], faces: [0, 1] }, spin: true, section: null },
      },
    ],
  },
  {
    id: 'q62',
    category: '表面积体积',
    title: '制作用料（应用）',
    solid: 'cylinder',
    difficulty: 3,
    question: '制作一个<b>无盖</b>圆柱形笔筒，底面半径 1 dm，高 4 dm。至少需要多少平方分米的材料？',
    scene: { highlight: { points: [], edges: [], faces: [0] }, spin: true, section: null },
    answer: {
      type: 'choice',
      options: ['8π', '9π', '10π', '12π'],
      correct: 1,
    },
    explain: [
      {
        text: '<b>关键思路</b>：用料面积 = 侧面积 + <b>一个</b>底面（无盖！）。侧面展开是 2πr × h 的长方形。',
        audio: 'q62-ex1',
        scene: { highlight: { points: [], edges: [], faces: [0] }, spin: true, section: null },
      },
      {
        text: '<b>完整计算</b>：侧面积 = 2π × 1 × 4 = 8π，底面 = π × 1<sup>2</sup> = π。<br>合计 8π + π = <b>9π</b>，选 <b>B</b>。10π 是多加了盖子——应用题先想清楚"有几个面"。',
        audio: 'q62-ex2',
        scene: { highlight: { points: [], edges: [], faces: [0, 1] }, spin: true, section: null },
      },
    ],
  },
  {
    id: 'q63',
    category: '表面积体积',
    challenge: { lStars: 2, eHint: '被盖住的圆和圆柱上底一样大，会互相抵消' },
    title: '组合体的表面积',
    solid: 'cube',
    difficulty: 3,
    question: '在棱长为 2 的正方体上表面中央，放一个底面半径为 1、高为 1 的圆柱（底面贴合）。这个组合体的表面积是多少？',
    scene: { highlight: { points: [], edges: [], faces: [1] }, spin: true, section: null },
    answer: {
      type: 'choice',
      options: ['24 + π', '24 + 2π', '24 + 3π', '24'],
      correct: 1,
    },
    explain: [
      {
        text: '<b>关键思路</b>：组合体表面积 = 各部分表面积之和 − 两处贴合面。正方体被盖住一个圆，圆柱的下底面也不外露。',
        audio: 'q63-ex1',
        scene: { highlight: { points: [], edges: [], faces: [1] }, spin: true, section: null },
      },
      {
        text: '<b>完整计算</b>：正方体 24；圆柱外露部分 = 侧面 2π + 上底 π = 3π；正方体被盖住 π。<br>合计 24 + 3π − π = <b>24 + 2π</b>，选 <b>B</b>。巧记：盖住多少就补回上底，净增的其实只有圆柱侧面积。',
        audio: 'q63-ex2',
        scene: { highlight: { points: [], edges: [], faces: [0, 1] }, spin: true, section: null },
      },
    ],
  },
  {
    id: 'q64',
    category: '表面积体积',
    challenge: { lStars: 1, eHint: 'R²−d² 其实是个 3-4-5 直角三角形' },
    title: '球的截面圆面积',
    solid: 'sphere',
    difficulty: 3,
    question: '半径为 5 的球，被距球心 3 的平面所截。截面圆的面积是多少？',
    scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: { n: [0, 1, 0], d: 0.6 } },
    answer: {
      type: 'choice',
      options: ['9π', '16π', '25π', '12π'],
      correct: 1,
    },
    explain: [
      {
        text: '<b>关键思路</b>：球心到截面的距离 d、球半径 R、截面圆半径 r 构成直角三角形：r = √(R<sup>2</sup> − d<sup>2</sup>)。',
        audio: 'q64-ex1',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: { n: [0, 1, 0], d: 0.6 } },
      },
      {
        text: '<b>完整计算</b>：r = √(25 − 9) = 4，S = π × 4<sup>2</sup> = <b>16π</b>，选 <b>B</b>。<br>9π 是把 d 当成了截面半径——d 是"距离"不是"半径"。',
        audio: 'q64-ex2',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
      },
    ],
  },
  {
    id: 'q65',
    category: '表面积体积',
    title: '正四棱锥的表面积',
    solid: 'pyramid4',
    difficulty: 3,
    question: '正四棱锥的底面边长为 2，斜高（侧面三角形的高）为 2。它的表面积是多少？',
    scene: { highlight: { points: ['P'], edges: [], faces: [0, 1] }, spin: true, section: null },
    answer: {
      type: 'choice',
      options: ['8', '12', '16', '20'],
      correct: 1,
    },
    explain: [
      {
        text: '<b>关键思路</b>：表面积 = 底面正方形 + 4 个全等的侧面三角形。侧面三角形以底边 2 为底、斜高 2 为高。',
        audio: 'q65-ex1',
        scene: { highlight: { points: ['P'], edges: [], faces: [1] }, spin: true, section: null },
      },
      {
        text: '<b>完整计算</b>：底面 = 2 × 2 = 4；一个侧面 = (2 × 2)/2 = 2，四个侧面 = 8。<br>S = 4 + 8 = <b>12</b>，选 <b>B</b>。注意<b>斜高</b>不是棱锥的高，别混淆。',
        audio: 'q65-ex2',
        scene: { highlight: { points: ['P'], edges: [], faces: [0, 1, 2, 3, 4] }, spin: true, section: null },
      },
    ],
  },
  {
    id: 'q66',
    category: '展开图',
    challenge: { lStars: 3, eHint: '别沿棱走，把相邻两个面摊平，最短路变成直线' },
    title: '表面最短路径（动点最值入门）',
    solid: 'cube',
    difficulty: 3,
    question: '一只蚂蚁从正方体（棱长 2）顶点 A 出发，<b>沿表面</b>爬到对角顶点 C<sub>1</sub>。最短路径的长度是多少？',
    scene: { highlight: { points: ['A', 'C1'], edges: [], faces: [] }, spin: true, section: null, unfold: 0 },
    answer: {
      type: 'choice',
      options: ['2√5', '6', '2√3', '4√2'],
      correct: 0,
    },
    explain: [
      {
        text: '<b>关键思路</b>：沿表面的最短路线，<b>展开后就是直线</b>。把相邻的两个面摊平成一个长方形，蚂蚁走的是它的对角线。',
        audio: 'q66-ex1',
        scene: { highlight: { points: ['A', 'C1'], edges: [], faces: [2, 1] }, spin: false, section: null, unfold: 0.5 },
      },
      {
        text: '<b>完整计算</b>：展开后是 2 × (2+2) 的长方形，对角线 = √(2<sup>2</sup> + 4<sup>2</sup>) = √20 = <b>2√5</b>，选 <b>A</b>。<br>2√3 是穿过内部的体对角线——蚂蚁不能打洞。几种展开方式比较后 2√5 最小。',
        audio: 'q66-ex2',
        scene: { highlight: { points: ['A', 'C1'], edges: [['A', 'C1']], faces: [] }, spin: true, section: null, unfold: 1 },
      },
    ],
  },
  {
    id: 'q67',
    category: '展开图',
    title: '棱柱侧面展开图的面积',
    solid: 'prism3',
    difficulty: 2,
    question: '正三棱柱的底面边长为 2，高为 5。它的侧面展开图（一个长方形）的面积是多少？',
    scene: { highlight: { points: [], edges: [], faces: [2, 3, 4] }, spin: true, section: null, unfold: 1 },
    answer: {
      type: 'choice',
      options: ['20', '30', '40', '25'],
      correct: 1,
    },
    explain: [
      {
        text: '<b>关键思路</b>：侧面展开图的一条边是棱柱的高，另一条边是<b>底面周长</b>——侧面积与展开图面积是同一个东西。',
        audio: 'q67-ex1',
        scene: { highlight: { points: [], edges: [], faces: [2, 3, 4] }, spin: false, section: null, unfold: 0.5 },
      },
      {
        text: '<b>完整计算</b>：底面周长 = 2 × 3 = 6，面积 = 6 × 5 = <b>30</b>，选 <b>B</b>。<br>这就是"直棱柱侧面积 = 底面周长 × 高"的展开图解释。',
        audio: 'q67-ex2',
        scene: { highlight: { points: [], edges: [], faces: [2, 3, 4] }, spin: true, section: null, unfold: 1 },
      },
    ],
  },
  {
    id: 'q68',
    category: '展开图',
    title: '展开图中找相对面',
    solid: 'cube',
    difficulty: 2,
    question: '正方体"一四一"型展开图中，中间一行的四个正方形从左到右依次记为 ①②③④。折成正方体后，① 与 ③ 是？',
    scene: { highlight: { points: [], edges: [], faces: [2, 3, 4, 5] }, spin: true, section: null, unfold: 1 },
    answer: {
      type: 'choice',
      options: ['相对的面', '相邻的面', '重合的面', '无法确定'],
      correct: 0,
    },
    explain: [
      {
        text: '<b>关键思路</b>：中间一行四个面折起来恰好围成一圈侧面。隔一个格子的两个面分居两侧。',
        audio: 'q68-ex1',
        scene: { highlight: { points: [], edges: [], faces: [2, 3, 4, 5] }, spin: true, section: null, unfold: 0.5 },
      },
      {
        text: '<b>完整分析</b>：② 固定为前面，① 折到左面，③ 折到后面——① 与 ③ 互相<b>相对</b>，选 <b>A</b>。<br>同一行隔一格必相对，展开图口诀再次应验。',
        audio: 'q68-ex2',
        scene: { highlight: { points: [], edges: [], faces: [2, 4] }, spin: true, section: null, unfold: 0 },
      },
    ],
  },
  {
    id: 'q69',
    category: '展开图',
    challenge: { lStars: 3, eHint: '把侧面沿一条母线剪开摊平，绕一周的曲线变成直线' },
    title: '圆柱侧面上的最短路线',
    solid: 'cylinder',
    difficulty: 3,
    question: '圆柱的底面半径为 1，高为 3。一条细线从下底面某点出发，<b>绕侧面恰好一周</b>到达正上方对应点。细线的最短长度是多少？',
    scene: { highlight: { points: ['A', 'A1'], edges: [], faces: [] }, spin: true, section: null, unfold: 0 },
    answer: {
      type: 'choice',
      options: ['√(4π² + 9)', '2π + 3', '√13', '√(π² + 9)'],
      correct: 0,
    },
    explain: [
      {
        text: '<b>关键思路</b>：把侧面沿一条母线剪开摊平——侧面展开是 2π × 3 的长方形。"绕一周"意味着展开后终点在右边界的对应位置。',
        audio: 'q69-ex1',
        scene: { highlight: { points: ['A', 'A1'], edges: [] , faces: [] }, spin: false, section: null, unfold: 0.5 },
      },
      {
        text: '<b>完整计算</b>：展开后细线是长 2π、宽 3 的长方形的对角线：√((2π)<sup>2</sup> + 3<sup>2</sup>) = <b>√(4π² + 9)</b>，选 <b>A</b>。<br>曲面最短路，先展开再拉直。',
        audio: 'q69-ex2',
        scene: { highlight: { points: ['A', 'A1'], edges: [['A', 'A1']], faces: [] }, spin: true, section: null, unfold: 1 },
      },
    ],
  },
  {
    id: 'q70',
    category: '三视图',
    title: '由俯视图推主视图',
    solid: 'cube',
    difficulty: 2,
    question: '一个由小正方体搭成的几何体，俯视图是 2 × 2 的格子，各格层数为：前排 1、2，后排 2、3。从正面看，主视图两列的高度分别是？',
    scene: { highlight: { points: [], edges: [], faces: [1] }, spin: true, section: null, views: true },
    answer: {
      type: 'choice',
      options: ['1 和 3', '2 和 3', '2 和 2', '3 和 3'],
      correct: 1,
    },
    explain: [
      {
        text: '<b>关键思路</b>：主视图每一列的高度 = 该列上各格层数的<b>最大值</b>（前后叠在一起看，高的挡住矮的）。',
        audio: 'q70-ex1',
        scene: { highlight: { points: [], edges: [], faces: [1] }, spin: false, section: null, views: true },
      },
      {
        text: '<b>完整计算</b>：左列 max(1, 2) = 2，右列 max(2, 3) = 3。<br>主视图两列高度为 <b>2 和 3</b>，选 <b>B</b>。',
        audio: 'q70-ex2',
        scene: { highlight: { points: [], edges: [], faces: [1] }, spin: true, section: null, views: true },
      },
    ],
  },
  {
    id: 'q71',
    category: '三视图',
    title: '由三视图还原（圆台）',
    solid: 'frustum',
    difficulty: 2,
    question: '某几何体的主视图和左视图都是等腰梯形，俯视图是带中心点的圆。这个几何体是？',
    scene: { highlight: { points: [], edges: [], faces: [0, 1] }, spin: true, section: null, views: true },
    answer: {
      type: 'choice',
      options: ['圆柱', '圆锥', '圆台', '球'],
      correct: 2,
    },
    explain: [
      {
        text: '<b>关键思路</b>：俯视圆 → 旋转体；梯形（而非长方形或三角形）→ 上下不等粗但没有尖顶。',
        audio: 'q71-ex1',
        scene: { highlight: { points: [], edges: [], faces: [1] }, spin: false, section: null, views: true },
      },
      {
        text: '<b>逐项分析</b>：圆柱主视图是长方形；圆锥是三角形（俯视图中心点是锥顶）；球三视图都是圆。<br>梯形 + 圆形俯视 = <b>圆台</b>，选 <b>C</b>。',
        audio: 'q71-ex2',
        scene: { highlight: { points: [], edges: [], faces: [0, 1] }, spin: true, section: null, views: true },
      },
    ],
  },
  {
    id: 'q72',
    category: '三视图',
    title: '由三视图算棱锥体积',
    solid: 'pyramid4',
    difficulty: 3,
    question: '一个正四棱锥的主视图是底边为 4、高为 3 的等腰三角形。这个棱锥的体积是多少？',
    scene: { highlight: { points: ['P'], edges: [], faces: [0] }, spin: true, section: null, views: true },
    answer: {
      type: 'choice',
      options: ['12', '16', '24', '32'],
      correct: 1,
    },
    explain: [
      {
        text: '<b>关键思路</b>：正四棱锥主视图的底边 = 底面正方形的边长，三角形的高 = 棱锥的高。',
        audio: 'q72-ex1',
        scene: { highlight: { points: ['P'], edges: [], faces: [0] }, spin: false, section: null, views: true },
      },
      {
        text: '<b>完整计算</b>：S = 4 × 4 = 16，h = 3，V = Sh/3 = (16 × 3)/3 = <b>16</b>，选 <b>B</b>。<br>24 是把高当成了 4.5 或忘除 3 的变体——锥体永远先默念"除以三"。',
        audio: 'q72-ex2',
        scene: { highlight: { points: ['P'], edges: [['P', 'A'], ['P', 'B']], faces: [0] }, spin: true, section: null, views: true },
      },
    ],
  },
  {
    id: 'q73',
    category: '三视图',
    challenge: { lStars: 2, eHint: '长方体表面积 = 三个视图面积之和的两倍，不用先还原长宽高' },
    title: '由三视图算长方体表面积',
    solid: 'box',
    difficulty: 3,
    question: '一个长方体的三视图分别是：主视图 3 × 2、左视图 4 × 2、俯视图 3 × 4 的长方形。它的表面积是多少？',
    scene: { highlight: { points: [], edges: [], faces: [0, 1, 2, 3, 4, 5] }, spin: true, section: null, views: true },
    answer: {
      type: 'choice',
      options: ['26', '52', '24', '48'],
      correct: 1,
    },
    explain: [
      {
        text: '<b>关键思路</b>：由"长对正、高平齐、宽相等"对齐三视图，读出长、宽、高：主视给长 3 和高 2，左视给宽 4。',
        audio: 'q73-ex1',
        scene: { highlight: { points: [], edges: [], faces: [0, 1] }, spin: false, section: null, views: true },
      },
      {
        text: '<b>完整计算</b>：长 3、宽 4、高 2。S = 2 × (3×4 + 3×2 + 4×2) = 2 × 26 = <b>52</b>，选 <b>B</b>。<br>26 是三种面各算一个就停手了——表面积别忘了乘 2。',
        audio: 'q73-ex2',
        scene: { highlight: { points: [], edges: [], faces: [0, 1, 2, 3, 4, 5] }, spin: true, section: null, views: true },
      },
    ],
  },
  {
    id: 'q74',
    category: '截面',
    title: '球心到截面的距离',
    solid: 'sphere',
    difficulty: 2,
    question: '半径为 5 的球被一个平面所截，截面圆的半径为 3。球心到该截面的距离是多少？',
    scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: { n: [0, 1, 0], d: 0.8 } },
    answer: {
      type: 'choice',
      options: ['2', '3', '4', '√34'],
      correct: 2,
    },
    explain: [
      {
        text: '<b>关键思路</b>：R、d、r 的勾股关系 R<sup>2</sup> = d<sup>2</sup> + r<sup>2</sup>，这次反求 d。',
        audio: 'q74-ex1',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: { n: [0, 1, 0], d: 0.8 } },
      },
      {
        text: '<b>完整计算</b>：d = √(R<sup>2</sup> − r<sup>2</sup>) = √(25 − 9) = √16 = <b>4</b>，选 <b>C</b>。<br>√34 是错把公式加成 R<sup>2</sup> + r<sup>2</sup>——记住 d 和 r 是直角边，R 是斜边。',
        audio: 'q74-ex2',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
      },
    ],
  },
  {
    id: 'q75',
    category: '截面',
    title: '圆柱的轴平行截面',
    solid: 'cylinder',
    difficulty: 2,
    question: '用平行于轴线的平面截半径为 2 的圆柱，平面到轴线的距离为 1，圆柱高为 3。截面（长方形）的面积是多少？',
    scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: { n: [1, 0, 0], d: 1 } },
    answer: {
      type: 'choice',
      options: ['3√3', '6√3', '4√3', '12'],
      correct: 1,
    },
    explain: [
      {
        text: '<b>关键思路</b>：截面是长方形，一边 = 圆柱的高 3；另一边 = 底面圆被截出的<b>弦长</b>。弦长用垂径定理：2√(r<sup>2</sup> − d<sup>2</sup>)。',
        audio: 'q75-ex1',
        scene: { highlight: { points: [], edges: [], faces: [0] }, spin: false, section: { n: [1, 0, 0], d: 1 } },
      },
      {
        text: '<b>完整计算</b>：弦长 = 2√(4 − 1) = 2√3，面积 = 2√3 × 3 = <b>6√3</b>，选 <b>B</b>。<br>和球的截面是同一个勾股关系——都是"半径−距离−弦半径"的直角三角形。',
        audio: 'q75-ex2',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: { n: [1, 0, 0], d: 1 } },
      },
    ],
  },
  {
    id: 'q76',
    category: '截面',
    challenge: { lStars: 2, eHint: '两个中点的连线是三角形中位线，一步出截面宽度' },
    title: '过两棱中点的竖直截面',
    solid: 'cube',
    difficulty: 3,
    question: '棱长为 2 的正方体中，过棱 AB 的中点、棱 AD 的中点作一个<b>竖直</b>（平行于侧棱）的截面。截面面积是多少？',
    scene: {
      highlight: { points: ['A', 'B', 'D'], edges: [['A', 'B'], ['A', 'D']], faces: [0] },
      spin: true,
      section: { n: [1, 0, 1], d: -1 },
    },
    answer: {
      type: 'choice',
      options: ['√2', '2√2', '2', '4√2'],
      correct: 1,
    },
    explain: [
      {
        text: '<b>关键思路</b>：竖直截面是长方形，高 = 棱长 2；宽 = 底面上两中点连线的长度——即底面对角线的一半。',
        audio: 'q76-ex1',
        scene: {
          highlight: { points: ['A', 'B', 'D'], edges: [['A', 'B'], ['A', 'D'], ['B', 'D']], faces: [0] },
          spin: false,
          section: null,
        },
      },
      {
        text: '<b>完整计算</b>：底面对角线 BD = 2√2，中点连线 = ½BD = √2（三角形中位线）。<br>面积 = √2 × 2 = <b>2√2</b>，选 <b>B</b>。图中截面平面把顶点 A 所在的小角切了下来。',
        audio: 'q76-ex2',
        scene: {
          highlight: { points: ['A'], edges: [['A', 'A1']], faces: [] },
          spin: true,
          section: { n: [1, 0, 1], d: -1 },
        },
      },
    ],
  },
  {
    id: 'q77',
    category: '截面',
    title: '斜截圆柱的截面形状',
    solid: 'cylinder',
    difficulty: 2,
    question: '用一个平面斜截圆柱（平面既不平行于底面，也不平行于轴线），截口的形状是？',
    scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: { n: [1, 1, 0], d: 0.5 } },
    answer: {
      type: 'choice',
      options: ['圆', '椭圆', '长方形', '抛物线'],
      correct: 1,
    },
    explain: [
      {
        text: '<b>关键思路</b>：平行底面截圆柱得圆；平行轴截得长方形（矩形）；斜着截介于两者之间——被"压斜"的圆。',
        audio: 'q77-ex1',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: { n: [0, 1, 0], d: 1 } },
      },
      {
        text: '<b>结论</b>：斜截圆柱的截口是<b>椭圆</b>，选 <b>B</b>。<br>抛物线是斜截<b>圆锥</b>（平行于母线）的产物，别记混。图中斜截面明显被拉长了一个方向。',
        audio: 'q77-ex2',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: { n: [1, 1, 0], d: 0.5 } },
      },
    ],
  },
  {
    id: 'q78',
    category: '截面',
    title: '棱锥平行截面与底面的面积比',
    solid: 'pyramid4',
    difficulty: 3,
    question: '用平行于底面的平面，在四棱锥的<b>一半高度</b>处截开。截面面积是底面面积的多少？',
    scene: {
      highlight: { points: ['P'], edges: [], faces: [0] },
      spin: true,
      section: { n: [0, 1, 0], d: 1.3 },
    },
    answer: {
      type: 'choice',
      options: ['1/2', '1/4', '1/3', '2/3'],
      correct: 1,
    },
    explain: [
      {
        text: '<b>关键思路</b>：平行底面的截面与底面<b>相似</b>，相似比 = 截面到锥顶的距离 ÷ 棱锥的高。一半高度处，相似比是 1/2。',
        audio: 'q78-ex1',
        scene: {
          highlight: { points: ['P'], edges: [['P', 'A'], ['P', 'B'], ['P', 'C'], ['P', 'D']], faces: [] },
          spin: true,
          section: { n: [0, 1, 0], d: 1.3 },
        },
      },
      {
        text: '<b>完整计算</b>：面积比 = 相似比的平方 = (1/2)<sup>2</sup> = <b>1/4</b>，选 <b>B</b>。<br>1/2 是"线性比"，面积要<b>平方</b>——这就是锥体体积带 1/3 的几何根源。',
        audio: 'q78-ex2',
        scene: {
          highlight: { points: ['P'], edges: [], faces: [0] },
          spin: true,
          section: { n: [0, 1, 0], d: 1.3 },
        },
      },
    ],
  },
  {
    id: 'q79',
    category: '位置关系',
    title: '垂直于同一直线的两直线',
    solid: 'cube',
    difficulty: 1,
    question: '在空间中，垂直于同一条直线的两条直线，它们的位置关系是？',
    scene: {
      highlight: { points: ['A'], edges: [['A', 'A1'], ['A', 'B'], ['A', 'D']], faces: [] },
      spin: true,
      section: null,
    },
    answer: {
      type: 'choice',
      options: ['一定平行', '一定相交', '一定异面', '平行、相交、异面都有可能'],
      correct: 3,
    },
    explain: [
      {
        text: '<b>关键思路</b>：平面几何里"垂直同一直线 ⇒ 平行"，但空间中没有这条定理——到正方体里找反例。',
        audio: 'q79-ex1',
        scene: {
          highlight: { points: ['A'], edges: [['A', 'A1'], ['A', 'B'], ['A', 'D']], faces: [] },
          spin: false,
          section: null,
        },
      },
      {
        text: '<b>完整分析</b>：取 AA<sub>1</sub> 为基准。AB 与 AD 都 ⊥ AA<sub>1</sub> 却<b>相交</b>；AB 与 C<sub>1</sub>D<sub>1</sub> 都 ⊥ AA<sub>1</sub> 且<b>平行</b>；AD 与 BB<sub>1</sub> 都 ⊥ AA<sub>1</sub> 且<b>异面</b>。<br>三种都可能，选 <b>D</b>。',
        audio: 'q79-ex2',
        scene: {
          highlight: { points: [], edges: [['A', 'A1'], ['A', 'D'], ['B', 'B1']], faces: [] },
          spin: true,
          section: null,
        },
      },
    ],
  },
  {
    id: 'q80',
    category: '位置关系',
    title: '平行于同一平面的两直线',
    solid: 'cube',
    difficulty: 2,
    question: '在空间中，平行于同一个平面的两条直线，它们的位置关系是？',
    scene: {
      highlight: { points: [], edges: [['A1', 'B1'], ['A1', 'D1'], ['B1', 'C1']], faces: [0] },
      spin: true,
      section: null,
    },
    answer: {
      type: 'choice',
      options: ['一定平行', '一定相交', '一定异面', '平行、相交、异面都有可能'],
      correct: 3,
    },
    explain: [
      {
        text: '<b>关键思路</b>：同样没有传递性。以底面为基准平面，到顶面及其延伸线上找例子。',
        audio: 'q80-ex1',
        scene: {
          highlight: { points: [], edges: [['A1', 'B1']], faces: [0] },
          spin: false,
          section: null,
        },
      },
      {
        text: '<b>完整分析</b>：A<sub>1</sub>B<sub>1</sub> 与 C<sub>1</sub>D<sub>1</sub> 都 ∥ 底面且互相<b>平行</b>；A<sub>1</sub>B<sub>1</sub> 与 A<sub>1</sub>D<sub>1</sub> 都 ∥ 底面却<b>相交</b>；A<sub>1</sub>B<sub>1</sub> 与 B<sub>1</sub>C<sub>1</sub> 方向不同且……再换 AD 方向的在底面内的线即可构造<b>异面</b>。<br>三种都可能，选 <b>D</b>。空间位置关系题，首选在正方体里找反例。',
        audio: 'q80-ex2',
        scene: {
          highlight: { points: [], edges: [['A1', 'B1'], ['A1', 'D1'], ['B1', 'C1']], faces: [0] },
          spin: true,
          section: null,
        },
      },
    ],
  },
  {
    id: 'q81',
    category: '位置关系',
    title: '异面直线所成角（平移法）',
    solid: 'cube',
    difficulty: 2,
    question: '正方体中，异面直线 AB 与 CC<sub>1</sub> 所成角的大小是？',
    scene: {
      highlight: { points: [], edges: [['A', 'B'], ['C', 'C1']], faces: [] },
      spin: true,
      section: null,
    },
    answer: {
      type: 'choice',
      options: ['45°', '60°', '90°', '30°'],
      correct: 2,
    },
    explain: [
      {
        text: '<b>关键思路</b>：<b>平移法</b>——把 CC<sub>1</sub> 平移到与 AB 相交的位置：CC<sub>1</sub> ∥ BB<sub>1</sub>，而 BB<sub>1</sub> 与 AB 交于 B。',
        audio: 'q81-ex1',
        scene: {
          highlight: { points: ['B'], edges: [['A', 'B'], ['C', 'C1'], ['B', 'B1']], faces: [] },
          spin: false,
          section: null,
        },
      },
      {
        text: '<b>完整分析</b>：所成角 = ∠ABB<sub>1</sub> 。侧棱垂直于底面，故 BB<sub>1</sub> ⊥ AB，所成角 = <b>90°</b>，选 <b>C</b>。<br>异面直线也可以垂直——"垂直"不要求相交。',
        audio: 'q81-ex2',
        scene: {
          highlight: { points: [], edges: [['A', 'B'], ['B', 'B1']], faces: [] },
          spin: true,
          section: null,
        },
      },
    ],
  },
  {
    id: 'q82',
    category: '位置关系',
    challenge: { lStars: 2, eHint: '把顶面对角线平移到底面，异面角变成正方形里的角' },
    title: '异面直线所成角（平移法进阶）',
    solid: 'cube',
    difficulty: 3,
    question: '正方体中，异面直线 AB 与 A<sub>1</sub>C<sub>1</sub>（顶面对角线）所成角的大小是？',
    scene: {
      highlight: { points: [], edges: [['A', 'B'], ['A1', 'C1']], faces: [] },
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
        text: '<b>关键思路</b>：平移 A<sub>1</sub>C<sub>1</sub>——它平行于底面对角线 AC，问题化为 AB 与 AC 的夹角。',
        audio: 'q82-ex1',
        scene: {
          highlight: { points: [], edges: [['A', 'B'], ['A1', 'C1'], ['A', 'C']], faces: [0] },
          spin: false,
          section: null,
        },
      },
      {
        text: '<b>完整分析</b>：正方形底面中，对角线 AC 与边 AB 成 <b>45°</b>，选 <b>B</b>。<br>平移法的核心：把异面直线"搬"到同一个平面里，变成平面几何题。',
        audio: 'q82-ex2',
        scene: {
          highlight: { points: ['A'], edges: [['A', 'B'], ['A', 'C']], faces: [0] },
          spin: true,
          section: null,
        },
      },
    ],
  },
  {
    id: 'q83',
    category: '位置关系',
    title: '线面平行时的线线关系',
    solid: 'cube',
    difficulty: 3,
    question: '若直线 a ∥ 平面 α，直线 b ⊂ α，则 a 与 b 的位置关系是？',
    scene: {
      highlight: { points: [], edges: [['A1', 'B1'], ['A', 'B'], ['A', 'D']], faces: [0] },
      spin: true,
      section: null,
    },
    answer: {
      type: 'choice',
      options: ['一定平行', '一定异面', '平行或异面', '一定相交'],
      correct: 2,
    },
    explain: [
      {
        text: '<b>关键思路</b>：a ∥ α 只说明 a 与 α <b>没有公共点</b>，所以 a 与 b 必不相交——但不相交的两直线还有平行和异面两种。',
        audio: 'q83-ex1',
        scene: {
          highlight: { points: [], edges: [['A1', 'B1'], ['A', 'B']], faces: [0] },
          spin: false,
          section: null,
        },
      },
      {
        text: '<b>完整分析</b>：以底面为 α、A<sub>1</sub>B<sub>1</sub> 为 a。底面内 AB 与 A<sub>1</sub>B<sub>1</sub> <b>平行</b>；底面内 AD 与 A<sub>1</sub>B<sub>1</sub> 方向不同又不相交，是<b>异面</b>。<br>所以"平行或异面"，选 <b>C</b>。',
        audio: 'q83-ex2',
        scene: {
          highlight: { points: [], edges: [['A1', 'B1'], ['A', 'B'], ['A', 'D']], faces: [0] },
          spin: true,
          section: null,
        },
      },
    ],
  },
  {
    id: 'q84',
    category: '平行垂直',
    title: '线面垂直的性质',
    solid: 'cube',
    difficulty: 1,
    question: '若直线 a ⊥ 平面 α，直线 b ⊂ α，则 a 与 b 的位置关系是？',
    scene: {
      highlight: { points: [], edges: [['A', 'A1'], ['B', 'D']], faces: [0] },
      spin: true,
      section: null,
    },
    answer: {
      type: 'choice',
      options: ['垂直', '平行', '异面但不垂直', '不确定'],
      correct: 0,
    },
    explain: [
      {
        text: '<b>关键思路</b>：线面垂直的<b>定义</b>就是"垂直于平面内<b>所有</b>直线"——b 在面内，自然被垂直。',
        audio: 'q84-ex1',
        scene: {
          highlight: { points: [], edges: [['A', 'A1']], faces: [0] },
          spin: false,
          section: null,
        },
      },
      {
        text: '<b>完整分析</b>：a ⊥ b，选 <b>A</b>。例：AA<sub>1</sub> ⊥ 底面，则 AA<sub>1</sub> ⊥ 底面内的对角线 BD（图中两条高亮线）。<br>注意 a 与 b 可能相交也可能异面，但夹角都是 90°。',
        audio: 'q84-ex2',
        scene: {
          highlight: { points: [], edges: [['A', 'A1'], ['B', 'D']], faces: [0] },
          spin: true,
          section: null,
        },
      },
    ],
  },
  {
    id: 'q85',
    category: '平行垂直',
    title: '面面平行的判定条件',
    solid: 'cube',
    difficulty: 2,
    question: '下列条件中，能判定平面 α ∥ 平面 β 的是？',
    scene: { highlight: { points: [], edges: [], faces: [0, 1] }, spin: true, section: null },
    answer: {
      type: 'choice',
      options: [
        'α 内有一条直线平行于 β',
        'α 内有两条相交直线分别平行于 β',
        'α 内有无数条直线平行于 β',
        'α 内有两条平行直线分别平行于 β',
      ],
      correct: 1,
    },
    explain: [
      {
        text: '<b>关键思路</b>：面面平行判定的关键词与线面垂直一样是"<b>两条相交直线</b>"——一条线或两条平行线都定不住平面的方向。',
        audio: 'q85-ex1',
        scene: { highlight: { points: [], edges: [], faces: [0, 1] }, spin: false, section: null },
      },
      {
        text: '<b>完整分析</b>：选 <b>B</b>。反例：拿一本书沿桌边翘起——书内有一条（甚至无数条平行）直线平行桌面，但书面并不平行桌面。<br>两条相交直线才等价于"整个平面的方向"都平行。',
        audio: 'q85-ex2',
        scene: { highlight: { points: [], edges: [['A', 'B'], ['A', 'D'], ['A1', 'B1'], ['A1', 'D1']], faces: [0, 1] }, spin: true, section: null },
      },
    ],
  },
  {
    id: 'q86',
    category: '平行垂直',
    title: '垂直同一平面的两直线',
    solid: 'cube',
    difficulty: 2,
    question: '若直线 a ⊥ 平面 α，直线 b ⊥ 平面 α，则 a 与 b 的位置关系是？',
    scene: {
      highlight: { points: [], edges: [['A', 'A1'], ['B', 'B1']], faces: [0] },
      spin: true,
      section: null,
    },
    answer: {
      type: 'choice',
      options: ['平行', '相交', '异面', '垂直'],
      correct: 0,
    },
    explain: [
      {
        text: '<b>关键思路</b>：这是线面垂直的<b>性质定理</b>：垂直于同一平面的两条直线互相平行（方向都是平面的"法方向"）。',
        audio: 'q86-ex1',
        scene: {
          highlight: { points: [], edges: [['A', 'A1'], ['B', 'B1']], faces: [0] },
          spin: false,
          section: null,
        },
      },
      {
        text: '<b>完整分析</b>：a ∥ b，选 <b>A</b>。例：四条侧棱 AA<sub>1</sub>、BB<sub>1</sub> 等都垂直底面，它们彼此平行。<br>对照记忆：垂直同一<b>直线</b>的两直线什么关系都有可能（q79），垂直同一<b>平面</b>则必平行。',
        audio: 'q86-ex2',
        scene: {
          highlight: { points: [], edges: [['A', 'A1'], ['B', 'B1'], ['C', 'C1'], ['D', 'D1']], faces: [] },
          spin: true,
          section: null,
        },
      },
    ],
  },
  {
    id: 'q87',
    category: '平行垂直',
    title: '面面垂直的性质',
    solid: 'cube',
    difficulty: 2,
    question: '已知平面 α ⊥ 平面 β，交线为 m。直线 a ⊂ α 且 a ⊥ m。则直线 a 与平面 β 的关系是？',
    scene: {
      highlight: { points: [], edges: [['A', 'B'], ['A', 'A1']], faces: [0, 2] },
      spin: true,
      section: null,
    },
    answer: {
      type: 'choice',
      options: ['a ∥ β', 'a ⊥ β', 'a ⊂ β', '不确定'],
      correct: 1,
    },
    explain: [
      {
        text: '<b>关键思路</b>：面面垂直的<b>性质定理</b>——一个面内垂直于交线的直线，垂直于另一个面。例：前面 ⊥ 底面，交线 AB，前面内 AA<sub>1</sub> ⊥ AB。',
        audio: 'q87-ex1',
        scene: {
          highlight: { points: [], edges: [['A', 'B'], ['A', 'A1']], faces: [0, 2] },
          spin: false,
          section: null,
        },
      },
      {
        text: '<b>完整分析</b>：a ⊥ β，选 <b>B</b>。上例中 AA<sub>1</sub> 确实 ⊥ 底面。<br>条件"a 在 α 内"和"a ⊥ 交线"缺一不可：不垂直交线的线只是斜靠在另一个面上。',
        audio: 'q87-ex2',
        scene: {
          highlight: { points: [], edges: [['A', 'B'], ['A', 'A1'], ['B', 'B1']], faces: [0, 2] },
          spin: true,
          section: null,
        },
      },
    ],
  },
  {
    id: 'q88',
    category: '平行垂直',
    title: '几何法求线面角',
    solid: 'cube',
    difficulty: 3,
    question: '棱长为 2 的正方体中，体对角线 B<sub>1</sub>D 与底面 ABCD 所成角的正切值是？',
    scene: {
      highlight: { points: ['B1', 'D', 'B'], edges: [['B1', 'D'], ['B', 'D'], ['B', 'B1']], faces: [0] },
      spin: true,
      section: null,
    },
    answer: {
      type: 'choice',
      options: ['√2/2', '√2', '1/2', '√3'],
      correct: 0,
    },
    explain: [
      {
        text: '<b>关键思路</b>：几何法三步——作投影：B<sub>1</sub> 在底面的投影是 B，所以 B<sub>1</sub>D 的投影是 BD；线面角即 ∠B<sub>1</sub>DB，在直角三角形 B<sub>1</sub>BD 中求。',
        audio: 'q88-ex1',
        scene: {
          highlight: { points: ['B1', 'D', 'B'], edges: [['B1', 'D'], ['B', 'D'], ['B', 'B1']], faces: [0] },
          spin: false,
          section: null,
        },
      },
      {
        text: '<b>完整计算</b>：tan θ = 对边/邻边 = BB<sub>1</sub>/BD = 2/(2√2) = <b>√2/2</b>，选 <b>A</b>。<br>几何法口诀：找垂足、连投影、在直角三角形里算。',
        audio: 'q88-ex2',
        scene: {
          highlight: { points: ['B1', 'D'], edges: [['B1', 'D']], faces: [] },
          spin: true,
          section: null,
        },
      },
    ],
  },
  {
    id: 'q89',
    category: '平行垂直',
    challenge: { lStars: 2, eHint: '取底面边的中点，向底面中心和锥顶各连一条线，就是平面角' },
    title: '几何法求二面角',
    solid: 'pyramid4',
    difficulty: 3,
    question: '正四棱锥的底面边长为 2，高为 1。侧面与底面所成二面角的大小是？',
    scene: { highlight: { points: ['P'], edges: [['P', 'A'], ['P', 'B']], faces: [0, 1] }, spin: true, section: null },
    answer: {
      type: 'choice',
      options: ['30°', '45°', '60°', 'arctan 2'],
      correct: 1,
    },
    explain: [
      {
        text: '<b>关键思路</b>：二面角的平面角——取底面一边 AB 的中点 M，连接底面中心 O 与 M、锥顶 P 与 M。OM ⊥ AB，PM ⊥ AB，故 ∠PMO 就是二面角的平面角。',
        audio: 'q89-ex1',
        scene: { highlight: { points: ['P'], edges: [['P', 'A'], ['P', 'B'], ['A', 'B']], faces: [0, 1] }, spin: false, section: null },
      },
      {
        text: '<b>完整计算</b>：OM = 边长的一半 = 1，PO = 高 = 1，tan θ = PO/OM = 1，θ = <b>45°</b>，选 <b>B</b>。<br>注意 OM 是"中心到边中点"，不是边长——这是正棱锥二面角的标准构造。',
        audio: 'q89-ex2',
        scene: { highlight: { points: ['P'], edges: [['P', 'A'], ['P', 'B']], faces: [0, 1] }, spin: true, section: null },
      },
    ],
  },
  {
    id: 'q90',
    category: '空间向量',
    title: '向量的加法',
    solid: 'cube',
    difficulty: 1,
    question: '已知 a = (1, 2, 0)，b = (0, 1, 3)，则 a + b = ？',
    scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
    answer: {
      type: 'choice',
      options: ['(1, 3, 3)', '(1, 2, 3)', '(0, 3, 3)', '(1, 3, 0)'],
      correct: 0,
    },
    explain: [
      {
        text: '<b>关键思路</b>：向量加法 = 对应分量分别相加。',
        audio: 'q90-ex1',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
      },
      {
        text: '<b>完整计算</b>：(1+0, 2+1, 0+3) = <b>(1, 3, 3)</b>，选 <b>A</b>。',
        audio: 'q90-ex2',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
      },
    ],
  },
  {
    id: 'q91',
    category: '空间向量',
    title: '棱中点的坐标',
    solid: 'cube',
    difficulty: 1,
    question: '棱长为 2 的正方体，以 D 为原点、DA/DC/DD<sub>1</sub> 为 x/y/z 轴建系。棱 BC 的中点坐标是？',
    scene: {
      highlight: { points: ['B', 'C'], edges: [['B', 'C']], faces: [] },
      spin: false,
      section: null,
    },
    answer: {
      type: 'choice',
      options: ['(1, 2, 0)', '(2, 1, 0)', '(1, 1, 0)', '(0, 2, 1)'],
      correct: 0,
    },
    explain: [
      {
        text: '<b>关键思路</b>：中点坐标 = 两端点坐标取平均。先写 B(2,2,0)、C(0,2,0)。',
        audio: 'q91-ex1',
        scene: {
          highlight: { points: ['B', 'C'], edges: [['B', 'C']], faces: [] },
          spin: false,
          section: null,
        },
      },
      {
        text: '<b>完整计算</b>：((2+0)/2, (2+2)/2, (0+0)/2) = <b>(1, 2, 0)</b>，选 <b>A</b>。',
        audio: 'q91-ex2',
        scene: {
          highlight: { points: ['B', 'C'], edges: [['B', 'C']], faces: [0] },
          spin: true,
          section: null,
        },
      },
    ],
  },
  {
    id: 'q92',
    category: '空间向量',
    title: '数量积的计算',
    solid: 'cube',
    difficulty: 2,
    question: '已知 a = (2, −1, 2)，b = (1, 2, −1)，则 a·b = ？',
    scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
    answer: {
      type: 'choice',
      options: ['−2', '2', '0', '5'],
      correct: 0,
    },
    explain: [
      {
        text: '<b>关键思路</b>：点积 = 对应分量相乘再相加，注意负号。',
        audio: 'q92-ex1',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
      },
      {
        text: '<b>完整计算</b>：2×1 + (−1)×2 + 2×(−1) = 2 − 2 − 2 = <b>−2</b>，选 <b>A</b>。<br>点积为负说明夹角是钝角。',
        audio: 'q92-ex2',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
      },
    ],
  },
  {
    id: 'q93',
    category: '空间向量',
    title: '共线向量的判断',
    solid: 'cube',
    difficulty: 2,
    question: '已知 a = (1, −1, 2)，b = (2, −2, 4)。则 a 与 b 的关系是？',
    scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
    answer: {
      type: 'choice',
      options: ['平行（共线）', '垂直', '夹角 60°', '以上都不是'],
      correct: 0,
    },
    explain: [
      {
        text: '<b>关键思路</b>：判断平行看<b>是否成倍数</b>；判断垂直算点积。先试倍数关系。',
        audio: 'q93-ex1',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
      },
      {
        text: '<b>完整分析</b>：b = 2a（每个分量都是 2 倍），所以 a ∥ b，选 <b>A</b>。<br>点积检验：a·b = 2 + 2 + 8 = 12 = |a||b|（√6 × 2√6），夹角 0°，一致。',
        audio: 'q93-ex2',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
      },
    ],
  },
  {
    id: 'q94',
    category: '空间向量',
    title: '数量积求夹角（二）',
    solid: 'cube',
    difficulty: 2,
    question: '已知 a = (1, 1, 0)，b = (0, 1, 1)。则 a 与 b 的夹角为？',
    scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
    answer: {
      type: 'choice',
      options: ['30°', '45°', '60°', '120°'],
      correct: 2,
    },
    explain: [
      {
        text: '<b>关键思路</b>：cos θ = (a·b)/(|a||b|)，三个量分开算。',
        audio: 'q94-ex1',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
      },
      {
        text: '<b>完整计算</b>：a·b = 0 + 1 + 0 = 1；|a| = |b| = √2。<br>cos θ = 1/2，θ = <b>60°</b>，选 <b>C</b>。',
        audio: 'q94-ex2',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
      },
    ],
  },
  {
    id: 'q95',
    category: '空间向量',
    title: '向量法证线线垂直',
    solid: 'cube',
    difficulty: 3,
    question: '棱长为 2 的正方体（D 为原点建系）中，用向量法判断：侧棱 AA<sub>1</sub> 与底面对角线 BD 的位置关系是？',
    scene: {
      highlight: { points: ['A', 'A1', 'B', 'D'], edges: [['A', 'A1'], ['B', 'D']], faces: [0] },
      spin: true,
      section: null,
    },
    answer: {
      type: 'choice',
      options: ['垂直', '平行', '夹角 45°', '夹角 60°'],
      correct: 0,
    },
    explain: [
      {
        text: '<b>关键思路</b>：写出方向向量算点积。AA<sub>1</sub> = (0,0,2)；BD = D − B = (−2,−2,0)。',
        audio: 'q95-ex1',
        scene: {
          highlight: { points: ['A', 'A1'], edges: [['A', 'A1']], faces: [] },
          spin: false,
          section: null,
        },
      },
      {
        text: '<b>完整计算</b>：点积 = 0 + 0 + 0 = <b>0</b>，所以垂直，选 <b>A</b>。<br>几何上也显然：侧棱垂直底面，自然垂直底面内一切直线。两条高亮线是异面垂直。',
        audio: 'q95-ex2',
        scene: {
          highlight: { points: ['A', 'A1', 'B', 'D'], edges: [['A', 'A1'], ['B', 'D']], faces: [0] },
          spin: true,
          section: null,
        },
      },
    ],
  },
  {
    id: 'q96',
    category: '空间向量',
    title: '向量法求线面角（二）',
    solid: 'cube',
    difficulty: 3,
    question: '棱长为 2 的正方体（D 为原点建系）中，体对角线 DB<sub>1</sub> 与底面 ABCD 所成角的正弦值是？',
    scene: {
      highlight: { points: ['D', 'B', 'B1'], edges: [['D', 'B1'], ['D', 'B'], ['B', 'B1']], faces: [0] },
      spin: true,
      section: null,
    },
    answer: {
      type: 'choice',
      options: ['√3/3', '√6/3', '1/2', '√3/2'],
      correct: 0,
    },
    explain: [
      {
        text: '<b>关键思路</b>：sin θ = |v·n|/(|v||n|)。v = DB<sub>1</sub> = (2,2,2)，底面法向量 n = (0,0,1)。',
        audio: 'q96-ex1',
        scene: {
          highlight: { points: ['D', 'B1'], edges: [['D', 'B1']], faces: [0] },
          spin: false,
          section: null,
        },
      },
      {
        text: '<b>完整计算</b>：sin θ = 2/(2√3 × 1) = 1/√3 = <b>√3/3</b>，选 <b>A</b>。<br>所有体对角线与底面所成角都一样——对称性使然，与 q41 的 AC<sub>1</sub> 互为印证。',
        audio: 'q96-ex2',
        scene: {
          highlight: { points: ['D', 'B', 'B1'], edges: [['D', 'B1'], ['D', 'B'], ['B', 'B1']], faces: [0] },
          spin: true,
          section: null,
        },
      },
    ],
  },
  {
    id: 'q97',
    category: '空间向量',
    title: '向量法求二面角（二）',
    solid: 'cube',
    difficulty: 3,
    question: '棱长为 2 的正方体（D 为原点建系）中，平面 A<sub>1</sub>BD 与底面 ABCD 所成二面角的余弦值（取锐角）是？',
    scene: {
      highlight: { points: ['A1', 'B', 'D'], edges: [['A1', 'B'], ['B', 'D'], ['A1', 'D']], faces: [0] },
      spin: true,
      section: null,
    },
    answer: {
      type: 'choice',
      options: ['√3/3', '1/2', '√2/2', '√6/3'],
      correct: 0,
    },
    explain: [
      {
        text: '<b>关键思路</b>：求平面 A<sub>1</sub>BD 的法向量。面内取 DA<sub>1</sub> = (2,0,2)、DB = (2,2,0)，设法向量 n = (x,y,z) 与二者点积为 0，解得 n ∥ (−1,1,1)。',
        audio: 'q97-ex1',
        scene: {
          highlight: { points: ['A1', 'B', 'D'], edges: [['A1', 'B'], ['B', 'D'], ['A1', 'D']], faces: [] },
          spin: false,
          section: null,
        },
      },
      {
        text: '<b>完整计算</b>：底面法向量 n<sub>2</sub> = (0,0,1)。|cos| = |(−1,1,1)·(0,0,1)|/(√3 × 1) = 1/√3 = <b>√3/3</b>，选 <b>A</b>。',
        audio: 'q97-ex2',
        scene: {
          highlight: { points: ['A1', 'B', 'D'], edges: [['A1', 'B'], ['B', 'D'], ['A1', 'D']], faces: [0] },
          spin: true,
          section: null,
        },
      },
    ],
  },
  {
    id: 'q98',
    category: '空间向量',
    title: '求侧面的法向量',
    solid: 'cube',
    difficulty: 2,
    question: '正方体（D 为原点建系）的侧面 DAA<sub>1</sub>D<sub>1</sub> 内有两条棱方向为 DA = (2,0,0)、DD<sub>1</sub> = (0,0,2)。该侧面的一个法向量是？',
    scene: {
      highlight: { points: ['D'], edges: [['D', 'A'], ['D', 'D1'], ['D', 'C']], faces: [5] },
      spin: false,
      section: null,
    },
    answer: {
      type: 'choice',
      options: ['(0, 1, 0)', '(1, 0, 1)', '(0, 0, 1)', '(1, 1, 0)'],
      correct: 0,
    },
    explain: [
      {
        text: '<b>关键思路</b>：法向量与面内两方向点积都为 0。n·(2,0,0) = 0 要求 x 分量为 0；n·(0,0,2) = 0 要求 z 分量为 0。',
        audio: 'q98-ex1',
        scene: {
          highlight: { points: ['D'], edges: [['D', 'A'], ['D', 'D1']], faces: [5] },
          spin: false,
          section: null,
        },
      },
      {
        text: '<b>完整分析</b>：只剩 y 分量自由——n = <b>(0, 1, 0)</b>（沿 DC 方向），选 <b>A</b>。<br>几何直觉：侧面 DAA<sub>1</sub>D<sub>1</sub> 的法线当然沿垂直它的 DC 方向。',
        audio: 'q98-ex2',
        scene: {
          highlight: { points: ['D'], edges: [['D', 'C']], faces: [5] },
          spin: true,
          section: null,
        },
      },
    ],
  },
  {
    id: 'q99',
    category: '空间向量',
    title: '含中点的夹角计算',
    solid: 'cube',
    difficulty: 3,
    question: '棱长为 2 的正方体（D 为原点建系）中，E 为棱 DD<sub>1</sub> 的中点。则 cos〈AE, AC<sub>1</sub>〉 = ？',
    scene: {
      highlight: { points: ['A', 'D', 'D1', 'C1'], edges: [['D', 'D1'], ['A', 'C1']], faces: [] },
      spin: true,
      section: null,
    },
    answer: {
      type: 'choice',
      options: ['√15/5', '√3/3', '1/2', '√5/5'],
      correct: 0,
    },
    explain: [
      {
        text: '<b>关键思路</b>：E 是 DD<sub>1</sub> 中点，坐标 (0,0,1)。写出 AE = (−2,0,1)、AC<sub>1</sub> = (−2,2,2)，套夹角公式。',
        audio: 'q99-ex1',
        scene: {
          highlight: { points: ['A', 'D', 'D1'], edges: [['D', 'D1']], faces: [] },
          spin: false,
          section: null,
        },
      },
      {
        text: '<b>完整计算</b>：点积 = 4 + 0 + 2 = 6；|AE| = √5，|AC<sub>1</sub>| = 2√3。<br>cos = 6/(2√15) = 3/√15 = <b>√15/5</b>，选 <b>A</b>。分母有理化：3√15/15 = √15/5。',
        audio: 'q99-ex2',
        scene: {
          highlight: { points: ['A', 'C1'], edges: [['A', 'C1']], faces: [] },
          spin: true,
          section: null,
        },
      },
    ],
  },
  {
    id: 'q100',
    category: '空间向量',
    challenge: { lStars: 2, eHint: '三条棱两两垂直的墙角锥，体积直接 abc 除以六' },
    title: '截面截去的三棱锥体积',
    solid: 'cube',
    difficulty: 3,
    question: '棱长为 2 的正方体中，平面 A<sub>1</sub>BD 恰好经过顶点 A 的三个相邻顶点，截去三棱锥 A-A<sub>1</sub>BD。截去部分的体积是多少？',
    scene: {
      highlight: { points: ['A', 'A1', 'B', 'D'], edges: [['A1', 'B'], ['B', 'D'], ['A1', 'D'], ['A', 'A1'], ['A', 'B'], ['A', 'D']], faces: [] },
      spin: true,
      section: null,
    },
    answer: {
      type: 'choice',
      options: ['4/3', '8/3', '2', '8'],
      correct: 0,
    },
    explain: [
      {
        text: '<b>关键思路</b>：截去的三棱锥以 A 为顶点，三条棱 AA<sub>1</sub>、AB、AD 两两垂直、长度都是 2——"墙角"三棱锥，用 A 作顶点、面 ABD…换成以 △AA<sub>1</sub>B 之类直角面为底最好算。',
        audio: 'q100-ex1',
        scene: {
          highlight: { points: ['A', 'A1', 'B', 'D'], edges: [['A', 'A1'], ['A', 'B'], ['A', 'D']], faces: [] },
          spin: false,
          section: null,
        },
      },
      {
        text: '<b>完整计算</b>：以直角三角形 ABD（面积 ½×2×2 = 2）为底，AA<sub>1</sub> = 2 为高：<br>V = (1/3) × 2 × 2 = <b>4/3</b>，选 <b>A</b>。对照：正方体体积 8，截去一角竟是它的 1/6。',
        audio: 'q100-ex2',
        scene: {
          highlight: { points: ['A', 'A1', 'B', 'D'], edges: [['A1', 'B'], ['B', 'D'], ['A1', 'D']], faces: [] },
          spin: true,
          section: null,
        },
      },
    ],
  },
];
