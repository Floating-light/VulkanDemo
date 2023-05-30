// Copyright 2020 Google LLC

struct VSInput
{
[[vk::location(0)]] float3 Pos : POSITION0;
[[vk::location(1)]] float3 Normal : NORMAL0;
[[vk::location(2)]] float2 UV : TEXCOORD0;
[[vk::location(3)]] float3 Color : COLOR0;
[[vk::location(4)]] float3 Tangent : TEXCOORD1;
};

struct UBO
{
	float4x4 projection;
	float4x4 view;
	float4 lightPos;
	float4 viewPos;
};

cbuffer ubo : register(b0) { UBO ubo; }

struct ModelInfo
{
    float4x4 model;
};

cbuffer modelInfo : register(b0, space2)
{
    ModelInfo modelInfo;
}

struct PushConsts {
	float4x4 model;
};
[[vk::push_constant]] PushConsts primitive;

struct VSOutput
{
	float4 Pos : SV_POSITION;
[[vk::location(0)]] float3 Normal : NORMAL0;
[[vk::location(1)]] float3 Color : COLOR0;
[[vk::location(2)]] float2 UV : TEXCOORD0;
[[vk::location(3)]] float3 ViewVec : TEXCOORD1;
[[vk::location(4)]] float3 LightVec : TEXCOORD2;
[[vk::location(5)]] float3 Tangent : TEXCOORD3;
};

VSOutput main(VSInput input)
{
	VSOutput output = (VSOutput)0;
	output.Normal = input.Normal;
	output.Color = input.Color;
	output.UV = input.UV;
    output.Pos = mul(ubo.projection, mul(ubo.view, mul(modelInfo.model, float4(input.Pos.xyz, 1.0))));

	
	float4 pos = mul(ubo.view, float4(input.Pos, 1.0));
    //output.Normal = mul(mul((float3x3) ubo.view,(float3x3)primitive.model),input.Normal);
    output.Normal = mul((float3x3) modelInfo.model, input.Normal);
    output.Tangent = mul((float3x3) modelInfo.model, input.Tangent);
	output.LightVec = ubo.lightPos.xyz - pos.xyz;
	output.ViewVec = ubo.viewPos.xyz - pos.xyz;
	return output;
}