#include "animator.h"
#include <algorithm>
#include <format>
#include <iostream>

#define GLM_ENABLE_EXPERIMENTAL 
#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include <glm/gtc/quaternion.hpp>
#include <glm/gtx/compatibility.hpp>
#include <glm/gtc/type_ptr.hpp>

Transform Animator::updateAnimationRetTransform(float deltaTime)
{
	Transform result;
	std::tuple<glm::vec3, glm::quat, glm::vec3> retVal = {};
	float newTime = currentTime + deltaTime;
	if (float maxTime = times[times.size() - 1]; newTime > maxTime)
	{
		newTime -= maxTime;
	}
	auto itr = std::upper_bound(times.begin(), times.end(), newTime);
	const size_t index = std::distance(times.begin(), itr);
	const size_t prevIndex = int(index - 1);
	const float lerp_ratio = (newTime - times[prevIndex]) / (times[index] - times[prevIndex]);
	{
		result.setTranslation(glm::lerp(translation[prevIndex], translation[index], lerp_ratio));
	}
	{
		glm::quat f = glm::make_quat(reinterpret_cast<const float*>(&rotation[prevIndex]));
		glm::quat s = glm::make_quat(reinterpret_cast<const float*>(&rotation[index]));
		result.setRotation(glm::normalize(glm::slerp(f, s, lerp_ratio)));
	}
	{
		result.setScale(glm::lerp(scale[prevIndex], scale[index], lerp_ratio));
	}
	currentTime = newTime;
	return result;
}

void Animator::setTimes(int inTimelineIndex, const std::vector<float>& inTimes)
{
	
	if (timelineIndex == -1) // new time lines
	{
		timelineIndex = inTimelineIndex;
		times = inTimes; 
	}
	else
	{
		// ensure time line always same.
		assert(timelineIndex == inTimelineIndex);
	}
};

void Animator::setTranslation(const std::vector<glm::vec3>& inTrans) 
{ 
	assert(translation.size() == 0);
	translation = inTrans; 
};

void Animator::setRotation(const std::vector<glm::vec4>& inRots) 
{ 
	assert(rotation.size() == 0);
	rotation = inRots; 
};

void Animator::setScales(const std::vector<glm::vec3>& inScales) 
{ 
	assert(scale.size() == 0);
	scale = inScales; 
};