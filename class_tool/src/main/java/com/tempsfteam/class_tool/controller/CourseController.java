package com.tempsfteam.class_tool.controller;

import cn.dev33.satoken.annotation.SaCheckLogin;
import cn.dev33.satoken.annotation.SaCheckOr;
import cn.dev33.satoken.annotation.SaCheckPermission;
import cn.dev33.satoken.annotation.SaCheckRole;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tempsfteam.class_tool.bean.Msg;
import com.tempsfteam.class_tool.constant.PermissionConst;
import com.tempsfteam.class_tool.constant.role.Role;
import com.tempsfteam.class_tool.dto.CourseDTO;
import com.tempsfteam.class_tool.dto.CourseToProfessionDTO;
import com.tempsfteam.class_tool.entity.Course;
import com.tempsfteam.class_tool.service.CourseService;
import com.tempsfteam.class_tool.service.CourseToProfessionService;
import com.tempsfteam.class_tool.util.DTOUtils;
import com.tempsfteam.class_tool.util.FileUtil;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.Resource;
import java.util.List;

/**
 * @author hypocodeemia
 */
@RestController
@RequestMapping("/course")

public class CourseController {
    @Resource
    private CourseService courseService;
    @Resource
    private CourseToProfessionService courseToProfessionService;


    @PostMapping("/add")
    @SaCheckPermission(PermissionConst.COURSE_ADD)
    public Msg add(@RequestParam("image") MultipartFile image,
                   @RequestParam("name")String name,
                   @RequestParam("description")String description,
                   @RequestParam("managerId")Long managerId,
                   @RequestParam("professionIds") List<Integer> professionIds){

        if(FileUtil.checkNothing(image)){
            return Msg.notLegal("缺少image");
        }
        CourseDTO courseDTO = new CourseDTO(name,description,managerId,professionIds);

        DTOUtils.checkInclude(
                courseDTO,
                CourseDTO::getName,
                CourseDTO::getDescription,
                CourseDTO::getManagerId,
                CourseDTO::getProfessionIds
        );
        return courseService.addCourse(courseDTO.getName(),courseDTO.getDescription(),
                courseDTO.getManagerId(),courseDTO.getProfessionIds(),image);
    }

    @PostMapping("/delete")
    @SaCheckOr(permission = { @SaCheckPermission(PermissionConst.COURSE_ADMIN_DELETE), @SaCheckPermission(PermissionConst.COURSE_DELETE) })
    public Msg delete(@RequestBody CourseDTO courseDTO){
        DTOUtils.checkInclude(
                courseDTO,
                CourseDTO::getCourseId
        );
        return courseService.deleteCourse(courseDTO.getCourseId());
    }

    @PostMapping("/plusCourseClick")
    @SaCheckLogin
    public void plusCourseClick(@RequestBody CourseDTO courseDTO){
        DTOUtils.checkInclude(
                courseDTO,
                CourseDTO::getCourseId
        );
        courseService.plusCourseClick(courseDTO.getCourseId());
    }

    @PostMapping("/update")
    @SaCheckOr(permission = { @SaCheckPermission(PermissionConst.COURSE_ADMIN_UPDATE), @SaCheckPermission(PermissionConst.COURSE_UPDATE) })
    public Msg update(@RequestParam(value = "image", required = false)MultipartFile image,
                      @RequestParam("courseId")Integer courseId,
                      @RequestParam("name")String name,
                      @RequestParam("description")String description,
                      @RequestParam("managerId")Long managerId){
        CourseDTO courseDTO = new CourseDTO(courseId,name,description,managerId);

        DTOUtils.checkInclude(
                courseDTO,
                CourseDTO::getCourseId,
                CourseDTO::getName,
                CourseDTO::getDescription,
                CourseDTO::getManagerId
        );

        return courseService.updateCourseInfo(courseDTO,image);
    }


    @GetMapping("/listByRole")
    @SaCheckLogin
    public Msg listByRole(){
        return courseService.listCourseByRole();
    }

    @GetMapping("/getDetail")
    @SaCheckLogin
    public Msg getDetail(@RequestParam("courseId") Integer courseId){
        if(courseId == null){
            return Msg.fail("参数错误或缺失");
        }
        return courseService.getOne(courseId);
    }

    @GetMapping("/listPopularCourse")
    public Msg listPopularCourse(@RequestParam("number") Integer number){
        if(number == null|| number <= 0){
            return Msg.fail("参数错误或缺失");
        }
        return courseService.listPopularCourse(number);
    }

    @PostMapping("/connectProfession")
    @SaCheckOr(permission = { @SaCheckPermission(PermissionConst.COURSE_ADMIN_UPDATE), @SaCheckPermission(PermissionConst.COURSE_UPDATE) })
    public Msg connectProfession(@RequestBody CourseToProfessionDTO courseToProfessionDTO){
        DTOUtils.checkInclude(
                courseToProfessionDTO,
                CourseToProfessionDTO::getCourseId,
                CourseToProfessionDTO::getProfessionId
        );
        // 1.先仔细判断是否有权限进行操作
        if(!courseService.isAuthorizedForCourseUpdate(courseToProfessionDTO.getCourseId())){
            return Msg.notPermitted("您即不是该课程的管理人也不是超管");
        }
        // 2.实际操作
        return courseToProfessionService.connectProfession(courseToProfessionDTO.getCourseId(),courseToProfessionDTO.getProfessionId());
    }

    @PostMapping("/disconnectProfession")
    @SaCheckOr(permission = { @SaCheckPermission(PermissionConst.COURSE_ADMIN_UPDATE), @SaCheckPermission(PermissionConst.COURSE_UPDATE) })
    public Msg disconnectProfession(@RequestBody CourseToProfessionDTO courseToProfessionDTO){
        DTOUtils.checkInclude(
                courseToProfessionDTO,
                CourseToProfessionDTO::getCourseId,
                CourseToProfessionDTO::getProfessionId
        );
        // 1.先仔细判断是否有权限进行操作
        if(!courseService.isAuthorizedForCourseUpdate(courseToProfessionDTO.getCourseId())){
            return Msg.notPermitted("您即不是该课程的管理人也不是超管");
        }
        // 2.实际操作
        return courseToProfessionService.disconnectProfession(courseToProfessionDTO.getCourseId(),courseToProfessionDTO.getProfessionId());
    }

    @GetMapping("/listByProfessionId")
    @SaCheckLogin
    public Msg listByProfessionId(Page<Course> pageDTO, @RequestParam("professionId")Integer professionId, @RequestParam("searchStr")String searchStr){
        DTOUtils.checkInclude(
                pageDTO,
                Page::getCurrent,
                Page::getSize
        );
        if(professionId == null || professionId < 0){
            return Msg.fail("参数异常");
        }
        return courseService.listByProfessionId(pageDTO,professionId,searchStr);
    }

    @GetMapping("/getAllUserCourseAllowance")
    @SaCheckRole(Role.OPERATIONS_STRING)
    public Msg getAllUserCourseAllowance(Page<Course> pageDTO,@RequestParam("role")Integer role,@RequestParam(value = "searchType",required = false)Integer searchType,@RequestParam(value = "searchStr",required = false)String searchStr){
        DTOUtils.checkInclude(
                pageDTO,
                Page::getCurrent,
                Page::getSize
        );
        // searchType和searchStr在service里面判断
        if(role == null || (!role.equals(Role.STUDENT) && !role.equals(Role.TEACHER))){
            return Msg.fail("参数异常");
        }
        return courseService.getAllUserCourseAllowance(pageDTO,role,searchType,searchStr);
    }

    @GetMapping("/getSimpleCourseVO")
    @SaCheckPermission(PermissionConst.COURSE_QUERY)
    public Msg getSimpleCourseVO(){
        return courseService.getSimpleCourseVO();
    }

    @GetMapping("/getCourseConnection")
    @SaCheckOr(permission = { @SaCheckPermission(PermissionConst.COURSE_ADMIN_UPDATE), @SaCheckPermission(PermissionConst.COURSE_UPDATE) })
    public Msg getCourseConnection(Page<Course> pageDTO, @RequestParam("searchStr")String searchStr){
        DTOUtils.checkInclude(
                pageDTO,
                Page::getCurrent,
                Page::getSize
        );
        return courseService.getCourseConnection(pageDTO,searchStr);
    }


}
