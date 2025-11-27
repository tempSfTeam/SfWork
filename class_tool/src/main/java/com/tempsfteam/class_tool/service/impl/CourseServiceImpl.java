package com.tempsfteam.class_tool.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.tempsfteam.class_tool.bean.Msg;
import com.tempsfteam.class_tool.dto.CourseDTO;
import com.tempsfteam.class_tool.entity.Course;
import com.tempsfteam.class_tool.mapper.CourseMapper;
import com.tempsfteam.class_tool.service.CourseService;
import org.springframework.stereotype.Service;

/**
 * @author hypocodeemia
 * @description 针对表【course】的数据库操作Service实现
 * @createDate 2024-09-10 14:42:23
 */
@Service
public class CourseServiceImpl extends ServiceImpl<CourseMapper, Course>
        implements CourseService {

    @Override
    public Msg addCourse(String name, String description, String icon, Integer managerId) {
        Course course = new Course(name,description,icon,managerId);
        boolean isSaved = this.save(course);
        return isSaved ? Msg.success("添加课程成功",course.getCourseId(),null) : Msg.fail("添加课程失败");
    }

    @Override
    public Msg deleteCourse(Integer courseId) {
        return this.removeById(courseId) ? Msg.success() : Msg.fail("删除课程失败");
    }

    @Override
    public Msg updateCourseInfo(CourseDTO courseDTO) {
        return this.updateById(new Course(courseDTO)) ? Msg.success()
                : Msg.fail("更改课程信息失败");
    }

    @Override
    public Msg listAllCourse() {
        return Msg.success("以下为全部的课程",this.list());
    }

    @Override
    public Msg listCourseByRole() {
        return null;
    }

    @Override
    public Msg getOne(Integer courseId) {
        return Msg.success("以下为课程详细信息",this.getById(courseId));
    }

    @Override
    public Msg listPopularCourse(Integer number) {
        return null;
    }
}
