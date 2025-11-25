package com.tempsfteam.class_tool.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.tempsfteam.class_tool.entity.UserToCourse;
import org.apache.ibatis.annotations.Mapper;

/**
 * @author 21983
 * @description 针对表【user_to_course】的数据库操作Mapper
 * @createDate 2024-09-10 14:42:24
 * @Entity generator.entity.UserToCourse
 */
@Mapper
public interface UserToCourseMapper extends BaseMapper<UserToCourse> {

}