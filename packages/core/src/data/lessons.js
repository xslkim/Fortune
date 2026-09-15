// 教学内容：课程清单见 LESSONS（当前 13 门）。
// 每课字段：id / title / subtitle / solid / category（8 类枚举，见 schema.js）/ level（junior|senior）/ prereq（软前置课 id 数组，可为空）/ steps。
// scene.highlight: points 用顶点 label；edges 用 label 对；faces 用 src/geo/solids.js 中该几何体的面索引。
// scene.section: 平面 n·x = d，几何体底面在 y=0（cube 棱长 2，y∈[0,2]）。
// audio 为 null 的步骤不生成语音；非 null 的 id 在 tools/tts_lines.py 中有对应台词。

export const LESSONS = [
  {
    id: 'solid-basic',
    title: '认识基本几何体',
    subtitle: '面、棱、顶点与欧拉公式',
    category: '结构',
    level: 'junior',
    prereq: [],
    solid: 'cube',
    steps: [
      {
        text: '我们生活的世界充满了各种几何体：魔方是<b>正方体</b>，课本是<b>长方体</b>，金字塔近似<b>四棱锥</b>，易拉罐是<b>圆柱</b>。<br>这一课以正方体为例，认识多面体的三个基本要素：<b>面、棱、顶点</b>。拖动模型转一转，先整体观察它。',
        audio: 'solid-basic-s1',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
      },
      {
        text: '<b>面</b>是围成几何体的平面部分。正方体有 <b>6</b> 个面：底面 ABCD、顶面 A<sub>1</sub>B<sub>1</sub>C<sub>1</sub>D<sub>1</sub> 和前后左右 4 个侧面。<br>相对的两个面互相<b>平行且全等</b>，这是柱体的共同特征。',
        audio: 'solid-basic-s2',
        scene: { highlight: { points: [], edges: [], faces: [0, 1] }, spin: false, section: null },
      },
      {
        text: '两个面的公共边叫做<b>棱</b>。正方体有 <b>12</b> 条棱：底面 4 条、顶面 4 条、侧面竖直的 4 条。<br>竖直的 4 条棱（AA<sub>1</sub>、BB<sub>1</sub>、CC<sub>1</sub>、DD<sub>1</sub>）也叫<b>侧棱</b>，它们彼此平行且等长。',
        audio: 'solid-basic-s3',
        scene: {
          highlight: {
            points: [],
            edges: [
              ['A', 'A1'],
              ['B', 'B1'],
              ['C', 'C1'],
              ['D', 'D1'],
            ],
            faces: [],
          },
          spin: false,
          section: null,
        },
      },
      {
        text: '棱与棱的交点叫做<b>顶点</b>。正方体有 <b>8</b> 个顶点：底面 A、B、C、D，顶面 A<sub>1</sub>、B<sub>1</sub>、C<sub>1</sub>、D<sub>1</sub>。<br>每个顶点处恰好有 <b>3</b> 条棱、<b>3</b> 个面相交。',
        audio: 'solid-basic-s4',
        scene: {
          highlight: { points: ['A', 'B', 'C', 'D', 'A1', 'B1', 'C1', 'D1'], edges: [], faces: [] },
          spin: false,
          section: null,
        },
      },
      {
        text: '把面、棱、顶点的数目记为 F、E、V。正方体：V = 8，E = 12，F = 6。<br>算一算：V − E + F = 8 − 12 + 6 = <b>2</b>。再数三棱柱：6 − 9 + 5 = 2；四棱锥：5 − 8 + 5 = 2，居然都等于 2！',
        audio: 'solid-basic-s5',
        scene: {
          highlight: {
            points: ['A', 'B', 'C', 'D', 'A1', 'B1', 'C1', 'D1'],
            edges: [
              ['A', 'B'],
              ['B', 'C'],
              ['C', 'D'],
              ['D', 'A'],
              ['A1', 'B1'],
              ['B1', 'C1'],
              ['C1', 'D1'],
              ['D1', 'A1'],
              ['A', 'A1'],
              ['B', 'B1'],
              ['C', 'C1'],
              ['D', 'D1'],
            ],
            faces: [0, 1, 2, 3, 4, 5],
          },
          spin: false,
          section: null,
        },
      },
      {
        text: '这就是著名的<b>欧拉公式</b>：对任意凸多面体，<b>V − E + F = 2</b>。<br>它把看似无关的三种数量联系在了一起，是计数类题目的利器——知道其中两个量，就能求出第三个。',
        audio: 'solid-basic-s6',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
      },
      {
        text: '<b>小结</b>：多面体由面、棱、顶点围成；柱体有两个互相平行全等的底面，锥体有一个底面和一个锥顶。<br>记住欧拉公式 V − E + F = 2，接下来我们用它解决考试里的计数问题。',
        audio: 'solid-basic-s7',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: false, section: null },
      },
    ],
  },
  {
    id: 'prism-volume',
    title: '棱柱的表面积与体积',
    subtitle: 'V = Sh 的直观理解与侧面积公式',
    category: '表面积体积',
    level: 'junior',
    prereq: ['solid-basic'],
    solid: 'prism3',
    steps: [
      {
        text: '这是一个<b>直三棱柱</b>：上下底面是全等的三角形，三条侧棱与底面垂直。<br>研究体积之前先明确两个量：<b>底面积 S</b>（底面多边形的面积）和<b>高 h</b>（两底面之间的距离，直棱柱中就是侧棱长）。',
        audio: 'prism-volume-s1',
        scene: { highlight: { points: [], edges: [], faces: [0, 1] }, spin: true, section: null },
      },
      {
        text: '把底面沿竖直方向向上<b>平移</b>距离 h，它扫过的空间就是这个棱柱。<br>直觉上：扫过的体积 = 底面大小 × 平移距离。底面每大一点、平移每远一点，体积就按比例增大。',
        audio: 'prism-volume-s2',
        scene: {
          highlight: {
            points: [],
            edges: [
              ['A', 'A1'],
              ['B', 'B1'],
              ['C', 'C1'],
            ],
            faces: [0],
          },
          spin: false,
          section: null,
        },
      },
      {
        text: '于是得到柱体体积公式：<b>V = Sh</b>。<br>它对<b>所有柱体</b>都成立：长方体 V = abc（S = ab）、正方体 V = a<sup>3</sup>、圆柱 V = πr<sup>2</sup>h。一个公式走天下。',
        audio: 'prism-volume-s3',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: false, section: null },
      },
      {
        text: '<b>例</b>：直三棱柱的底面是直角边为 3、4 的直角三角形，侧棱长 5，求体积。<br>S = (3 × 4)/2 = 6，h = 5，所以 V = Sh = 6 × 5 = <b>30</b>。<br>注意：h 是两底面间的距离，别误用底面三角形的斜边 5——这里恰好都是 5，更要想清楚谁是谁。',
        audio: 'prism-volume-s4',
        scene: {
          highlight: {
            points: [],
            edges: [
              ['A', 'B'],
              ['B', 'C'],
              ['C', 'A'],
            ],
            faces: [0],
          },
          spin: false,
          section: null,
        },
      },
      {
        text: '再看<b>表面积</b>。直棱柱的表面 = 两个底面 + 侧面。<br>把侧面沿一条侧棱剪开、摊平，得到一个长方形：它的一条边是高 h，另一条边恰好是<b>底面周长 c</b>。',
        audio: 'prism-volume-s5',
        scene: {
          highlight: { points: [], edges: [], faces: [2, 3, 4] },
          spin: false,
          section: null,
        },
      },
      {
        text: '所以<b>直棱柱侧面积 S<sub>侧</sub> = c·h</b>，表面积 S<sub>表</sub> = c·h + 2S。<br>上例中底面周长 c = 3 + 4 + 5 = 12，S<sub>侧</sub> = 12 × 5 = 60，S<sub>表</sub> = 60 + 2 × 6 = <b>72</b>。',
        audio: 'prism-volume-s6',
        scene: {
          highlight: { points: [], edges: [], faces: [0, 1, 2, 3, 4] },
          spin: false,
          section: null,
        },
      },
      {
        text: '<b>小结</b>：柱体体积 V = Sh；直棱柱侧面积 = 底面周长 × 高。<br>解题三部曲：先认底面、求 S 和周长 c，再找高 h，最后代入公式。',
        audio: 'prism-volume-s7',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
      },
    ],
  },
  {
    id: 'pyramid-volume',
    title: '棱锥的体积',
    subtitle: 'V = Sh/3 与同底等高的柱锥关系',
    category: '表面积体积',
    level: 'junior',
    prereq: ['prism-volume'],
    solid: 'pyramid4',
    steps: [
      {
        text: '这是一个<b>四棱锥</b>：底面是四边形 ABCD，四个侧面都是三角形，它们汇聚于锥顶 <b>P</b>。<br>棱锥的<b>高 h</b> 是锥顶 P 到底面的距离。',
        audio: 'pyramid-volume-s1',
        scene: { highlight: { points: ['P'], edges: [], faces: [0] }, spin: true, section: null },
      },
      {
        text: '提出问题：一个棱锥和一个棱柱<b>同底等高</b>，它们的体积有什么关系？<br>经典实验：用同底等高的锥形容器往柱形容器里倒水（或倒沙子），猜猜要倒几次才能装满？',
        audio: 'pyramid-volume-s2',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: false, section: null },
      },
      {
        text: '实验结果：恰好倒 <b>3</b> 次！也就是说<b>同底等高的柱体体积是锥体的 3 倍</b>。<br>所以锥体体积公式是：<b>V = Sh/3</b>。这个"三分之一"是锥体问题的灵魂。',
        audio: 'pyramid-volume-s3',
        scene: { highlight: { points: ['P'], edges: [], faces: [0] }, spin: true, section: null },
        check: {
          question: '同底等高的圆锥，要倒几次才能装满等底的圆柱？',
          options: ['1 次', '2 次', '3 次', '4 次'],
          answer: 2,
          hint: '回忆刚才的实验。',
        },
      },
      {
        text: '为什么恰好是 1/3？直观理解：棱锥越往上越细，水平截面面积按"距锥顶距离的平方"缩小，平均下来正好是底面积的三分之一。<br>到了高中，用积分或祖暅原理可以严格证明，现在记住结论即可。',
        audio: 'pyramid-volume-s4',
        scene: {
          highlight: { points: ['P'], edges: [], faces: [0] },
          spin: false,
          section: { n: [0, 1, 0], d: 1.3 },
        },
      },
      {
        text: '<b>例</b>：四棱锥底面是边长 4 的正方形，高为 3，求体积。<br>S = 4 × 4 = 16，V = Sh/3 = (16 × 3)/3 = <b>16</b>。<br>而同底等高的四棱柱体积是 16 × 3 = 48，48 : 16 = 3 : 1，再次验证。',
        audio: 'pyramid-volume-s5',
        scene: { highlight: { points: ['P'], edges: [], faces: [0] }, spin: false, section: null },
      },
      {
        text: 'V = Sh/3 对<b>一切锥体</b>都成立：三棱锥、四棱锥、圆锥（V = πr<sup>2</sup>h/3）。<br>反过来用也很常见：已知锥体体积求高，h = 3V/S，别忘了把那个 3 乘回去！',
        audio: 'pyramid-volume-s6',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: false, section: null },
      },
      {
        text: '<b>小结</b>：锥体体积 V = Sh/3，同底等高的柱与锥体积之比为 3 : 1。<br>考试高频陷阱：忘了除以 3；或者把斜高（侧面三角形的高）当成棱锥的高。',
        audio: 'pyramid-volume-s7',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
      },
    ],
  },
  {
    id: 'section-skill',
    title: '截面问题入门',
    subtitle: '用正方体看水平、竖直、斜截面',
    category: '截面',
    level: 'junior',
    prereq: ['solid-basic'],
    solid: 'cube',
    steps: [
      {
        text: '用一个平面去<b>切</b>几何体，平面与几何体的公共部分叫做<b>截面</b>。<br>截面问题的核心是两问：截面是什么形状？它的边在哪里？这一课用棱长为 2 的正方体来练手。',
        audio: 'section-skill-s1',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
      },
      {
        text: '<b>水平截面</b>：用平行于底面的平面从一半高度切下去。<br>截面与四个侧面各交出一条线段，得到边长为 2 的<b>正方形</b>。切在任何高度，结果都全等。',
        audio: 'section-skill-s2',
        scene: {
          highlight: { points: [], edges: [], faces: [2, 3, 4, 5] },
          spin: false,
          section: { n: [0, 1, 0], d: 1 },
        },
      },
      {
        text: '<b>竖直截面</b>：让平面竖起来、从正中间切。截面是 2 × 2 的正方形。<br>如果把竖直平面平移到靠近棱的位置，截面变成 2 × t 的<b>长方形</b>——形状随位置变化，但始终是四边形。',
        audio: 'section-skill-s3',
        scene: {
          highlight: { points: [], edges: [], faces: [] },
          spin: false,
          section: { n: [0, 0, 1], d: 0 },
        },
      },
      {
        text: '让竖直平面经过底面对角线 AC：截面是长方形 ACC<sub>1</sub>A<sub>1</sub>，宽 AC = 2√2，高 2，面积 <b>4√2</b>。<br>这就是"沿对角面切正方体"的经典考法。',
        audio: 'section-skill-s4',
        scene: {
          highlight: {
            points: ['A', 'C', 'A1', 'C1'],
            edges: [
              ['A', 'A1'],
              ['C', 'C1'],
              ['A', 'C'],
              ['A1', 'C1'],
            ],
            faces: [],
          },
          spin: false,
          section: { n: [1, 0, -1], d: 0 },
        },
      },
      {
        text: '<b>斜截面</b>：把平面倾斜，一刀切过底面、后面、左面和前面四个面。<br>截面是一个<b>长方形</b>——斜切不等于三角形！形状取决于平面与哪些面相交。',
        audio: 'section-skill-s5',
        scene: {
          highlight: { points: [], edges: [], faces: [0, 2, 4, 5] },
          spin: false,
          section: { n: [1, 1, 0], d: 0.5 },
        },
      },
      {
        text: '<b>数边口诀</b>：平面与几何体的<b>几个面相交</b>，截面就是<b>几边形</b>——每条截面边都落在某一个面上。<br>正方体只有 6 个面，所以截面最多是<b>六边形</b>；可能的截面只有三角形、四边形、五边形、六边形，<b>绝不可能出现七边形</b>。',
        audio: 'section-skill-s6',
        scene: {
          highlight: { points: [], edges: [], faces: [0, 1, 2, 3, 4, 5] },
          spin: true,
          section: null,
        },
        check: {
          question: '一个平面与正方体的 4 个面相交，所得截面是几边形？',
          options: ['三角形', '四边形', '五边形', '六边形'],
          answer: 1,
          hint: '口诀：与几个面相交，截面就是几边形。',
        },
      },
      {
        text: '<b>小结</b>：判断截面三步走——① 看平面与哪些棱相交，标出交点；② 同一面上的交点连线；③ 数面数边定形状。<br>多旋转观察模型，把"立体"想成"几个面上的线"，截面题就迎刃而解。',
        audio: 'section-skill-s7',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
      },
    ],
  },
  {
    id: 'net-unfold',
    title: '展开图',
    subtitle: '把几何体摊平：正方体的 11 种展开图',
    category: '展开图',
    level: 'junior',
    prereq: ['solid-basic'],
    solid: 'cube',
    steps: [
      {
        text: '把一个正方体纸盒沿某些棱剪开，摊成一张平面图形，就得到它的<b>展开图</b>。<br>现在模型处于<b>折叠态</b>（unfold = 0）。展开与折叠是互逆的过程，也是考试的热门考点。',
        audio: 'net-unfold-s1',
        scene: {
          highlight: { points: [], edges: [], faces: [] },
          spin: true,
          section: null,
          unfold: 0,
        },
      },
      {
        text: '开始剪开！正方体有 12 条棱，要让 6 个面连成一整片，必须保留 <b>5</b> 条棱相连（6 个面连成"树"），剪开其余 <b>7</b> 条。<br>现在是<b>半开状态</b>（unfold = 0.5）：观察每个面是绕哪条棱翻出去的。',
        audio: 'net-unfold-s2',
        scene: {
          highlight: { points: [], edges: [], faces: [2, 3, 4, 5] },
          spin: false,
          section: null,
          unfold: 0.5,
        },
      },
      {
        text: '<b>完全展开</b>（unfold = 1）：正方体的展开图由 6 个全等的正方形连成一片。<br>固定底面不动，其余面绕各自的棱向外翻倒。注意：展开图里没有"盖被子"——任何两个面都不重叠。',
        audio: 'net-unfold-s3',
        scene: {
          highlight: { points: [], edges: [], faces: [] },
          spin: false,
          section: null,
          unfold: 1,
        },
      },
      {
        text: '选不同的棱来剪，得到的展开图形状不同。正方体共有 <b>11 种</b>本质不同的展开图。<br>记忆窍门：常见"一四一"型、"二三一"型、"三三"型、"二二二"型；而含"<b>田</b>"字形的六连方一定不能折成正方体。',
        audio: 'net-unfold-s4',
        scene: {
          highlight: { points: [], edges: [], faces: [] },
          spin: true,
          section: null,
          unfold: 1,
        },
      },
      {
        text: '<b>相对面怎么找</b>：展开图同一行（列）上、中间恰好隔一个正方形的两个面，折叠后<b>相对</b>。<br>相对的两个面在展开图中绝没有公共边。图中底面与顶面就是一对相对面。',
        audio: 'net-unfold-s5',
        scene: {
          highlight: { points: [], edges: [], faces: [0, 1] },
          spin: false,
          section: null,
          unfold: 1,
        },
        check: {
          question:
            '一种正方体展开图是"一四一"型：中间一行 4 个正方形，从左到右记为 ①②③④；另 2 个正方形分别在 ① 的上方和 ③ 的下方。折成正方体后，② 的相对面是哪个？',
          options: ['①', '③', '④', '无法确定'],
          answer: 2,
          hint: '同一行中间恰好隔一个格子的两个面，折叠后相对。',
        },
      },
      {
        text: '<b>哪些顶点粘在一起</b>：6 个正方形共有 24 个角，折回正方体后只有 8 个顶点——平均每 3 个角粘成 1 个顶点。<br>回到半开状态（unfold = 0.5）仔细看：剪开处分离的角，折叠时会两三重合。',
        audio: 'net-unfold-s6',
        scene: {
          highlight: { points: ['A', 'B', 'C', 'D', 'A1', 'B1', 'C1', 'D1'], edges: [], faces: [] },
          spin: false,
          section: null,
          unfold: 0.5,
        },
      },
      {
        text: '其他几何体的展开图：直棱柱 = 两个底面多边形 + 一串长方形；圆柱 = 两个圆 + 一个长方形；圆锥 = 一个圆 + 一个<b>扇形</b>。<br><b>小结</b>：展开图题三步走——找相对面、标记顶点、想象折回。把模型折回去（unfold = 0），自己复述一遍。',
        audio: 'net-unfold-s7',
        scene: {
          highlight: { points: [], edges: [], faces: [] },
          spin: true,
          section: null,
          unfold: 0,
        },
      },
    ],
  },
  {
    id: 'position-rel',
    title: '空间点线面的位置关系',
    subtitle: '线线、线面、面面：平行、相交与异面',
    category: '位置关系',
    level: 'senior',
    prereq: ['solid-basic'],
    solid: 'cube',
    steps: [
      {
        text: '平面几何里，两条直线只有平行和相交两种关系；到了<b>空间</b>中，多出一种全新的关系。<br>这一课以正方体为"舞台"，把点、线、面的位置关系一次看清。',
        audio: 'position-rel-s1',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
      },
      {
        text: '<b>线线·平行</b>：同一平面内、不相交的两条直线互相平行。<br>如底面中的 AB ∥ CD；跨面的 AB ∥ A<sub>1</sub>B<sub>1</sub> 也成立——平行可以"隔空"，但两条平行线一定同在某一个平面内。',
        audio: 'position-rel-s2',
        scene: {
          highlight: {
            points: [],
            edges: [
              ['A', 'B'],
              ['C', 'D'],
              ['A1', 'B1'],
            ],
            faces: [],
          },
          spin: false,
          section: null,
        },
      },
      {
        text: '<b>线线·相交</b>：两条直线有且只有一个公共点。<br>如 AB 与 AD 相交于顶点 A。相交直线也必定共面——两条相交直线唯一确定一个平面（这里是底面）。',
        audio: 'position-rel-s3',
        scene: {
          highlight: {
            points: ['A'],
            edges: [
              ['A', 'B'],
              ['A', 'D'],
            ],
            faces: [0],
          },
          spin: false,
          section: null,
        },
      },
      {
        text: '<b>线线·异面</b>：AB 与 CC<sub>1</sub>——它们不平行、不相交，而且<b>找不到任何一个平面</b>能同时装下它们。这就是空间独有的<b>异面直线</b>。<br>判断口诀：既不相交也不平行，先假设共面推出矛盾。',
        audio: 'position-rel-s4',
        scene: {
          highlight: {
            points: [],
            edges: [
              ['A', 'B'],
              ['C', 'C1'],
            ],
            faces: [],
          },
          spin: true,
          section: null,
        },
      },
      {
        text: '<b>线面关系</b>有三种：① 直线在平面内，如 AB ⊂ 底面；② 相交，如 AA<sub>1</sub> 与底面只交于点 A；③ 平行，如 A<sub>1</sub>B<sub>1</sub> 与底面没有公共点。<br>关键看<b>公共点的个数</b>：无数个、一个、零个。',
        audio: 'position-rel-s5',
        scene: {
          highlight: {
            points: [],
            edges: [
              ['A', 'B'],
              ['A', 'A1'],
              ['A1', 'B1'],
            ],
            faces: [0],
          },
          spin: false,
          section: null,
        },
      },
      {
        text: '<b>面面关系</b>有两种：① 平行，如底面 ∥ 顶面，没有公共点；② 相交，如底面与前面交于直线 AB。<br>两个平面只要有一个公共点，就必有一条过该点的公共直线。',
        audio: 'position-rel-s6',
        scene: {
          highlight: { points: [], edges: [['A', 'B']], faces: [0, 1, 2] },
          spin: false,
          section: null,
        },
      },
      {
        text: '<b>小结</b>：线线关系 = 平行 / 相交 / 异面（三种）；线面关系 = 在内 / 相交 / 平行（三种）；面面关系 = 平行 / 相交（两种）。<br>"异面"是空间几何区别于平面几何的标志，下一课我们研究其中最特殊的平行与垂直。',
        audio: 'position-rel-s7',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
      },
    ],
  },
  {
    id: 'parallel-perp',
    title: '平行与垂直的判定',
    subtitle: '线面平行、线面垂直的判定定理',
    category: '平行垂直',
    level: 'senior',
    prereq: ['position-rel'],
    solid: 'cube',
    steps: [
      {
        text: '平行与垂直是空间中最有用的两种关系。这一课学习两大<b>判定定理</b>：怎样用"低维"的关系（线线）去判定"高维"的关系（线面、面面）。仍以正方体为例。',
        audio: 'parallel-perp-s1',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
      },
      {
        text: '<b>线面平行判定定理</b>：平面<b>外</b>一条直线，与平面<b>内</b>一条直线平行，则该直线与此平面平行。<br>例：A<sub>1</sub>B<sub>1</sub> ⊄ 底面，AB ⊂ 底面，且 A<sub>1</sub>B<sub>1</sub> ∥ AB，所以 A<sub>1</sub>B<sub>1</sub> ∥ 底面。',
        audio: 'parallel-perp-s2',
        scene: {
          highlight: {
            points: [],
            edges: [
              ['A1', 'B1'],
              ['A', 'B'],
            ],
            faces: [0],
          },
          spin: false,
          section: null,
        },
      },
      {
        text: '定理的三个条件缺一不可：<b>线在面外</b>、<b>面内有一条线</b>、<b>两线平行</b>。<br>若直线就在平面内，谈不上"线面平行"；这是选择、填空题最爱设陷阱的地方。',
        audio: 'parallel-perp-s3',
        scene: {
          highlight: {
            points: [],
            edges: [
              ['A', 'B'],
              ['A1', 'B1'],
            ],
            faces: [0, 1],
          },
          spin: false,
          section: null,
        },
      },
      {
        text: '<b>线面垂直判定定理</b>：一条直线垂直于平面内<b>两条相交直线</b>，则该直线垂直于此平面。<br>例：AA<sub>1</sub> ⊥ AB，AA<sub>1</sub> ⊥ AD，AB 与 AD 在底面内且相交于 A，所以 AA<sub>1</sub> ⊥ 底面。',
        audio: 'parallel-perp-s4',
        scene: {
          highlight: {
            points: ['A'],
            edges: [
              ['A', 'A1'],
              ['A', 'B'],
              ['A', 'D'],
            ],
            faces: [0],
          },
          spin: false,
          section: null,
        },
      },
      {
        text: '为什么强调"<b>两条相交</b>"？只垂直一条直线，直线可以"歪着"；垂直两条<b>平行</b>直线，也可以斜着不倒。<br>两条相交直线能"卡住"平面的方向——这与"两条相交直线确定一个平面"相呼应。',
        audio: 'parallel-perp-s5',
        scene: {
          highlight: {
            points: ['A'],
            edges: [
              ['A', 'A1'],
              ['A', 'B'],
            ],
            faces: [0],
          },
          spin: false,
          section: null,
        },
      },
      {
        text: '<b>面面关系</b>简介：① 面面平行——一个平面内的两条相交直线分别平行另一平面，则两平面平行（如底面 ∥ 顶面）；<br>② 面面垂直——一个平面经过另一平面的一条垂线，则两平面垂直（如前面含 AA<sub>1</sub>，AA<sub>1</sub> ⊥ 底面，故前面 ⊥ 底面）。',
        audio: 'parallel-perp-s6',
        scene: {
          highlight: { points: [], edges: [['A', 'A1']], faces: [0, 1, 2] },
          spin: false,
          section: null,
        },
      },
      {
        text: '<b>小结</b>：判定链条是"线线 → 线面 → 面面"——线线平行/垂直是地基，线面靠面内一条（平行）或两条相交（垂直）直线，面面再靠线面。<br>证明题的套路：要证高维关系，先回到低维找线。',
        audio: 'parallel-perp-s7',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
      },
    ],
  },
  {
    id: 'three-views',
    title: '三视图',
    subtitle: '长对正、高平齐、宽相等',
    category: '三视图',
    level: 'senior',
    prereq: ['solid-basic'],
    solid: 'cube',
    steps: [
      {
        text: '<b>三视图</b>是从三个方向看几何体画下的平面图形：<b>主视图</b>（从正前方看）、<b>左视图</b>（从左面看）、<b>俯视图</b>（从正上方向下看）。<br>右侧的三视图面板会同步显示当前模型的三视图（views 面板已开启）。',
        audio: 'three-views-s1',
        scene: {
          highlight: { points: [], edges: [], faces: [] },
          spin: true,
          section: null,
          views: true,
        },
      },
      {
        text: '三张图不是孤立的，它们有严格的对应关系：<b>主俯长对正、主左高平齐、左俯宽相等</b>。<br>主视图与俯视图长度相同，主视图与左视图高度相同，左视图与俯视图宽度相同——这十二个字是画图的"对齐尺"。',
        audio: 'three-views-s2',
        scene: {
          highlight: { points: [], edges: [], faces: [] },
          spin: false,
          section: null,
          views: true,
        },
        check: {
          question: '主视图与俯视图的对应关系是？',
          options: ['长对正', '高平齐', '宽相等'],
          answer: 0,
        },
      },
      {
        text: '<b>由几何体画三视图</b>：以正方体为例。从正面看是一个正方形；从左面看也是正方形；从上面看还是正方形——三个视图全等。<br>画图要领：先画外轮廓，<b>看得见的棱画实线，被挡住的棱画虚线</b>。',
        audio: 'three-views-s3',
        scene: {
          highlight: { points: [], edges: [], faces: [2, 5, 1] },
          spin: false,
          section: null,
          views: true,
        },
      },
      {
        text: '换一个想：竖放的<b>圆柱</b>——主视图、左视图是全等的长方形，俯视图是圆；<b>圆锥</b>——主视图、左视图是三角形，俯视图是带中心点的圆（中心点是锥顶的投影）。<br>"两个一样、第三个不同"是旋转体三视图的典型特征。',
        audio: 'three-views-s4',
        scene: {
          highlight: { points: [], edges: [], faces: [] },
          spin: true,
          section: null,
          views: true,
        },
      },
      {
        text: '<b>由三视图想几何体</b>：读图有顺序——先看<b>俯视图</b>定底面形状（圆？多边形？几乘几？），再看<b>主、左视图</b>定高度和上部轮廓。<br>三角形的视图暗示"尖顶"（锥），长方形的视图暗示"平头直壁"（柱）。',
        audio: 'three-views-s5',
        scene: {
          highlight: { points: [], edges: [], faces: [1] },
          spin: true,
          section: null,
          views: true,
        },
      },
      {
        text: '搭积木类题目：俯视图每个格子标注该位置摞了几层小正方体，<b>总数 = 各格层数之和</b>；<br>若只给主、左、俯三个外轮廓，则逐列对照"最高不超过主、左视图允许的高度"来推算。',
        audio: 'three-views-s6',
        scene: {
          highlight: { points: [], edges: [], faces: [] },
          spin: false,
          section: null,
          views: true,
        },
      },
      {
        text: '<b>小结</b>：三视图十二字诀"长对正、高平齐、宽相等"；实线虚线分可见性；<br>正推（体→图）靠投影想象，反推（图→体）先俯视定底、再主左定高。多对照模型和视图面板练习。',
        audio: 'three-views-s7',
        scene: {
          highlight: { points: [], edges: [], faces: [] },
          spin: true,
          section: null,
          views: true,
        },
      },
    ],
  },
  {
    id: 'vector-basic',
    title: '空间向量及其运算',
    subtitle: '建系、坐标运算与数量积',
    category: '空间向量',
    level: 'senior',
    prereq: ['position-rel'],
    solid: 'cube',
    steps: [
      {
        text: '<b>向量</b>是既有大小又有方向的量。空间向量和平面向量遵循完全相同的运算规则：加法（平行四边形/三角形法则）、减法、数乘。<br>把向量请进立体几何，复杂的位置关系就能"算"出来。',
        audio: 'vector-basic-s1',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
      },
      {
        text: '<b>建立空间直角坐标系</b>：以正方体顶点 <b>D 为原点</b>，沿 DA、DC、DD<sub>1</sub> 方向分别为 <b>x 轴、y 轴、z 轴</b>（棱长为 2）。<br>三条轴两两垂直，这就是最常用的"墙角建系法"。',
        audio: 'vector-basic-s2',
        scene: {
          highlight: {
            points: ['D'],
            edges: [
              ['D', 'A'],
              ['D', 'C'],
              ['D', 'D1'],
            ],
            faces: [],
          },
          spin: false,
          section: null,
        },
      },
      {
        text: '写出各顶点坐标：D(0,0,0)，A(2,0,0)，C(0,2,0)，B(2,2,0)，<br>D<sub>1</sub>(0,0,2)，A<sub>1</sub>(2,0,2)，C<sub>1</sub>(0,2,2)，B<sub>1</sub>(2,2,2)。<br>规律：底面 z = 0，顶面 z = 2；沿 x 轴走的含 A，沿 y 轴走的含 C。',
        audio: 'vector-basic-s3',
        scene: {
          highlight: { points: ['A', 'B', 'C', 'D', 'A1', 'B1', 'C1', 'D1'], edges: [], faces: [] },
          spin: false,
          section: null,
        },
      },
      {
        text: '<b>向量坐标 = 终点坐标 − 起点坐标</b>。<br>例：AB = B − A = (0,2,0)；AC<sub>1</sub> = C<sub>1</sub> − A = (−2,2,2)。<br>模长 |AC<sub>1</sub>| = √(4+4+4) = 2√3——正是体对角线长，几何与代数对上了。',
        audio: 'vector-basic-s4',
        scene: {
          highlight: {
            points: ['A', 'B', 'C1'],
            edges: [
              ['A', 'B'],
              ['A', 'C1'],
            ],
            faces: [],
          },
          spin: true,
          section: null,
        },
      },
      {
        text: '<b>数量积</b>（点积）：a·b = x<sub>1</sub>x<sub>2</sub> + y<sub>1</sub>y<sub>2</sub> + z<sub>1</sub>z<sub>2</sub> = |a||b|cosθ。<br>它把"坐标相乘相加"和"夹角"联系起来，是向量法的核心武器。',
        audio: 'vector-basic-s5',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: false, section: null },
      },
      {
        text: '<b>垂直判定</b>：a·b = 0 ⇔ a ⊥ b。<br>例：DB<sub>1</sub> = (2,2,2)，AC = (−2,2,0)，DB<sub>1</sub>·AC = −4 + 4 + 0 = 0，所以体对角线 DB<sub>1</sub> ⊥ 面对角线 AC——不用画图证明，一算便知。',
        audio: 'vector-basic-s6',
        scene: {
          highlight: {
            points: ['D', 'B1', 'A', 'C'],
            edges: [
              ['D', 'B1'],
              ['A', 'C'],
            ],
            faces: [],
          },
          spin: true,
          section: null,
        },
        check: {
          question: '空间中两条直线的方向向量点积为 0，说明这两条直线？',
          options: ['平行', '垂直', '相交', '异面'],
          answer: 1,
          hint: '点积为零 ↔ 夹角为 90°（垂直包括相交垂直与异面垂直）。',
        },
      },
      {
        text: '<b>小结</b>：建系（找三条两两垂直的棱）→ 写坐标（终点减起点）→ 算运算（加、减、数乘、点积）。<br>下一课用这套工具证明平行、垂直，并求各种空间角。',
        audio: 'vector-basic-s7',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
      },
    ],
  },
  {
    id: 'vector-angle',
    title: '向量法求角与证位置关系',
    subtitle: '方向向量、法向量与三大空间角',
    category: '空间向量',
    level: 'senior',
    prereq: ['vector-basic'],
    solid: 'cube',
    steps: [
      {
        text: '两个关键角色：直线的<b>方向向量</b> v（与直线平行的任一向量）；平面的<b>法向量</b> n（与平面垂直的向量）。<br>向量法的思想：把线、面"翻译"成 v 和 n，位置关系和角就全变成向量计算。',
        audio: 'vector-angle-s1',
        scene: {
          highlight: { points: [], edges: [['D', 'D1']], faces: [0] },
          spin: true,
          section: null,
        },
      },
      {
        text: '<b>求法向量</b>：设 n = (x,y,z)，让它与平面内<b>两条相交直线</b>的方向向量点积都为 0，解方程组。<br>例：底面内 DA = (2,0,0)、DC = (0,2,0)，由 n·DA = 0、n·DC = 0 得 x = 0、y = 0，取 n = (0,0,1)——正是 z 轴方向，符合直觉。',
        audio: 'vector-angle-s2',
        scene: {
          highlight: {
            points: ['D'],
            edges: [
              ['D', 'A'],
              ['D', 'C'],
              ['D', 'D1'],
            ],
            faces: [0],
          },
          spin: false,
          section: null,
        },
      },
      {
        text: '<b>证线面平行</b>：直线方向向量 v 与平面法向量 n 满足 <b>v·n = 0</b>（且直线不在面内），则线面平行。<br>例：A<sub>1</sub>B<sub>1</sub> = (0,2,0)，底面 n = (0,0,1)，v·n = 0，故 A<sub>1</sub>B<sub>1</sub> ∥ 底面。与判定定理的结论完全一致。',
        audio: 'vector-angle-s3',
        scene: {
          highlight: { points: [], edges: [['A1', 'B1']], faces: [0] },
          spin: false,
          section: null,
        },
      },
      {
        text: '<b>求线面角</b>：直线与平面所成角 θ 满足 <b>sin θ = |cos〈v, n〉| = |v·n|/(|v||n|)</b>。<br>例：体对角线 AC<sub>1</sub> = (−2,2,2) 与底面：sin θ = |−2×0 + 2×0 + 2×1|/(2√3 × 1) = 2/(2√3) = <b>√3/3</b>。',
        audio: 'vector-angle-s4',
        scene: {
          highlight: {
            points: ['A', 'C1'],
            edges: [
              ['A', 'C1'],
              ['A', 'C'],
              ['C', 'C1'],
            ],
            faces: [0],
          },
          spin: true,
          section: null,
        },
      },
      {
        text: '<b>求二面角</b>：两半平面的法向量 n<sub>1</sub>、n<sub>2</sub>，二面角（或其补角）= 两法向量的夹角，|cos| = |n<sub>1</sub>·n<sub>2</sub>|/(|n<sub>1</sub>||n<sub>2</sub>|)。<br>例：平面 ABC<sub>1</sub> 的法向量 n<sub>1</sub> = (1,0,1)，底面 n<sub>2</sub> = (0,0,1)，|cos| = 1/√2，二面角为 <b>45°</b>。',
        audio: 'vector-angle-s5',
        scene: {
          highlight: {
            points: ['A', 'B', 'C1'],
            edges: [
              ['A', 'B'],
              ['B', 'C1'],
              ['A', 'C1'],
            ],
            faces: [0],
          },
          spin: true,
          section: null,
        },
      },
      {
        text: '<b>异面直线所成角</b>：cos θ = |cos〈v<sub>1</sub>, v<sub>2</sub>〉|（取锐角）。<br>例：面对角线 A<sub>1</sub>B = (0,2,−2) 与 B<sub>1</sub>C = (−2,0,−2)：cos θ = |0+0+4|/(2√2 × 2√2) = 1/2，所成角 <b>60°</b>。',
        audio: 'vector-angle-s6',
        scene: {
          highlight: {
            points: ['A1', 'B', 'B1', 'C'],
            edges: [
              ['A1', 'B'],
              ['B1', 'C'],
            ],
            faces: [],
          },
          spin: true,
          section: null,
        },
      },
      {
        text: '<b>小结</b>：向量法三部曲——建系、写坐标、算点积。<br>对照记忆：线线角看两方向向量；线面角用方向向量配法向量（正弦）；二面角用两法向量（余弦）。平行证 v·n = 0，垂直证 v 与 n 共线或线线点积为 0。',
        audio: 'vector-angle-s7',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
      },
    ],
  },
  {
    id: 'cylinder-cone',
    title: '圆柱与圆锥',
    subtitle: 'V = Sh 与 V = Sh/3：从棱柱棱锥到旋转体',
    category: '表面积体积',
    level: 'junior',
    prereq: ['prism-volume'],
    solid: 'cylinder',
    steps: [
      {
        text: '生活中到处是旋转体：易拉罐、保温杯是<b>圆柱</b>，冰淇淋蛋筒、沙堆近似<b>圆锥</b>。<br>它们都可以看成平面图形绕轴旋转一周得到的几何体。这一课把棱柱、棱锥学过的公式"平移"到圆柱、圆锥上。',
        audio: 'cylinder-cone-s1',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
      },
      {
        text: '圆柱由<b>两个平行全等的圆底面</b>和一个<b>曲面侧面</b>围成。两个量决定它的大小：底面半径 <b>r</b> 和高 <b>h</b>（两底面之间的距离）。<br>注意：圆柱的"高"垂直于底面，母线（侧面上竖直的线）长也等于 h。',
        audio: 'cylinder-cone-s2',
        scene: { highlight: { points: [], edges: [], faces: [0, 1] }, spin: false, section: null },
      },
      {
        text: '圆柱是"以圆为底的柱体"，柱体通式 <b>V = Sh</b> 直接成立：<b>V = πr<sup>2</sup>h</b>。<br><b>例</b>：r = 2、h = 3 的圆柱，V = π × 2<sup>2</sup> × 3 = <b>12π</b>。底面积 πr<sup>2</sup> 沿竖直方向平移 h，扫出的正是圆柱。',
        audio: 'cylinder-cone-s3',
        scene: { highlight: { points: ['A'], edges: [], faces: [0] }, spin: false, section: null },
      },
      {
        text: '<b>圆柱的侧面积</b>：沿一条母线把侧面剪开、摊平，得到一个<b>长方形</b>——一边是高 h，另一边是底面圆的周长 2πr。<br>所以 <b>S<sub>侧</sub> = 2πrh</b>，表面积 S<sub>表</sub> = 2πrh + 2πr<sup>2</sup>。上例中 S<sub>侧</sub> = 2π × 2 × 3 = 12π。',
        audio: 'cylinder-cone-s4',
        scene: {
          highlight: { points: ['A', 'A1'], edges: [], faces: [0, 1] },
          spin: true,
          section: null,
        },
      },
      {
        text: '<b>圆锥</b>：一个圆底面 + 一个曲面侧面，侧面所有母线汇聚于<b>锥顶</b>。三个量形影不离：底面半径 r、高 h、母线 l，满足 <b>l<sup>2</sup> = r<sup>2</sup> + h<sup>2</sup></b>。<br>例：r = 3、h = 4 时 l = 5——又是一个 3-4-5 直角三角形。',
        audio: 'cylinder-cone-s5',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
      },
      {
        text: '棱锥的"倒水实验"对圆锥同样成立：<b>同底等高的圆锥倒 3 次装满圆柱</b>，所以 <b>V = πr<sup>2</sup>h/3</b>。<br>侧面积：侧面沿母线剪开是<b>扇形</b>（半径 = l，弧长 = 底面周长 2πr），故 <b>S<sub>侧</sub> = πrl</b>。<br><b>例</b>：r = 3、h = 4、l = 5，V = π × 9 × 4/3 = <b>12π</b>，S<sub>侧</sub> = π × 3 × 5 = <b>15π</b>。',
        audio: 'cylinder-cone-s6',
        scene: {
          highlight: { points: [], edges: [], faces: [] },
          spin: false,
          section: { n: [0, 1, 0], d: 1.3 },
        },
      },
      {
        text: '<b>小结</b>：圆柱 V = πr<sup>2</sup>h、S<sub>侧</sub> = 2πrh；圆锥 V = πr<sup>2</sup>h/3、S<sub>侧</sub> = πrl。<br>公式不用死记：柱体一律 V = Sh，锥体一律除以 3；旋转体侧面积一律"剪开摊平"。高频陷阱：把母线 l 当高 h。',
        audio: 'cylinder-cone-s7',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
      },
    ],
  },
  {
    id: 'sphere-section',
    title: '球与球的截面',
    subtitle: '大圆与小圆：r² = d² + R²',
    category: '截面',
    level: 'senior',
    prereq: ['section-skill'],
    solid: 'sphere',
    steps: [
      {
        text: '篮球、足球、地球都近似<b>球</b>。分清两个概念：<b>球面</b>是到球心距离等于半径 R 的所有点组成的曲面；<b>球体</b>是球面围成的实心几何体（含内部）。<br>球是旋转体里最对称的几何体——任意方向看过去都一样。',
        audio: 'sphere-section-s1',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
      },
      {
        text: '用平面去截球，截面是什么？先用水平面切一刀（截面滑杆已在中间高度）。<br>无论平面从哪个方向、在什么高度切，<b>球的截面永远是圆</b>——这是球的对称性决定的，绝不会切出椭圆或多边形。',
        audio: 'sphere-section-s2',
        scene: {
          highlight: { points: [], edges: [], faces: [] },
          spin: false,
          section: { n: [0, 1, 0], d: 0 },
        },
      },
      {
        text: '把截面平面抬高，离开球心：得到的圆变小了。过<b>球心</b>的截面圆最大，半径等于 R，叫<b>大圆</b>（地球赤道就是大圆）；不过球心的截面圆叫<b>小圆</b>（每条纬线都是小圆）。<br>现在平面偏离球心，看到的就是一个小圆。',
        audio: 'sphere-section-s3',
        scene: {
          highlight: { points: [], edges: [], faces: [] },
          spin: false,
          section: { n: [0, 1, 0], d: 0.8 },
        },
      },
      {
        text: '三个量构成直角三角形：球半径 r（斜边）、<b>球心到截面的距离 d</b>、截面圆半径 R。由勾股定理：<b>R<sup>2</sup> = r<sup>2</sup> − d<sup>2</sup></b>，也常写成 <b>r<sup>2</sup> = d<sup>2</sup> + R<sup>2</sup></b>。<br>d = 0 时 R = r（大圆）；d 越大 R 越小；d = r 时 R = 0，平面与球刚好相切。',
        audio: 'sphere-section-s4',
        scene: {
          highlight: { points: [], edges: [], faces: [] },
          spin: true,
          section: { n: [0, 1, 0], d: 0.8 },
        },
      },
      {
        text: '<b>例</b>：球的半径为 5，球心到截面的距离为 3，求截面圆的面积。<br>R<sup>2</sup> = r<sup>2</sup> − d<sup>2</sup> = 25 − 9 = 16，R = 4，S = πR<sup>2</sup> = <b>16π</b>。<br>注意别把 R = 4 当答案——题目问的是面积，要再乘 π；3-4-5 直角三角形是出题人最爱。',
        audio: 'sphere-section-s5',
        scene: {
          highlight: { points: [], edges: [], faces: [] },
          spin: false,
          section: { n: [0, 1, 0], d: 0.8 },
        },
      },
      {
        text: '对比记忆：平面截正方体，截面可以是三角形、四边形、五边形、六边形，随角度而变；平面截球，<b>永远是圆</b>，只是大小随 d 而变。<br>旋转体的截面有"惯性"：截圆柱斜切可得椭圆，截圆锥斜切可得椭圆/抛物线/双曲线的一支（圆锥曲线名字的由来），唯有球"岿然不动总是圆"。',
        audio: 'sphere-section-s6',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
      },
      {
        text: '<b>小结</b>：球的截面必为圆；过球心是大圆，否则是小圆；核心关系 <b>R<sup>2</sup> = r<sup>2</sup> − d<sup>2</sup></b>。<br>解题三步：定 r、找 d（球心到平面的距离，常藏在"球心距""高"等条件里）、用勾股求 R。遇到球内接、外切问题，先画出这个直角三角形。',
        audio: 'sphere-section-s7',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
      },
    ],
  },
  {
    id: 'composite-solid',
    title: '组合体的表面积',
    subtitle: '拆分与补形：接触面不计入表面积',
    category: '表面积体积',
    level: 'senior',
    prereq: ['prism-volume', 'pyramid-volume'],
    solid: 'cube',
    steps: [
      {
        text: '真实世界里很少有"纯正"的几何体：积木是方块叠方块，蛋糕是圆柱叠圆柱，冰淇淋是圆锥顶着球。<br>由几个基本几何体拼成的几何体叫<b>组合体</b>。这一课专攻组合体最容易丢分的部分——<b>表面积</b>。',
        audio: 'composite-solid-s1',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
      },
      {
        text: '思想一：<b>拆分</b>。把组合体拆成几个基本几何体，体积直接相加：<b>V<sub>总</sub> = V<sub>1</sub> + V<sub>2</sub> + …</b>。<br>例（回顾）：圆柱上放同底圆锥，圆柱 V = 12π、圆锥 V = 4π，组合体 V = <b>16π</b>。拆分时沿"接缝"下刀，每一部分都回到你熟悉的公式。',
        audio: 'composite-solid-s2',
        scene: { highlight: { points: [], edges: [], faces: [0, 1] }, spin: false, section: null },
      },
      {
        text: '思想二：<b>补形</b>。缺了一角的图形，先补成完整几何体，再把补上的部分减掉。<br>例：棱长 2 的正方体截去一个角上的小三棱锥，体积 = 8 − 4/3。补形的好处：完整几何体的表面积、体积都好算，"加加减减"比硬算凹面轻松得多。',
        audio: 'composite-solid-s3',
        scene: {
          highlight: { points: ['A', 'B', 'D', 'A1'], edges: [], faces: [0] },
          spin: false,
          section: null,
        },
      },
      {
        text: '<b>核心法则：接触面不计入表面积</b>。两个几何体拼在一起，互相贴合的面被"藏"在内部，不再是表面。<br>算法：S<sub>表</sub> = 各部分表面积之和 − <b>2 ×</b>接触面面积（两个面一起消失）。只减一次是最常见的错误。',
        audio: 'composite-solid-s4',
        scene: { highlight: { points: [], edges: [], faces: [1] }, spin: false, section: null },
      },
      {
        text: '<b>例</b>：棱长 2 的正方体上面，正中央放一个棱长 1 的小正方体，求组合体的表面积。<br>大正方体 S = 6 × 4 = 24；小正方体 S = 6；接触面 1 × 1 = 1。<br>S<sub>表</sub> = 24 + 6 − 2 × 1 = <b>28</b>。巧解：小正方体盖住大正方体 1 个单位面，却又露出自己的顶面 1 个单位面，恰好抵消——净增的只有小正方体 4 个侧面，24 + 4 = 28。',
        audio: 'composite-solid-s5',
        scene: {
          highlight: { points: ['A1', 'B1', 'C1', 'D1'], edges: [], faces: [1] },
          spin: true,
          section: null,
        },
      },
      {
        text: '<b>例</b>：棱长 2 的正方体，从一个角上挖去一个棱长 1 的小正方体，求表面积。<br>挖掉 3 个小正方形面（3 × 1 = 3），又新露出 3 个同样大小的面（+3），S<sub>表</sub> = 24 − 3 + 3 = <b>24</b>，居然不变！<br>这就是补形/拆分思想的对偶：在角上挖小方块，"去三露三"，表面积守恒。',
        audio: 'composite-solid-s6',
        scene: {
          highlight: {
            points: ['A', 'B', 'D', 'A1'],
            edges: [
              ['A', 'B'],
              ['A', 'D'],
              ['A', 'A1'],
            ],
            faces: [0, 2, 3],
          },
          spin: true,
          section: null,
        },
      },
      {
        text: '<b>小结</b>：组合体表面积三步走——① 拆成基本几何体（或补成完整几何体）；② 各部分表面积加减；③ <b>检查接触面：每个接触面要减 2 倍</b>。<br>体积用拆分直接相加，表面积要盯住"藏起来的面"。做题前先问自己：哪些面消失了？哪些面新露出来了？',
        audio: 'composite-solid-s7',
        scene: { highlight: { points: [], edges: [], faces: [] }, spin: true, section: null },
      },
    ],
  },
];
