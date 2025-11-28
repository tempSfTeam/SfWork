package com.tempsfteam.class_tool.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.tempsfteam.class_tool.bean.Msg;
import com.tempsfteam.class_tool.dto.CourseDTO;
import com.tempsfteam.class_tool.entity.Course;

/**
 * @author hypocodeemia
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
    Msg addCourse(String name,String description,String icon,Integer managerId);

    /**
     * 删除课程
     * @param courseId  课程id
     * @return          Msg
     */
    Msg deleteCourse(Integer courseId);

    /**
     * 给课程的浏览次数+1
     * @param courseId 课程id
     */
    public void plusCourseClick(Integer courseId);

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

    /**
     * 获取特定的一个课程
     * @param courseId 课程id
     * @return         Msg
     */
    Msg getOne(Integer courseId);

    /**
     * 从redis中获取点击数最多的n个课程的id，然后去mysql补齐
     * @param number    需要的热门课程的数量
     * @return          Msg
     */
    Msg listPopularCourse (Integer number);
}

