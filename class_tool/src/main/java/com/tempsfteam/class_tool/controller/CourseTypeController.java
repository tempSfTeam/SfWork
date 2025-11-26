package com.tempsfteam.class_tool.controller;

import com.tempsfteam.class_tool.bean.Msg;
import com.tempsfteam.class_tool.dto.CourseTypeDTO;
import com.tempsfteam.class_tool.service.CourseTypeService;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;

/**
 * @author hypocodeemia
 */
@RestController
@RequestMapping("courseType")
public class CourseTypeController {
    @Resource
    private CourseTypeService courseTypeService;

    @PostMapping("add")
    public Msg add(@RequestBody CourseTypeDTO courseTypeDTO){
        return courseTypeService.addCourseType(courseTypeDTO.getName());
    }

    @PostMapping("delete")
    public Msg delete(@RequestBody CourseTypeDTO courseTypeDTO){
        return courseTypeService.deleteCourseType(courseTypeDTO.getCourseTypeId());
    }

    @PostMapping("update")
    public Msg update(@RequestBody CourseTypeDTO courseTypeDTO){
        return courseTypeService.updateCourseTypeInfo(courseTypeDTO);
    }

    @GetMapping("listAll")
    public Msg listAll(){
        return courseTypeService.listAllCourseType();
    }

}
