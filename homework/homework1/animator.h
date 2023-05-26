#pragma once 

#include <vector>

#include <glm/glm.hpp>

class Animator
{
public:
	void updateAnimation(float time/*in node*/) { assert(0); };
	void setTimes(int inTimelineIndex, const std::vector<float>& inTimes);
	void setTranslation(const std::vector<glm::vec3>& inTrans);
	void setRotation(const std::vector<glm::vec4>& inRots);
	void setScales(const std::vector<float>& inScales);
private:
	int timelineIndex = -1;
	std::vector<float> times;
	std::vector<glm::vec3> translation;
	std::vector<glm::vec4> rotation;
	std::vector<float> scale;
};