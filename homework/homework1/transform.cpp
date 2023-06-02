#include "transform.h"
#include <glm/gtc/matrix_transform.hpp>

void Transform::accumulate(const Transform& in)
{
	rotation = glm::normalize(rotation * in.rotation);
	scale = scale * in.scale;

	translation = translation + in.translation; 
}

glm::mat4 Transform::toMaterix4() 
{
	glm::mat4 ret(1.0f);
	ret = glm::translate(ret, translation); 
	ret = ret * glm::mat4(rotation);
	ret = glm::scale(ret, scale);

	return ret;
}
