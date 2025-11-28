package com.tempsfteam.class_tool.controller;

import com.tempsfteam.class_tool.bean.Msg;
import com.tempsfteam.class_tool.dto.CourseDTO;
import com.tempsfteam.class_tool.service.CourseService;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;

/**
 * @author hypocodeemia
 */
@RestController
@RequestMapping("course")

public class CourseController {
    @Resource
    private CourseService courseService;

    @PostMapping("add")
    public Msg add(@RequestBody CourseDTO courseDTO){
        return courseService.addCourse(courseDTO.getName(),courseDTO.getDescription(),
                courseDTO.getIcon(),courseDTO.getManagerId());
    }

    @PostMapping("delete")
    public Msg delete(@RequestBody CourseDTO courseDTO){
        return courseService.deleteCourse(courseDTO.getCourseId());
    }

    @PostMapping("plusCourseClick")
    public void plusCourseClick(@RequestBody CourseDTO courseDTO){
        courseService.plusCourseClick(courseDTO.getCourseId());
    }

    @PostMapping("update")
    public Msg update(@RequestBody CourseDTO courseDTO){
        return courseService.updateCourseInfo(courseDTO);
    }

    @GetMapping("listByRole")
    public Msg listByRole(){
        return courseService.listCourseByRole();
    }

    @GetMapping("getDetail")
    public Msg getDetail(@RequestParam("courseId") Integer courseId){
        return courseService.getOne(courseId);
    }


    @GetMapping("listPopularCourse")
    public Msg listPopularCourse(@RequestParam("number") Integer number){
        return courseService.listPopularCourse(number);
    }


}