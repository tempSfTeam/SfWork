package com.tempsfteam.class_tool.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.tempsfteam.class_tool.entity.Classe;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * @author hypocodeemia
 * @description 针对表【classe】的数据库操作Mapper
 * @createDate 2024-09-12 23:12:18
 * @Entity com.rdc.entity.Classe
 */
@Mapper
public interface ClasseMapper extends BaseMapper<Classe> {
    /**
     * 获取某个学校的所有班级
     * @param schoolId 类别id
     * @return  List<Form>
     */
    @Select("SELECT * FROM form WHERE school_id = #{schoolId}")
    List<Classe> getClasseListBySchoolId(@Param("schoolId")Integer schoolId);

    /**
     * 获取某个课程的所有班级
     * @param courseId 课程id
     * @return  List<Form>
     */
    @Select("SELECT c.* FROM classe c " +
            "JOIN classe_to_course ctc ON c.classe_id = ctc.classe_id " +
            "WHERE ctc.course_id = #{courseId}")
    List<Classe> getClasseListByCourseId(@Param("courseId")Integer courseId);
}




