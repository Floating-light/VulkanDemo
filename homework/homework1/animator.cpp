#include "animator.h"
#include <algorithm>
#define GLM_ENABLE_EXPERIMENTAL 
#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include <glm/gtc/quaternion.hpp>
#include <glm/gtx/compatibility.hpp>
#include <glm/gtc/type_ptr.hpp>

glm::mat4 Animator::updateAnimation(float deltaTime)
{
	glm::mat4 retval = glm::mat4(1.0f);
	float newTime = currentTime + deltaTime;
	if (float maxTime = times[times.size() - 1]; newTime > maxTime)
	{
		newTime -= maxTime;
	}
	auto itr = std::lower_bound(times.begin(), times.end(), newTime);
	const float lerp_ratio = (newTime - *itr) / (*(itr + 1) - *itr);
	const size_t index = std::distance(times.begin(), itr);
	{
		const glm::vec3& f = translation[index];
		const glm::vec3& s = translation[index + 1];
		//glm::vec3 v = f + (s - f) * lerp_ratio;
		retval = glm::translate(retval, glm::lerp(f, s, lerp_ratio));
		
	}

	{
		glm::quat f = glm::make_quat(reinterpret_cast<const float*>(& rotation[index]));
		glm::quat s = glm::make_quat(reinterpret_cast<const float*>(&rotation[index+1]));
		glm::slerp(f, s, lerp_ratio);
		retval *= glm::mat4(glm::slerp(f, s, lerp_ratio));
	}
	{
		glm::vec3 f = scale[index];
		retval = glm::scale(retval, glm::lerp(scale[index], scale[index + 1], lerp_ratio));
	}
	currentTime = newTime;
	return retval;
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