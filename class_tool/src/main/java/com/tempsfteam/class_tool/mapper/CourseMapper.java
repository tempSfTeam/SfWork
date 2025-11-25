package com.tempsfteam.class_tool.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.tempsfteam.class_tool.entity.Course;
import org.apache.ibatis.annotations.Mapper;

/**
 * @author 21983
 * @description 针对表【course】的数据库操作Mapper
 * @createDate 2024-09-10 14:42:23
 * @Entity generator.entity.Course
 */
@Mapper
public interface CourseMapper extends BaseMapper<Course> {

}