#pragma once 

#define GLM_ENABLE_EXPERIMENTAL
#include "glm/glm.hpp"
#include <glm/gtc/quaternion.hpp>

class Transform
{
protected:
	glm::vec3 scale; 
	glm::quat rotation; 
	glm::vec3 translation; 
public:
	Transform()
		: scale(1.0f)
		, rotation()
		, translation(0.0f)
	{}
	
	Transform(const Transform& inTrans)
		: scale(inTrans.scale)
		, rotation(inTrans.rotation)
		, translation(inTrans.translation)
	{}

	Transform(const glm::vec3& inScale, const glm::quat& inRot, const glm::vec3& inTranslation)
		: scale(inScale)
		, rotation(inRot)
		, translation(inTranslation)
	{}

	void setScale(const glm::vec3& inScale)
	{
		scale = inScale;
	}
	void setRotation(const glm::quat& inQuat)
	{
		rotation = inQuat;
	}
	void setTranslation(const glm::vec3& inTranslation)
	{
		translation = inTranslation;
	}
	void accumulate(const Transform& in);
	glm::mat4 toMaterix4();
};