using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class GeometryUtil
{
    public static void Box(Geometry geo, float width, float height, float length)
    {
        float x = width * 0.5f;
        float y = height;
        float z = length * 0.5f;
        Vector3[] points = new Vector3[]
        {
            new Vector3(-x, 0, -z),
            new Vector3(-x, y, -z),
            new Vector3(x, 0, -z),
            new Vector3(x, y, -z),
            new Vector3(-x, 0, z),
            new Vector3(-x, y, z),
            new Vector3(x, 0, z),
            new Vector3(x, y, z),
        };
        int[][] faces = new int[6][];
        faces[0] = new int[] { 0, 1, 2, 3, 2, 1 };
        faces[1] = new int[] { 4, 6, 5, 7, 5, 6 };
        faces[2] = new int[] { 0, 2, 4, 6, 4, 2 };
        faces[3] = new int[] { 1, 5, 3, 7, 3, 5 };
        faces[4] = new int[] { 1, 0, 5, 4, 5, 0 };
        faces[5] = new int[] { 2, 3, 6, 7, 6, 3 };
        geo.UpdateMesh(points, faces);
    }

    public static void Cone(Geometry geo, float radius, float height, int segment)
    {
        Vector3[] points = new Vector3[segment + 1];
        int[][] faces = new int[2][];
        faces[0] = new int[segment * 3];
        faces[1] = new int[(segment - 2) * 3];

        points[0] = new Vector3(0, height, 0);
        for (int i=0; i<segment; i++)
        {
            float a = 2 * Mathf.PI * i / segment;
            float x = Mathf.Cos(a);
            float z = Mathf.Sin(a);
            points[i + 1] = new Vector3(x * radius, 0, z * radius);
            faces[0][i * 3] = 0;
            faces[0][i * 3 + 1] = ((i + 1) % segment) + 1;
            faces[0][i * 3 + 2] = i + 1;
        }

        for (int i=0; i<segment-2; i++)
        {
            faces[1][i * 3] = 1;
            faces[1][i * 3 + 1] = i + 2;
            faces[1][i * 3 + 2] = i + 3;
        }

        geo.UpdateMesh(points, faces);
    }

    public static void Cylinder(Geometry geo, float radius0, float radius1, float height, int segment)
    {
        Vector3[] points = new Vector3[segment * 2];
        int[][] faces = new int[3][];
        faces[0] = new int[segment * 6];
        faces[1] = new int[(segment - 2) * 3];
        faces[2] = new int[(segment - 2) * 3];
        for (int i = 0; i < segment; i++)
        {
            float a = 2 * Mathf.PI * i / segment;
            float x = Mathf.Cos(a);
            float z = Mathf.Sin(a);
            points[i] = new Vector3(x * radius0, 0, z * radius0);
            points[i + segment] = new Vector3(x * radius1, height, z * radius1);
            faces[0][i * 6] = i;
            faces[0][i * 6 + 1] = i + segment;
            faces[0][i * 6 + 2] = (i + 1) % segment;
            faces[0][i * 6 + 3] = ((i + 1) % segment) + segment;
            faces[0][i * 6 + 4] = (i + 1) % segment;
            faces[0][i * 6 + 5] = i + segment;
        }
        for (int i = 0; i < segment - 2; i++)
        {
            faces[1][i * 3] = 0;
            faces[1][i * 3 + 1] = i + 1;
            faces[1][i * 3 + 2] = i + 2;
            faces[2][i * 3] = segment;
            faces[2][i * 3 + 1] = i + 2 + segment;
            faces[2][i * 3 + 2] = i + 1 + segment;
        }

        geo.UpdateMesh(points, faces);
    }
}
