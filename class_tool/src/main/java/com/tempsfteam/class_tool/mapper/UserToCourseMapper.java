package com.tempsfteam.class_tool.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.tempsfteam.class_tool.entity.UserToCourse;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * @author hypocodeemia
 * @description 针对表【user_to_course】的数据库操作Mapper
 * @createDate 2024-09-10 14:42:24
 * @Entity generator.entity.UserToCourse
 */
@Mapper
public interface UserToCourseMapper extends BaseMapper<UserToCourse> {
    // 自定义批量插入，使用 INSERT IGNORE
    @Insert({
            "<script>",
            "INSERT IGNORE INTO user_to_course (user_id, course_id) VALUES ",
            "<foreach collection='list' item='item' separator=','>",
            "(#{item.userId}, #{item.courseId})",
            "</foreach>",
            "</script>"
    })
    int insertIgnoreBatch(@Param("list") List<UserToCourse> userToCourseList);

}