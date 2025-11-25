package com.tempsfteam.class_tool.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.tempsfteam.class_tool.bean.Msg;
import com.tempsfteam.class_tool.dto.CourseDTO;
import com.tempsfteam.class_tool.entity.Course;

/**
 * @author 21983
 * @description 针对表【course】的数据库操作Service
 * @createDate 2024-09-10 14:42:23
 */
public interface CourseService extends IService<Course> {
    /**
     * 添加课程
     * @param name          课程名字
     * @param description   课程简介
     * @param icon          课程图标
     * @param managerId     课程管理员id
     * @return              Msg
     */
    Msg addCourse(String name, String description, String icon, Integer managerId);

    /**
     * 删除课程
     * @param courseId  课程id
     * @return          Msg
     */
    Msg deleteCourse(Integer courseId);

    /**
     * 更新课程基础信息
     * @param courseDTO courseDTO
     * @return          Msg
     */
    Msg updateCourseInfo(CourseDTO courseDTO);

    /**
     * 获取全部课程
     * @return          Msg
     */
    Msg listAllCourse();

    /**
     * 根据用户的角色去获取它应该看到的课程
     * @return          Msg
     */
    Msg listCourseByRole();
}

