package com.tempsfteam.class_tool.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.tempsfteam.class_tool.entity.CourseToProfession;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * @author hypocodeemia
 * @description 针对表【course_to_profession】的数据库操作Mapper
 * @createDate 2024-09-10 14:42:23
 * @Entity generator.entity.CourseToProfession
 */
@Mapper
public interface CourseToProfessionMapper extends BaseMapper<CourseToProfession> {

    /**
     * courseId 和 professionId 删除数据，并返回删除的行数
     * @param courseId      课程id
     * @param professionId  课程科目id
     * @return              Msg
     */
    @Delete("DELETE FROM course_to_profession WHERE course_id = #{courseId} AND profession_id = #{professionId}")
    int deleteByCourseIdAndProfessionId(@Param("courseId") int courseId, @Param("professionId") int professionId);

    // 删除特定 course_id 的数据
    @Delete("DELETE FROM course_to_profession WHERE course_id = #{courseId}")
    void deleteByCourseId(int courseId);

    // 删除特定 profession_id 的数据
    @Delete("DELETE FROM course_to_profession WHERE profession_id = #{professionId}")
    void deleteByProfessionId(int professionId);

    // 获取涉及参数课程科目的”课程与课程科目连接“有几个，用于判断是否能够删除两者的连接(一个课程至少要有一个)
    int getConnectionCount (@Param("courseId") int courseId);

}
