using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class SampleScene : MonoBehaviour
{
    Geometry _geometry = null;
    // Start is called before the first frame update
    void Start()
    {
        _geometry = GetComponent<Geometry>();
        GeometryUtil.Box(_geometry, 2, 4, 6);
        _geometry.SetEdgeWidthColor(0, 1, Color.red, 0.02f, false);
        _geometry.SetFaceColor(0, Color.blue, Color.green);
        _geometry.SetPointSizeColor(0, Color.black, 0.02f, false);
    }

    // Update is called once per frame
    void Update()
    {
        _geometry.SetEdgeWidthColor(0, 1, Color.red, 0.02f, false);
        _geometry.SetFaceColor(0, Color.blue, Color.green);
        _geometry.SetPointSizeColor(0, Color.black, 0.02f, false);
    }
}
