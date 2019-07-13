using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;

using Edge = System.Tuple<int, int>;

public class Geometry : MonoBehaviour
{
    public Mesh PointMesh;
    public Material PointMaterial;
    public Mesh EdgeMesh;
    public Material EdgeFrontMaterial;
    public Material EdgeBackMaterial;
    public Material FaceFrontMaterial;
    public Material FaceBackMaterial;

    enum CullType {
        None = 0,
        OutLine = 1,
        Back = 2,
        Front = 3,
    };
    private Vector3[] m_points;
    private List<Edge> m_hardEdge = new List<Edge>();
    private List<Edge> m_softEdge = new List<Edge>();
    private Dictionary<Edge, Vector3> m_edgeFaceNormal = new Dictionary<Edge, Vector3>(); //边所属的面法线
    private Dictionary<int, Vector4[]> m_pointFaceNormal = new Dictionary<int, Vector4[]>(); //点相邻的面法线
    private Mesh m_mesh;
    private Material m_edgeOutLineMat;
    private Material m_edgeTopMat;
    private Material m_pointBackMat;
    private Material m_pointOutlineMat;
    private Material m_pointTopMat;

    private Dictionary<int, Color> m_faceBackColor = new Dictionary<int, Color>();
    private Dictionary<int, Color> m_faceFrontColor = new Dictionary<int, Color>();

    struct DrawOption
    {
        public Nullable<Color> Color;
        public float Width;

        public DrawOption(Nullable<Color> c, float w)
        {
            Color = c;
            Width = w;
        }
    };
    private Dictionary<Edge, DrawOption> m_edgeOption = new Dictionary<Edge, DrawOption>();
    private Dictionary<Edge, int> m_edgeTop = new Dictionary<Edge, int>();
    private Dictionary<int, DrawOption> m_pointOption = new Dictionary<int, DrawOption>();
    private Dictionary<int, int> m_pointTop = new Dictionary<int, int>();

    private void Start()
    {
        m_edgeOutLineMat = Material.Instantiate(EdgeFrontMaterial);
        m_edgeTopMat = Material.Instantiate(EdgeFrontMaterial);
        m_pointBackMat = Material.Instantiate(PointMaterial);
        m_pointOutlineMat = Material.Instantiate(PointMaterial);
        m_pointTopMat = Material.Instantiate(PointMaterial);

        FaceBackMaterial.SetInt("_StencilRef", 1);
        EdgeBackMaterial.SetInt("_StencilRef", 1);
        m_pointBackMat.SetInt("_StencilRef", 1);
        FaceFrontMaterial.SetInt("_StencilRef", 2);
        EdgeFrontMaterial.SetInt("_StencilRef", 3);
        PointMaterial.SetInt("_StencilRef", 3);
        m_edgeOutLineMat.SetInt("_StencilRef", 2);
        m_pointOutlineMat.SetInt("_StencilRef", 2);
        m_edgeTopMat.SetInt("_StencilRef", 4);
        m_pointTopMat.SetInt("_StencilRef", 4);

        m_pointTopMat.renderQueue = (int)RenderQueue.Transparent;
        m_edgeTopMat.renderQueue = (int)RenderQueue.Transparent + 2;
        m_pointBackMat.renderQueue = (int)RenderQueue.Transparent + 3;
        m_pointOutlineMat.renderQueue = (int)RenderQueue.Transparent + 4;
        m_edgeOutLineMat.renderQueue = (int)RenderQueue.Transparent + 5;
        EdgeBackMaterial.renderQueue = (int)RenderQueue.Transparent + 6;
        FaceBackMaterial.renderQueue = (int)RenderQueue.Transparent + 7;
        PointMaterial.renderQueue = (int)RenderQueue.Transparent + 8;
        EdgeFrontMaterial.renderQueue = (int)RenderQueue.Transparent + 9;
        FaceFrontMaterial.renderQueue = (int)RenderQueue.Transparent + 10;
    }

    /**
     * 更新mesh
     * points 顶点坐标列表
     * faces 每个int[]是一个面，包含多个三角形顶点索引。三角形按顺时针排列。两个三角形公用一条边一定方向相反
     */
    public void UpdateMesh(Vector3[] points, int[][] faces)
    {
        m_points = points;
        m_hardEdge.Clear();
        m_softEdge.Clear();
        m_edgeFaceNormal.Clear();

        // 记录外轮廓线，去掉重叠的
        Dictionary<Edge, int> hardEdge = new Dictionary<Edge, int>();
        // 点相邻面法线
        Dictionary<int, List<Vector4>> pointFaceNormal = new Dictionary<int, List<Vector4>>();

        //遍历面
        for (int i = 0; i < faces.Length; i++)
        {
            int[] face = faces[i];
            //遍历三角形
            Dictionary<Edge, int> edgeToTri = new Dictionary<Edge, int>();
            for (int tri = 0; tri < face.Length; tri += 3)
            {
                // 三角形法线
                Vector3 v0 = points[face[tri]];
                Vector3 v1 = points[face[tri + 1]];
                Vector3 v2 = points[face[tri + 2]];
                Vector3 normal = Vector3.Cross(v1 - v0, v2 - v1).normalized;
                // 遍历三条边
                for (int v = 0; v < 3; v++)
                {
                    int vert = face[tri + v];
                    int next = face[tri + (v + 1) % 3];
                    Edge e0 = new Edge(vert, next);
                    Edge e1 = new Edge(next, vert);
                    m_edgeFaceNormal.Add(e0, normal);
                    if (edgeToTri.Remove(e1))
                    {
                        //2条相反的边是1条内部边
                        m_softEdge.Add(e0);
                    }
                    else
                    {
                        edgeToTri.Add(e0, tri);
                    }
                    // 点法线
                    List<Vector4> pointNormal;
                    if (!pointFaceNormal.TryGetValue(vert, out pointNormal))
                    {
                        pointNormal = new List<Vector4>();
                        pointFaceNormal.Add(vert, pointNormal);
                    }
                    pointNormal.Add(normal);
                }
            }
            //记录外轮廓线
            foreach (Edge e in edgeToTri.Keys)
            {
                if (!hardEdge.ContainsKey(e) && !hardEdge.ContainsKey(new Edge(e.Item2, e.Item1)))
                {
                    hardEdge.Add(e, 0);
                }
            }
        }
        m_hardEdge.AddRange(hardEdge.Keys);
        foreach (KeyValuePair<int, List<Vector4>> pair in pointFaceNormal)
        {
            m_pointFaceNormal.Add(pair.Key, pair.Value.ToArray());
        }

        // 构建mesh
        if (m_mesh == null)
        {
            m_mesh = new Mesh();
            m_mesh.subMeshCount = faces.Length;
        }
        // 将不同面公用的顶点复制多个，使法线断开
        List<Vector3> vertices = new List<Vector3>(points);
        int[][] indices = new int[faces.Length][];
        Dictionary<int, int> vused = new Dictionary<int, int>(); //已经被其它面用过的点，重复使用要复制新顶点
        Dictionary<int, int> vmap = new Dictionary<int, int>(); //旧顶点到新复制的顶点
        for (int i = 0; i < faces.Length; i++)
        {
            int[] face = faces[i];
            indices[i] = new int[face.Length];
            vmap.Clear();
            for (int j = 0; j < face.Length; j++)
            {
                int v = face[j];
                if (vused.ContainsKey(v) && !vmap.TryGetValue(v, out v))
                {
                    int v0 = face[j];
                    v = vertices.Count;
                    vertices.Add(vertices[v0]);
                    vmap.Add(v0, v);
                }
                indices[i][j] = v;
            }
            for (int j = 0; j < face.Length; j++)
            {
                vused[face[j]] = 1;
            }
        }
        m_mesh.vertices = vertices.ToArray();
        for (int i = 0; i < faces.Length; i++)
        {
            //每个面一个submesh
            m_mesh.SetIndices(indices[i], MeshTopology.Triangles, i);
        }
        m_mesh.RecalculateNormals();
    }

    /**
     * 设置一个面的颜色。分背面和正面，null表示用材质默认颜色。
     */
    public void SetFaceColor(int index, Nullable<Color> frontColor = null, Nullable<Color> backColor = null)
    {
        m_faceFrontColor.Remove(index);
        if (frontColor.HasValue)
        {
            m_faceFrontColor.Add(index, frontColor.Value);
        }
        m_faceBackColor.Remove(index);
        if (backColor.HasValue)
        {
            m_faceBackColor.Add(index, backColor.Value);
        }
    }

    /**
     * 设置边的颜色和粗细
     * color 颜色，null表示用材质默认颜色
     * width 粗细，width <= 0 表示材质默认值
     * keepTop 是否置顶显示
     */
    public void SetEdgeWidthColor(int v0, int v1, Nullable<Color> color, float width, bool keepTop)
    {
        Edge e0 = new Edge(v0, v1);
        Edge e1 = new Edge(v1, v0);
        m_edgeOption.Remove(e0);
        m_edgeOption.Remove(e1);
        m_edgeTop.Remove(e0);
        m_edgeTop.Remove(e1);
        if (color.HasValue || width > 0)
        {
            m_edgeOption.Add(e0, new DrawOption(color, width));
            m_edgeOption.Add(e1, new DrawOption(color, width));
        }
        if (keepTop)
        {
            m_edgeTop.Add(e0, 1);
            m_edgeTop.Add(e1, 1);
        }
    }

    /**
     * 设置点的颜色和大小
     * color 颜色，null表示用材质默认颜色
     * size 大小，size <= 0 不显示
     * keepTop 是否置顶显示
     */
    public void SetPointSizeColor(int index, Nullable<Color> color, float size, bool keepTop)
    {
        m_pointOption.Remove(index);
        m_pointTop.Remove(index);

        if (size > 0)
        {
            m_pointOption.Add(index, new DrawOption(color, size));
            if (keepTop)
            {
                m_pointTop.Add(index, 1);
            }
        }
    }

    void Update()
    {
        // 置顶点
        foreach (int p in m_pointTop.Keys)
        {
            DrawPoint(m_pointTopMat, CullType.None, p);
        }
        // 置顶边
        foreach (Edge e in m_edgeTop.Keys)
        {
            DrawEdge(m_edgeTopMat, CullType.None, e);
        }
        // 背面点
        foreach (int p in m_pointOption.Keys)
        {
            if (!m_pointTop.ContainsKey(p))
            {
                DrawPoint(m_pointBackMat, CullType.Back, p);
            }
        }
        // 外围点
        foreach (int p in m_pointOption.Keys)
        {
            if (!m_pointTop.ContainsKey(p))
            {
                DrawPoint(m_pointOutlineMat, CullType.OutLine, p);
            }
        }
        // 外围边
        foreach (Edge e in m_hardEdge)
        {
            if (!m_edgeTop.ContainsKey(e))
            {
                DrawEdge(m_edgeOutLineMat, CullType.OutLine, e);
            }
        }
        foreach (Edge e in m_softEdge)
        {
            if (!m_edgeTop.ContainsKey(e))
            {
                DrawEdge(m_edgeOutLineMat, CullType.OutLine, e);
            }
        }
        // 背面边
        foreach (Edge e in m_hardEdge)
        {
            if (!m_edgeTop.ContainsKey(e))
            {
                DrawEdge(EdgeBackMaterial, CullType.Back, e);
            }
        }
        // 背面
        DrawFace(FaceBackMaterial, m_faceBackColor);

        // 正面点
        foreach (int p in m_pointOption.Keys)
        {
            if (!m_pointTop.ContainsKey(p))
            {
                DrawPoint(PointMaterial, CullType.Front, p);
            }
        }
        // 正面边
        foreach (Edge e in m_hardEdge)
        {
            if (!m_edgeTop.ContainsKey(e))
            {
                DrawEdge(EdgeFrontMaterial, CullType.Front, e);
            }
        }
        // 正面
        DrawFace(FaceFrontMaterial, m_faceFrontColor);
    }

    void DrawPoint(Material mat, CullType cull, int p)
    {
        DrawOption op;
        Vector4[] normal;
        if (m_pointOption.TryGetValue(p, out op) && m_pointFaceNormal.TryGetValue(p, out normal))
        {
            MaterialPropertyBlock pb = new MaterialPropertyBlock();
            pb.SetVectorArray("_FaceNormal", normal);
            pb.SetInt("_FaceCount", normal.Length);
            pb.SetInt("_CullType", (int)cull);
            if (op.Color.HasValue)
            {
                pb.SetColor("_Color", op.Color.Value);
            }
            Matrix4x4 matrix = transform.localToWorldMatrix * Matrix4x4.TRS(m_points[p], Quaternion.identity, Vector3.one * op.Width * 2.0f);
            for (int i = 0; i < PointMesh.subMeshCount; i++)
            {
                Graphics.DrawMesh(PointMesh, matrix, mat, 0, null, i, pb);
            }
        }
    }

    void DrawEdge(Material mat, CullType cull, Edge e)
    {
        Vector3 from = m_points[e.Item1];
        Vector3 to = m_points[e.Item2];
        Vector3 right = Vector3.Cross(to - from, Vector3.up);
        if (right.sqrMagnitude < 0.0001f)
        {
            right = Vector3.Cross(to - from, Vector3.right);
        }
        right.Normalize();
        Vector3 normal0 = Vector3.zero;
        m_edgeFaceNormal.TryGetValue(e, out normal0);
        Vector3 normal1 = Vector3.zero;
        m_edgeFaceNormal.TryGetValue(new Edge(e.Item2, e.Item1), out normal1);
        MaterialPropertyBlock pb = new MaterialPropertyBlock();
        pb.SetVector("_Right", right);
        pb.SetVector("_From", from);
        pb.SetVector("_To", to);
        pb.SetVector("_FaceNormal0", normal0);
        pb.SetVector("_FaceNormal1", normal1);
        pb.SetInt("_CullType", (int)cull);
        DrawOption op;
        if (m_edgeOption.TryGetValue(e, out op))
        {
            if (op.Color.HasValue)
            {
                pb.SetColor("_Color", op.Color.Value);
            }
            if (op.Width > 0)
            {
                pb.SetFloat("_Width", op.Width);
            }
        }
        for (int i = 0; i < EdgeMesh.subMeshCount; i++)
        {
            Graphics.DrawMesh(EdgeMesh, transform.localToWorldMatrix, mat, 0, null, i, pb);
        }
    }

    void DrawFace(Material mat, Dictionary<int, Color> colorMap)
    {
        for (int i = 0; i < m_mesh.subMeshCount; i++)
        {
            MaterialPropertyBlock pb = null;
            Color col;
            if (colorMap.TryGetValue(i, out col))
            {
                pb = new MaterialPropertyBlock();
                pb.SetColor("_Color", col);
            }
            Graphics.DrawMesh(m_mesh, transform.localToWorldMatrix, mat, 0, null, i, pb);
        }
    }
}
