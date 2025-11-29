package com.tempsfteam.class_tool.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.tempsfteam.class_tool.entity.Profession;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * @author hypocodeemia
 * @description 针对表【profession】的数据库操作Mapper
 * @createDate 2024-09-10 14:42:24
 * @Entity generator.entity.Profession
 */
@Mapper
public interface ProfessionMapper extends BaseMapper<Profession> {
    /**
     * 获取某个学习对象的所有课程科目
     * @param courseTypeId 学习对象id
     * @return              List<Profession>
     */
    @Select("SELECT * FROM profession WHERE course_type_Id = #{courseTypeId}")
    List<Profession> getProfessionListByCourseTypeId(@Param("courseTypeId")Integer courseTypeId);

    // 检测参数课程科目下是否有课程
    boolean checkAnyCourse (@Param("professionId")Integer professionId);

    // 通过读取user_to_course表去获取用户有权限的课程，获取这些课程的课程科目
    List<Profession> getProfessionPreferenceByCourseTypeId(@Param("userId")Long userId,@Param("courseTypeId")Integer courseTypeId);

    // 通过用户管理的课程，去获取这些课程的课程科目
    List<Profession> getProfessionForCourseManager(@Param("userId")Long userId,@Param("courseTypeId")Integer courseTypeId);
}

