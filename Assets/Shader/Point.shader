Shader "Geometry/Point"
{
    Properties
    {
        _Color ("Color", Color) = (1,1,1,1)
        _Width ("Width", Float) = 1
        _DotLength ("DotLength", Vector) = (1,0,0,0)
    }
    SubShader
    {
	    Tags { "Queue"="Transparent" "RenderType"="Transparent" }
        LOD 100

        Pass
        {
			ZWrite Off
			Blend SrcAlpha OneMinusSrcAlpha
            Stencil
            {
                Ref [_StencilRef]
                Comp greater
                Pass replace
            }
            CGPROGRAM
            
            #pragma vertex vert
            #pragma fragment frag

            #include "UnityCG.cginc"

            struct appdata
            {
                float4 vertex : POSITION;
            };

            struct v2f
            {
                float4 vertex : SV_POSITION;
            };

            fixed4 _Color;
            float _Width;
            float2 _DotLength;
            float3 _From;
            float3 _To;
            float3 _Right;
            float3 _FaceNormal[64];
            int _FaceCount;
            int _CullType;

            v2f vert (appdata v)
            {
                v2f o;
                o.vertex = UnityObjectToClipPos(v.vertex);
                
                float3 view = mul(unity_ObjectToWorld, float4(0, 0, 0, 1)) - _WorldSpaceCameraPos;

                float dmax = -99999;
                float dmin = 99999;
                for (int i=0; i<_FaceCount; i++)
                {
                    float d = dot(mul(unity_ObjectToWorld, float4(_FaceNormal[i], 0)), view);
                    dmax = max(dmax, d);
                    dmin = min(dmin, d);
                }
                if (_CullType == 1)
                {
                    // 画外轮廓
                    if (dmax * dmin > 0)
                    {
                        o.vertex = float4(2,2,2,1); //不显示
                    }
                }
                else if (_CullType == 2)
                {
                    // 画背面
                    if (dmin <= 0)
                    {
                        o.vertex = float4(2,2,2,1); //不显示
                    }
                }
                else if (_CullType == 3)
                {
                    // 画正面
                    if (dmax >= 0)
                    {
                        o.vertex = float4(2,2,2,1); //不显示
                    }
                }
                return o;
            }

            fixed4 frag (v2f i) : SV_Target
            {
                return _Color;
            }
            ENDCG
        }
    }
}
