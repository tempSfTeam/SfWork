package com.tempsfteam.class_tool.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tempsfteam.class_tool.dto.CourseDTO;
import com.tempsfteam.class_tool.entity.Course;
import com.tempsfteam.class_tool.vo.*;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/**
 * @author hypocodeemia
 * @description 针对表【course】的数据库操作Mapper
 * @createDate 2024-09-10 14:42:23
 * @Entity generator.entity.Course
 */
@Mapper
public interface CourseMapper extends BaseMapper<Course> {

    // 获取课程管理员管理的课程（不包含 description，同时包含课程科目 id）
    @Select({"SELECT c.course_id, c.name, c.icon, GROUP_CONCAT(ctp.profession_id) AS profession_ids_str " +
            "FROM course c " +
            "LEFT JOIN course_to_profession ctp ON c.course_id = ctp.course_id " +
            "WHERE c.manager_id = #{managerId} " +
            "GROUP BY c.course_id, c.name, c.icon"})
    List<CourseVO> getCourseListByManagerId(@Param("managerId")Long managerId);

    // 根据用户 ID 获取课程信息（不包含 description 和 manager_id，同时包含课程科目 id）
    @Select({"SELECT c.course_id, c.name, c.icon, GROUP_CONCAT(ctp.profession_id) AS profession_ids_str " +
            "FROM course c " +
            "JOIN user_to_course utc ON c.course_id = utc.course_id " +
            "JOIN course_to_profession ctp ON c.course_id = ctp.course_id " +
            "WHERE utc.user_id = #{userId} " +
            "GROUP BY c.course_id, c.name, c.icon"})
    List<CourseVO> getCourseVOListByUserId(Long userId);

    // 获取所有课程信息（不包含 description，同时包含课程科目 id）
    @Select("SELECT c.course_id, c.name, c.icon, GROUP_CONCAT(ctp.profession_id) AS profession_ids_str FROM course c LEFT JOIN course_to_profession ctp ON c.course_id = ctp.course_id GROUP BY c.course_id, c.name, c.icon")
    List<CourseVO> getAllCourseVOList();




    // 获取除 simpleExperiments 外的信息
    @Select("SELECT c.course_id, c.name, c.icon, c.description FROM course c WHERE c.course_id = #{courseId}")
    CourseVO getCourseVOBaseInfoById(Integer courseId);

    // 获取 simpleExperiments 信息，并返回 List<SimpleExperiment>
    @Select("SELECT * FROM experiment WHERE course_id = #{courseId}")
    List<SimpleExperiment> getSimpleExperimentsById(Integer courseId);

    // 检查给定的 userId 和 courseId 在表中是否有对应的数据
    @Select("SELECT COUNT(*) FROM user_to_course WHERE user_id = #{userId} AND course_id = #{courseId}")
    int checkUserToCourseExists(@Param("userId") Long userId, @Param("courseId") Integer courseId);

    // 检查给定的 user 在对应的 course 中是否是课程管理员
    @Select("SELECT COUNT(*) FROM course WHERE  manager_id = #{userId} AND course_id = #{courseId}")
    int checkIsCourseManager(@Param("userId") Long userId, @Param("courseId")Integer courseId);

    // 按照CourseDTO去更改指定的course数据，但是不更改managerId
    @Update("UPDATE course SET name = #{name}, description = #{description}, icon = #{icon} WHERE course_id = #{courseId}")
    int updateCourseExceptManagerId(CourseDTO courseDTO);


    // 根据用户 ID 获取课程信息（不包含 description 和 manager_id，同时包含课程科目 id）
    Page<CourseVO> getCourseVOListByUserIdAndProfessionId(Page<Course> pageDTO, @Param("userId")Long userId, @Param("professionId")Integer professionId, @Param("searchStr") String searchStr);

    // 获取课程管理员管理的课程（不包含 description，同时包含课程科目 id）
    Page<CourseVO> getCourseListByManagerIdAndProfessionId(Page<Course> pageDTO,@Param("managerId")Long managerId,@Param("professionId")Integer professionId,@Param("searchStr") String searchStr);

    // 获取所有课程信息（不包含 description，同时包含课程科目 id）
    Page<CourseVO> getAllCourseVOListByProfessionId(Page<Course> pageDTO,@Param("professionId")Integer professionId,@Param("searchStr") String searchStr);

    // 通过读取user_to_course表去获取用户有权限的课程，获取这些课程的学习对象
    List<Integer> getCourseTypePreference(@Param("userId")Long userId);

    List<Course> getCoursesByCourseTypeIds(@Param("courseTypeIds")List<Integer>courseTypeIds);

    Page<Long>getUserIdsByCondition(Page<Course> pageDTO,@Param("role") Integer role,@Param("searchType")Integer searchType,@Param("searchStr")String searchStr);

    List<CourseAllowanceVO>getUserCourseAllowance(@Param("userIds")List<Long>userIds);

    List<SimpleCourseVO>getSimpleCourseVO();

    Integer checkIsAbleToManageCourse(@Param("userId")Long userId);

    Page<Integer>getCourseIdsByCondition(Page<Course> pageDTO,@Param("searchStr")String searchStr);
    List<CourseConnectionVO> getCourseConnection (@Param("courseIds")List<Integer>courseIds);


}