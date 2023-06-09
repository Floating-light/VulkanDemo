#pragma once 

#include <vector>
#include <tuple>

#include <glm/glm.hpp>

#include "transform.h"

class Animator
{
public:
	Transform updateAnimationRetTransform(float deltaTime);
	void setTimes(int inTimelineIndex, const std::vector<float>& inTimes);
	void setTranslation(const std::vector<glm::vec3>& inTrans);
	void setRotation(const std::vector<glm::vec4>& inRots);
	void setScales(const std::vector<glm::vec3>& inScales);
private:
	int timelineIndex = -1;
	float currentTime;
	std::vector<float> times;
	std::vector<glm::vec3> translation;
	std::vector<glm::vec3> scale;
	std::vector<glm::vec4> rotation;
};