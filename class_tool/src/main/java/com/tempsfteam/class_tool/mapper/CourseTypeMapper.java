package com.tempsfteam.class_tool.mapper;


import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.tempsfteam.class_tool.entity.CourseType;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * @author hypocodeemia
 * @description 针对表【course_type】的数据库操作Mapper
 * @createDate 2024-09-10 14:42:23
 * @Entity generator.entity.CourseType
 */
@Mapper
public interface CourseTypeMapper extends BaseMapper<CourseType> {
    //检测参数的学习对象下是否含有课程科目
    boolean checkAnyProfession(@Param("courseTypeId")Integer courseTypeId);

    // 通过读取user_to_course表去获取用户有权限的课程，获取这些课程的学习对象
    List<Integer> getCourseTypePreference(@Param("userId")Long userId);

    // 通过用户管理的课程，去获取这些课程的学习对象
    List<Integer> getCourseTypeForCourseManager(@Param("userId")Long userId);
}
