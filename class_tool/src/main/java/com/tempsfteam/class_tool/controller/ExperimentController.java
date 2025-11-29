package com.tempsfteam.class_tool.controller;

import cn.dev33.satoken.annotation.SaCheckLogin;
import cn.dev33.satoken.annotation.SaCheckPermission;
import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.tempsfteam.class_tool.bean.Msg;
import com.tempsfteam.class_tool.constant.PermissionConst;
import com.tempsfteam.class_tool.constant.msg.MsgCode;
import com.tempsfteam.class_tool.constant.role.Role;
import com.tempsfteam.class_tool.entity.Course;
import com.tempsfteam.class_tool.entity.Experiment;
import com.tempsfteam.class_tool.entity.File;
import com.tempsfteam.class_tool.service.CourseService;
import com.tempsfteam.class_tool.service.ExperimentService;
import com.tempsfteam.class_tool.service.FilePicService;
import com.tempsfteam.class_tool.service.FileService;
import com.tempsfteam.class_tool.util.DTOUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

    @Resource
    private FileService fileService;

    @Resource
    private FilePicService filePicService;

    @GetMapping("/getFiles")
    @SaCheckLogin
    @SaCheckPermission({PermissionConst.FILE_READ})
    public Msg get(@RequestParam("experimentId") Integer experimentId, @RequestParam("resourceType") Integer resourceType) {

        // 检查查看权限
        long userId = StpUtil.getLoginIdAsLong();
        if (checkReadPermission(experimentId, userId)) {
            return Msg.notPermitted("没有权限或实验不存在");
        }
        List<File> fileList = experimentService.getExperimentFile(experimentId, resourceType);
        return Msg.success().setData(fileList);
    }

    @PostMapping("/add")
    @SaCheckLogin
    @SaCheckPermission({PermissionConst.EXPERIMENT_ADD})
//    @SaCheckRole(value = {Role.COURSE_MANAGER_STRING,Role.OPERATIONS_STRING}, mode = SaMode.OR)
    public Msg add(@RequestBody Experiment experiment) throws Exception {
        DTOUtils.checkInclude(
                experiment,
                Experiment::getName,
                Experiment::getCourseId
        );
        if (!checkManagerPermissionByCourseId(experiment.getCourseId())) {
            return Msg.notPermitted(MsgCode.FORBIDDEN.getMessage());
        }
        Experiment experimentData = DTOUtils.convertDtoToDo(
                experiment,
                Experiment.class,
                Experiment::getName,
                Experiment::getCourseId
        );
        return experimentService.addExperiment(experimentData);
    }

    @PostMapping("/update")
    @SaCheckLogin
    @SaCheckPermission({PermissionConst.EXPERIMENT_UPDATE})
//    @SaCheckRole(value = {Role.COURSE_MANAGER_STRING,Role.OPERATIONS_STRING}, mode = SaMode.OR)
    public Msg update(@RequestBody Experiment experiment) throws Exception {
        DTOUtils.checkInclude(
                experiment,
                Experiment::getExperimentId
        );
        if (!checkManagerPermissionByExperimentId(experiment.getExperimentId())) {
            return Msg.notPermitted(MsgCode.FORBIDDEN.getMessage());
        }
        Experiment experimentData = DTOUtils.convertDtoToDo(
                experiment,
                Experiment.class,
                Experiment::getExperimentId,
                Experiment::getName
        );
        return experimentService.updateExperiment(experimentData);
    }

    @PostMapping("/delete")
    @SaCheckLogin
    @SaCheckPermission({PermissionConst.EXPERIMENT_DELETE})
//    @SaCheckRole(value = {Role.COURSE_MANAGER_STRING,Role.OPERATIONS_STRING}, mode = SaMode.OR)
    public Msg delete(@RequestBody Experiment experiment){
        DTOUtils.checkInclude(
                experiment,
                Experiment::getExperimentId
        );
        if (!checkManagerPermissionByExperimentId(experiment.getExperimentId())) {
            return Msg.notPermitted("没有权限或实验不存在");
        }
        return experimentService.deleteExperiment(experiment.getExperimentId());
    }

    @PostMapping("/deleteFile")
    @SaCheckLogin
    @SaCheckPermission({PermissionConst.FILE_DELETE})
//    @SaCheckRole(value = {Role.COURSE_MANAGER_STRING,Role.OPERATIONS_STRING}, mode = SaMode.OR)
    public Msg deleteFile(@RequestBody File file){
        DTOUtils.checkInclude(
                file,
                File::getFileId
        );
        // 检查权限
        File fileData = fileService.getById(file.getFileId());
        if (checkManagerPermissionByExperimentId(fileData.getExperimentId())) {
            return experimentService.deleteFile(file.getFileId());
        }
        return Msg.notPermitted("没有权限或文件不存在");
    }

    @PostMapping("/uploadFile")
    @SaCheckLogin
    @SaCheckPermission({PermissionConst.FILE_ADD})
//    @SaCheckRole(value = {Role.COURSE_MANAGER_STRING,Role.OPERATIONS_STRING}, mode = SaMode.OR)
    public Msg uploadFile(@RequestParam("file") MultipartFile file, @RequestParam Integer experimentId, @RequestParam Integer resourceType) throws Exception {
        if (experimentId == null || file == null || resourceType == null) {
            return Msg.fail("参数错误或缺失");
        }
        if (!checkManagerPermissionByExperimentId(experimentId)) {
            return Msg.notPermitted("没有权限或实验不存在");
        }
        return experimentService.uploadFile(file, experimentId, resourceType);
    }

    @GetMapping("/getFilePic")
    @SaCheckLogin
    @SaCheckPermission({PermissionConst.FILE_READ})
    public Msg getFilePic(@RequestParam("fileId") Integer fileId) {
        if (StpUtil.hasRole(Role.OPERATIONS_STRING) || fileService.checkUserPermission(fileId, StpUtil.getLoginIdAsLong())) {
            return Msg.success("获取文件图片成功", filePicService.selectFilePicByFileId(fileId));
        }
        return Msg.notPermitted("没有权限或文件不存在");
    }

    @GetMapping("/getExperimentInfo")
    @SaCheckLogin
    @SaCheckPermission({PermissionConst.EXPERIMENT_QUERY})
    public Msg getExperimentInfo(@RequestParam("experimentId") Integer experimentId) {
        if (experimentId == null) {
            return Msg.fail("参数错误或缺失");
        }

        // 检查查看权限
        long userId = StpUtil.getLoginIdAsLong();
        if (checkReadPermission(experimentId, userId)) {
            return Msg.notPermitted("没有权限或实验不存在");
        }

        return experimentService.getExperimentInfo(experimentId);
    }

    private boolean checkReadPermission(@RequestParam("experimentId") Integer experimentId, long userId) {
        if (StpUtil.hasRoleOr(Role.COURSE_MANAGER_STRING, Role.OPERATIONS_STRING)) {
            // 课程管理员权限检查
            if (!checkManagerPermissionByExperimentId(experimentId)) {
                return true;
            }
        }else {
            // 用户权限检查
            if (!experimentService.checkUserPermission(experimentId, userId)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 通过courseId检查用户是否有权限
     * @param courseId 课程id
     * @return 是否有权限
     */
    private Boolean checkManagerPermissionByCourseId(Integer courseId) {
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

    /**
     * 通过实验id检查用户是否有权限
     * @param experimentId 实验id
     * @return 是否有权限
     */
    private Boolean checkManagerPermissionByExperimentId(Integer experimentId) {
        Experiment experiment = experimentService.getById(experimentId);

        if(experiment == null) {
            return false;
        }
        return checkManagerPermissionByCourseId(experiment.getCourseId());
    }
}
