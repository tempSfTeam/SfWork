package com.tempsfteam.class_tool.controller;

import cn.dev33.satoken.annotation.SaCheckLogin;
import cn.dev33.satoken.annotation.SaCheckRole;
import cn.dev33.satoken.annotation.SaMode;
import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.tempsfteam.class_tool.bean.Msg;
import com.tempsfteam.class_tool.constant.msg.MsgCode;
import com.tempsfteam.class_tool.constant.role.Role;
import com.tempsfteam.class_tool.entity.Course;
import com.tempsfteam.class_tool.entity.Experiment;
import com.tempsfteam.class_tool.entity.File;
import com.tempsfteam.class_tool.service.CourseService;
import com.tempsfteam.class_tool.service.ExperimentService;
import com.tempsfteam.class_tool.util.DTOUtils;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.List;

/**
 * @author : IMG
 * @create : 2024/9/14
 */
@RestController
@RequestMapping("/experiment")
public class ExperimentController {

    @Resource
    private ExperimentService experimentService;

    @Resource
    private CourseService courseService;

    @GetMapping("/getFiles")
    @SaCheckLogin
    public Msg get(@RequestParam("experimentId") Integer experimentId, @RequestParam("resourceType") Integer resourceType) {
        long userId = StpUtil.getLoginIdAsLong();
        if (!experimentService.checkUserPermission(experimentId, userId)) {
            return Msg.notPermitted(MsgCode.FORBIDDEN.getMessage());
        }
        List<File> fileList = experimentService.getExperimentFile(experimentId, resourceType);
        return Msg.success().setData(fileList);
    }

    @PostMapping("/add")
    @SaCheckLogin
    @SaCheckRole(value = {Role.COURSE_MANAGER_STRING,Role.OPERATIONS_STRING}, mode = SaMode.OR)
    public Msg add(@RequestBody Experiment experiment) throws Exception {
        DTOUtils.checkInclude(
                experiment,
                Experiment::getName,
                Experiment::getCourseId
        );
        if (!checkUserPermission(experiment.getCourseId())) {
            return Msg.notPermitted(MsgCode.FORBIDDEN.getMessage());
        }
        Experiment experimentData = DTOUtils.convertDtoToDo(
                experiment,
                Experiment.class,
                Experiment::getName,
                Experiment::getCourseId
        );
        boolean saved = experimentService.save(experimentData);
        if (!saved) {
            return Msg.fail(MsgCode.FAILED.getMessage());
        }
        return Msg.success();
    }

    /**
     * 检查用户是否有权限修改
     * @param courseId 课程id
     * @return 是否有权限
     */
    private Boolean checkUserPermission(Integer courseId) {
        if (StpUtil.hasRole(Role.COURSE_MANAGER_STRING)){
            long userId = StpUtil.getLoginIdAsLong();
            BaseMapper<Course> courseMapper = courseService.getBaseMapper();
            LambdaQueryWrapper<Course> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(Course::getCourseId, courseId)
                    .eq(Course::getManagerId, userId);
            Course result = courseMapper.selectOne(wrapper);
            return result != null;
        }else if (StpUtil.hasRole(Role.OPERATIONS_STRING)) {
            return courseService.getById(courseId) != null;
        }
        // 其它角色无权限
        return false;
    }
}