Shader "Geometry/Edge"
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
                float length : TEXCOORD;
            };

            fixed4 _Color;
            float _Width;
            float2 _DotLength;
            float3 _From;
            float3 _To;
            float3 _Right;
            float3 _FaceNormal0;
            float3 _FaceNormal1;
            int _CullType;

            v2f vert (appdata v)
            {
                v2f o;
                // unity内置胶囊先缩短成球
                float3 v1 = v.vertex.xyz - float3(0, 0.5 * sign(v.vertex.y), 0);
                // 缩放
                v1 *= _Width * 2;
                // 拉长
                float3 up = normalize(_To - _From);
                float3 forward = cross(_Right, up);
                v1 = v1.x * _Right + v1.y * up + v1.z * forward;
                v1 += lerp(_From, _To, step(0, v.vertex.y));
                o.vertex = UnityObjectToClipPos(float4(v1, 1));

                o.length = lerp(0, length(_To - _From), step(0, v.vertex.y));
                
                float3 view = mul(unity_ObjectToWorld, float4(_From, 1)) - _WorldSpaceCameraPos;
                float d0 = dot(mul(unity_ObjectToWorld, float4(_FaceNormal0, 0)), view);
                float d1 = dot(mul(unity_ObjectToWorld, float4(_FaceNormal1, 0)), view);
                if (_CullType == 1)
                {
                    // 画外轮廓
                    if (d0 * d1 > 0)
                    {
                        o.vertex = float4(2,2,2,1); //不显示
                    }
                }
                else if (_CullType == 2)
                {
                    // 画背面
                    if (d0 <= 0 || d1 <= 0)
                    {
                        o.vertex = float4(2,2,2,1); //不显示
                    }
                }
                else if (_CullType == 3)
                {
                    // 画正面
                    if (d0 >= 0 || d1 >= 0)
                    {
                        o.vertex = float4(2,2,2,1); //不显示
                    }
                }
                return o;
            }

            fixed4 frag (v2f i) : SV_Target
            {
                clip(_DotLength.x - fmod(i.length, _DotLength.x + _DotLength.y));
                return _Color;
            }
            ENDCG
        }
    }
}
