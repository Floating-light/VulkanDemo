#include "animator.h"

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

void Animator::setScales(const std::vector<float>& inScales) 
{ 
	assert(scale.size() == 0);
	scale = inScales; 
};