package com.tempsfteam.class_tool.controller;

import cn.dev33.satoken.annotation.SaCheckLogin;
import cn.dev33.satoken.annotation.SaCheckPermission;
import cn.dev33.satoken.stp.StpUtil;
import com.tempsfteam.class_tool.bean.Msg;
import com.tempsfteam.class_tool.bean.UserData;
import com.tempsfteam.class_tool.constant.PermissionConst;
import com.tempsfteam.class_tool.dto.CourseTypeDTO;
import com.tempsfteam.class_tool.dto.SortDTO;
import com.tempsfteam.class_tool.service.CourseTypeService;
import com.tempsfteam.class_tool.util.DTOUtils;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;

/**
 * @author hypocodeemia
 */
@RestController
@RequestMapping("/courseType")

public class CourseTypeController {
    @Resource
    private CourseTypeService courseTypeService;

    @PostMapping("/add")
    @SaCheckPermission(PermissionConst.COURSE_TYPE_ADD)
    public Msg add(@RequestBody CourseTypeDTO courseTypeDTO){
        DTOUtils.checkInclude(
                courseTypeDTO,
                CourseTypeDTO::getName
        );
        return courseTypeService.addCourseType(courseTypeDTO.getName());
    }

    @PostMapping("/delete")
    @SaCheckPermission(PermissionConst.COURSE_TYPE_DELETE)
    public Msg delete(@RequestBody CourseTypeDTO courseTypeDTO){
        DTOUtils.checkInclude(
                courseTypeDTO,
                CourseTypeDTO::getCourseTypeId
        );
        return courseTypeService.deleteCourseType(courseTypeDTO.getCourseTypeId());
    }

    @PostMapping("/update")
    @SaCheckPermission(PermissionConst.COURSE_TYPE_UPDATE)
    public Msg update(@RequestBody CourseTypeDTO courseTypeDTO){
        DTOUtils.checkInclude(
                courseTypeDTO,
                CourseTypeDTO::getCourseTypeId,
                CourseTypeDTO::getName
        );
        return courseTypeService.updateCourseTypeInfo(courseTypeDTO);
    }

    @PostMapping("/updateSort")
    @SaCheckPermission(PermissionConst.COURSE_TYPE_UPDATE)
    public Msg updateSort(@RequestBody SortDTO sortDTO){
        DTOUtils.checkInclude(
                sortDTO,
                SortDTO::getTargetId,
                SortDTO::getNewSort
        );
        return courseTypeService.updateSort(sortDTO);
    }

    @GetMapping("/listAll")
    @SaCheckLogin
    public Msg listAll(){
        return courseTypeService.listAllCourseType();
    }

    @GetMapping("/listPreference")
    @SaCheckLogin
    public Msg listPreference(){
        UserData userData = (UserData) StpUtil.getSession().get("userData");
        return courseTypeService.listPreferenceCourseType(userData);
    }

}
