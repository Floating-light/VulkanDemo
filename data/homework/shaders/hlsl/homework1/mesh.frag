// Copyright 2020 Google LLC

Texture2D textureColorMap : register(t0, space1);
SamplerState samplerColorMap : register(s0, space1);

Texture2D textureNormal : register(t1, space1);
SamplerState samplerNormal : register(s1, space1);

struct PushConsts {
	float4x4 model;
};
[[vk::push_constant]] PushConsts primitive;

struct VSOutput
{
[[vk::location(0)]] float3 Normal : NORMAL0;
[[vk::location(1)]] float3 Color : COLOR0;
[[vk::location(2)]] float2 UV : TEXCOORD0;
[[vk::location(3)]] float3 ViewVec : TEXCOORD1;
[[vk::location(4)]] float3 LightVec : TEXCOORD2;
};

float3 calculateNormal(VSOutput input)
{
    // 通常Normal Texture中存的是切线空间的法线https://www.jianshu.com/p/3b2ad51b761c
    // 法线单位向量的xyz都在[-1,1], 存到Textuer中 (x + 1)/2 * 255
    // 这里读出来已经从[0,255] -> [0,1], 所以 x*2 - 1 变回原来的值
    // NormalMap看起来是蓝色，因为通常z都比较大
    float3 tangentNormal = textureNormal.Sample(samplerNormal, input.UV).xyz * 2.0 - 1.0;

    float3 N = normalize(input.Normal);
    //float3 T = normalize(input.Tangent);
    float3 T = float3(1.0f, 1.0f, 1.0f);
    float3 B = normalize(cross(N, T));
    float3x3 TBN = transpose(float3x3(T, B, N));
    return normalize(mul(TBN, tangentNormal));
}

float4 main(VSOutput input) : SV_TARGET
{
	float4 color = textureColorMap.Sample(samplerColorMap, input.UV) * float4(input.Color, 1.0);

	float3 N = normalize(input.Normal);
	float3 L = normalize(input.LightVec);
	float3 V = normalize(input.ViewVec);
	float3 R = reflect(L, N);
	float3 diffuse = max(dot(N, L), 0.0) * input.Color;
	float3 specular = pow(max(dot(R, V), 0.0), 16.0) * float3(0.75, 0.75, 0.75);
    //return float4(diffuse * color.rgb + specular, 1.0);
    //return textureNormal.Sample(samplerNormal, input.UV);
    return float4(input.Normal, 1.0f);
}