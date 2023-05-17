// Copyright 2020 Google LLC
struct MaterialCBO
{
    int baseColorTextureIndex ;
    int normalTextureIndex ;
    int metallicRoughnessTextureIndex ;
    int emissiveTextureIndex ;
    int occlusionTextureIndex ;
};

cbuffer materialCBO : register(b0,space1)
{
    MaterialCBO materialCBO;
}

Texture2D textureColorMap[6] : register(t1,space1);
SamplerState samplerColorMap[6] : register(s1, space1);

//Texture2D textureNormal : register(t1, space1);
//SamplerState samplerNormal : register(s1, space1);

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
[[vk::location(5)]] float3 Tangent : TEXCOORD3;
};

float4 getTextureColor(VSOutput input)
{
    return textureColorMap[materialCBO.baseColorTextureIndex].Sample(samplerColorMap[materialCBO.baseColorTextureIndex], input.UV);
}
float3 getTextureNormal(VSOutput input)
{
    // The tangent space normal texture. The texture encodes RGB components with linear 
    // transfer function. Each texel represents the XYZ components of a normal vector 
    // in tangent space. The normal vectors use the convention +X is right and +Y is up.
    // +Z points toward the viewer. If a fourth component (A) is present, it **MUST** be
    // ignored. When undefined, the material does not have a tangent space normal texture.
    return textureColorMap[materialCBO.normalTextureIndex].Sample(samplerColorMap[materialCBO.normalTextureIndex], input.UV).rgb;
}
float getTextureMetallic(VSOutput input)
{
    // Roughness is stored in the 'g' channel, metallic is stored in the 'b' channel.
    // This layout intentionally reserves the 'r' channel for (optional) occlusion map data
    // body_metalgloss2048_converted_metalRoughness
    return textureColorMap[materialCBO.metallicRoughnessTextureIndex].Sample(samplerColorMap[materialCBO.metallicRoughnessTextureIndex], input.UV).b;
}

float getTextureRoughness(VSOutput input)
{
    return textureColorMap[materialCBO.metallicRoughnessTextureIndex].Sample(samplerColorMap[materialCBO.metallicRoughnessTextureIndex], input.UV).g;
}

float3 getTextureOcclusionTexture(VSOutput input)
{
    // The occlusion texture. The occlusion values are linearly sampled from the R channel. 
    // Higher values indicate areas that receive full indirect lighting and lower values 
    // indicate no indirect lighting. If other channels are present (GBA), they **MUST** 
    // be ignored for occlusion calculations. When undefined, the material does not have an occlusion texture.
    if(materialCBO.occlusionTextureIndex > 0)
    {
        return textureColorMap[materialCBO.occlusionTextureIndex].Sample(samplerColorMap[materialCBO.occlusionTextureIndex], input.UV).rrr;
    }
    else
    {
        return float3(1.0, 1.0, 1.0);
    }
}

float3 getTextureEmissive(VSOutput input)
{
    // The emissive texture. It controls the color and intensity of the light being emitted 
    // by the material. This texture contains RGB components encoded with the sRGB transfer 
    // function. If a fourth component (A) is present, it **MUST** be ignored. When undefined, 
    // the texture **MUST** be sampled as having `1.0` in RGB components.
    if(materialCBO.emissiveTextureIndex != -1 )
    {
        return textureColorMap[materialCBO.emissiveTextureIndex].Sample(samplerColorMap[materialCBO.emissiveTextureIndex], input.UV).rgb;
    }
    else
    {
        return float3(1.0f, 1.0f, 1.0f);
    }
}

float3 calculateNormal(VSOutput input)
{
    // 通常Normal Texture中存的是切线空间的法线https://www.jianshu.com/p/3b2ad51b761c, 用于光照计算，增强细节
    // 法线单位向量的xyz都在[-1,1], 存到Textuer中 (x + 1)/2 * 255
    // 这里读出来已经从[0,255] -> [0,1], 所以 x*2 - 1 变回原来的值
    // NormalMap看起来是蓝色，因为通常z都比较大
    // 顶点法线通常是垂直于顶点所在切面，Tagent是垂直于这个法线的切面
    float3 tangentNormal = getTextureNormal(input) * 2.0 - 1.0;

    float3 N = normalize(input.Normal);
    float3 T = normalize(input.Tangent);
    float3 B = normalize(cross(N, T));
    float3x3 TBN = transpose(float3x3(T, B, N));
    return normalize(mul(TBN, tangentNormal));
}
float3 calculateAlbedoForF0(VSOutput input)
{
    // What ?
    return pow(getTextureColor(input).rgb, float3(2.2, 2.2, 2.2));
}

float3 specularContribution(float2 inUV, float3 L, float3 V, float3 N, float3 F0, float metallic, float roughness)
{
    // Half vector 
    float3 H = normalize(V + L);
    float dotNH = clamp(dot(N, H), 0.0, 1.0);// a dot b = |a||b|cos(α)
    float dotNV = clamp(dot(N, V), 0.0, 1.0);
    float dotNL = clamp(dot(N, L), 0.0, 1.0);
    
    float3 lightColor = float3(1.0, 1.0, 1.0);
    
    float3 retColor = float3(0.0, 0.0, 0.0);
    
    // 光源方向与法线夹角小于90°
    if(dotNL > 0.0)
    {
        // D = Normal distribution (Distribution of the microfacets)
        //float D = D_GGX(dotNH, roughness);
        
        //// G = Geometric shadowing term (Microfacets shadowing)
        //float G = G_SchlicksmithGGX(dotNL, dotNV, roughness);
        
        //// F = Fresnel factor (reflectance depending on angle of incidence)
        //float3 F = F_Schlick(dotNV, F0);
        
        

    }
    
    
    return retColor;
}
float4 main(VSOutput input) : SV_TARGET
{
    //float4 color = getTextureColor(input) * float4(input.Color, 1.0);

	//float3 N = normalize(input.Normal);
    float3 N = calculateNormal(input);
	float3 L = normalize(input.LightVec);
	float3 V = normalize(input.ViewVec);
    
	float3 R = reflect(-V, N);
    
    float metallic = getTextureMetallic(input);
    float roughness = getTextureRoughness(input);
    
    float3 F0 = float3(0.04, 0.04, 0.04);
    F0 = lerp(F0, calculateAlbedoForF0(input), metallic);
    
    float3 Lo = specularContribution(input.UV, L, V, N, F0, metallic, roughness);
    
    float3 diffuse = calculateAlbedoForF0(input);
    
	float3 specular = pow(max(dot(R, V), 0.0), 16.0) * float3(0.75, 0.75, 0.75);

    float3 ambient = diffuse * getTextureOcclusionTexture(input);
    float3 color = ambient + Lo;
    
    float mat = getTextureEmissive(input);

    //return getTextureColor(input);
    return float4(diffuse * getTextureOcclusionTexture(input), 1.0f);
}