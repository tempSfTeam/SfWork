package com.tempsfteam.class_tool.controller;

import cn.dev33.satoken.annotation.SaCheckLogin;
import cn.dev33.satoken.annotation.SaCheckRole;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.tempsfteam.class_tool.bean.FileUploadFunction;
import com.tempsfteam.class_tool.bean.Msg;
import com.tempsfteam.class_tool.constant.ExcelTemplateConst;
import com.tempsfteam.class_tool.constant.StringConstant;
import com.tempsfteam.class_tool.constant.role.Role;
import com.tempsfteam.class_tool.dto.*;
import com.tempsfteam.class_tool.entity.User;
import com.tempsfteam.class_tool.entity.UserToCourse;
import com.tempsfteam.class_tool.service.ManageService;
import com.tempsfteam.class_tool.service.UserService;
import com.tempsfteam.class_tool.service.UserToCourseService;
import com.tempsfteam.class_tool.util.DTOUtils;
import com.tempsfteam.class_tool.validation.TotalValidation;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.Resource;
import java.io.File;
import java.io.FileOutputStream;
import java.net.URLEncoder;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

/**
 * @author ADACHI
 */
@RestController
@RequestMapping("/manage")
public class ManageController {
    @Resource
    ManageService manageService;
    @Resource
    UserService userService;

    @Resource
    private UserToCourseService userToCourseService;

    /**
     * 添加用户
     * @param user 用户信息
     * @return Msg
     * @throws Exception 异常
     */
    @SaCheckLogin
    @SaCheckRole(Role.OPERATIONS_STRING)
    @PostMapping("/addUser")
    public Msg addUser(@Validated(TotalValidation.AddUser.class) @RequestBody UserAddDTO user) throws Exception {
        return userService.addUser(user);
    }

    /**
     * 获取批量添加用户/学校/班级模板
     * @param templateType 模板类型
     * @return ResponseEntity
     * @throws Exception 异常
     */
    @SaCheckLogin
    @SaCheckRole(Role.OPERATIONS_STRING)
    @GetMapping("/getTemplate")
    public ResponseEntity<?> getTemplate(@RequestParam String templateType) throws Exception {
        String filePath;

        // 根据传递的模板类型来确定文件夹路径
        switch (templateType.toLowerCase()) {
            case "user":
                filePath = ExcelTemplateConst.USER_TEMPLATE_PATH;
                break;
            case "school":
                filePath = ExcelTemplateConst.SCHOOL_TEMPLATE_PATH;
                break;
            case "class":
                filePath = ExcelTemplateConst.CLASS_TEMPLATE_PATH;
                break;
            default:
                // 如果模板类型不合法,则返回contentType为JSON的错误信息
                return ResponseEntity.badRequest()
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(Msg.notLegal("无效的模板类型"));
        }

        try {
            // 创建资源对象
            Path path = Paths.get(filePath);
            org.springframework.core.io.Resource resource = new UrlResource(path.toUri());

            // 检查文件是否存在
            if (!resource.exists()) {
                // 文件不存在,则返回contentType为JSON的错误信息
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(Msg.fail("文件不存在，请检查模板类型"));
            }

            // 构建文件下载响应头
            // 返回contentType为APPLICATION_OCTET_STREAM的文件流
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + URLEncoder.encode(filePath.substring(filePath.lastIndexOf("/") + 1),"utf8") + "\"")
                    .body(resource);
        } catch (Exception e) {
            // 如果发生异常,则返回contentType为JSON的错误信息
            return ResponseEntity.internalServerError()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Msg.fail("服务器内部错误"));
        }
    }

    /**
     * 添加单个用户到课程
     * @param userToCourseDTO
     * @return
     * @throws Exception
     */
    @SaCheckLogin
    @SaCheckRole(Role.OPERATIONS_STRING)
    @PostMapping("/insertUserToCourse")
    public Msg insertUserToCourse(@Validated(TotalValidation.InsertUserToCourse.class) @RequestBody UserToCourseDTO userToCourseDTO) throws Exception {
        UserToCourse userToCourse = DTOUtils.convertDtoToDo(userToCourseDTO, UserToCourse.class,
                UserToCourseDTO::getUserId, UserToCourseDTO::getCourseId);
        return userToCourseService.save(userToCourse) ? Msg.success("添加成功") : Msg.fail("添加失败");
    }

    /**
     * 删除单个用户在课程的权限(操作中间表)
     * @param userToCourseDTO
     * @return
     * @throws Exception
     */
    @SaCheckLogin
    @SaCheckRole(Role.OPERATIONS_STRING)
    @PostMapping("/deleteUserToCourse")
    public Msg deleteUserToCourse(@Validated(TotalValidation.DeleteUserToCourse.class) @RequestBody UserToCourseDTO userToCourseDTO) throws Exception {
        LambdaQueryWrapper<UserToCourse> queryWrapper = new LambdaQueryWrapper<UserToCourse>()
                .eq(UserToCourse::getUserId, userToCourseDTO.getUserId())
                .eq(UserToCourse::getCourseId, userToCourseDTO.getCourseId());
        return userToCourseService.remove(queryWrapper) ? Msg.success("删除成功") : Msg.fail("删除失败,用户或者课程不存在,或者用户不在课程中");
    }

    /**
     * 获取所有用户
     * @return Msg
     * @throws Exception 异常
     */
    @SaCheckLogin
    @SaCheckRole(Role.OPERATIONS_STRING)
    @GetMapping("/getAllUser")
    public Msg getAllUser(@RequestParam Integer role) throws Exception {
        // 如果role不为空,则根据role查询
        if (role != null) {
            return userService.getAllUserByRole(role);
        }
        return Msg.notLegal("用户类型参数缺失");
    }

    /**
     * 查询用户信息
     * @return Msg
     */
    @SaCheckLogin
    @SaCheckRole(Role.OPERATIONS_STRING)
    @GetMapping("/getUser")
    public Msg getUser(@RequestParam(required = false) Long userId, @RequestParam(required = false) String userName) {
        // 如果userId和userName都为空,则返回参数缺失
        if (userId == null && userName == null) {
            return Msg.notLegal("用户id和用户名参数缺失");
        }
        // 如果userId不为空,则根据userId查询,否则根据userName查询,如果都不为空,则根据两者查询
        LambdaQueryWrapper<User> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(userId != null, User::getUserId, userId)
                .eq(StringUtils.hasText(userName), User::getName, userName);
        // 查询用户
        User user = userService.getOne(queryWrapper);
        // 判断用户是否存在
        if (user == null) {
            return Msg.notLegal("用户不存在");
        }
        // 隐藏用户密码和创建时间
        user.setPassword(null);
        user.setCreateTime(null);
        // 返回用户信息
        return Msg.success("查询成功", user);
    }

    /**
     * 删除用户
     * @param userQueryDTO 用户信息
     * @return Msg
     */
    @SaCheckLogin
    @SaCheckRole(Role.OPERATIONS_STRING)
    @PostMapping("/removeUser")
    public Msg removeUser(@RequestBody UserQueryDTO userQueryDTO){
        // 如果userId不为空,则根据userId删除
        Long userId = userQueryDTO.getUserId();
        if (userId != null) {
            // 删除用户
            return userService.removeById(userId) ? Msg.success("删除成功") : Msg.fail("删除失败,用户不存在");
        }
        return Msg.notLegal("用户id参数缺失");
    }
    /**
     * 更新用户信息
     * @param updateUserDTO 用户信息
     * @return Msg
     * @throws Exception 异常
     */
    @SaCheckLogin
    @PostMapping("/updateInfo")
    public Msg updateInfo(@Validated(TotalValidation.ManageUpdateUser.class) @RequestBody UpdateUserDTO updateUserDTO) throws Exception {
        return manageService.updateUser(updateUserDTO);
    }

    /**
     * 上传用户excel文件
     * @param multipartFile
     * @return
     * @throws Exception
     */
    @SaCheckLogin
    @SaCheckRole(Role.OPERATIONS_STRING)
    @PostMapping("/insertUserByFile")
    public Msg insertUserByFile(@RequestParam("multipartFile") MultipartFile multipartFile) throws Exception {
        // 上传文件路径
        String filePath = StringConstant.UPLOAD_USER_EXCEL_FOLDER;
        return handleFileUpload(filePath,multipartFile, manageService::insertUserByFile);
    }

    /**
     * 上传学校excel文件
     * @param multipartFile
     * @return
     * @throws Exception
     */
    @SaCheckLogin
    @SaCheckRole(Role.OPERATIONS_STRING)
    @PostMapping("/insertSchoolByFile")
    public Msg insertSchoolByFile(@RequestParam("multipartFile") MultipartFile multipartFile) throws Exception {
        String filePath = StringConstant.UPLOAD_SCHOOL_EXCEL_FOLDER;
        return handleFileUpload(filePath,multipartFile, manageService::insertSchoolByFile);
    }

    /**
     * 上传班级excel文件
     * @param multipartFile
     * @return
     * @throws Exception
     */
    @SaCheckLogin
    @SaCheckRole(Role.OPERATIONS_STRING)
    @PostMapping("/insertClassByFile")
    public Msg insertClassByFile(@RequestParam("multipartFile") MultipartFile multipartFile) throws Exception {
        String filePath = StringConstant.UPLOAD_CLASS_EXCEL_FOLDER;
        return handleFileUpload(filePath,multipartFile, manageService::insertClassByFile);
    }

    /**
     * 批量增加用户,真正在数据库增加用户
     *
     * @param map 参数
     * @return
     */
    @SaCheckLogin
    @SaCheckRole(Role.OPERATIONS_STRING)
    @PostMapping("/insertUserByFileConfirm")
    public Msg insertUserByFileConfirm(@RequestBody Map<String,String> map) throws Exception {
        return manageService.insertUserByFileConfirm(map.get("fileName"));
    }

    /**
     * 批量增加学校,真正在数据库增加学校
     * @param map
     * @return
     * @throws Exception
     */
    @SaCheckLogin
    @SaCheckRole(Role.OPERATIONS_STRING)
    @PostMapping("/insertSchoolByFileConfirm")
    public Msg insertSchoolByFileConfirm(@RequestBody Map<String,String> map) throws Exception {
        return manageService.insertSchoolByFileConfirm(map.get("fileName"));
    }

    /**
     * 批量增加班级,真正在数据库增加班级
     * @param map
     * @return
     * @throws Exception
     */
    @SaCheckLogin
    @SaCheckRole(Role.OPERATIONS_STRING)
    @PostMapping("/insertClassByFileConfirm")
    public Msg insertClassByFileConfirm(@RequestBody Map<String,String> map) throws Exception {
        return manageService.insertClassByFileConfirm(map.get("fileName"));
    }

    // 获取对应需要批量导入而上传完的excel文件
    @SaCheckLogin
    @SaCheckRole(Role.OPERATIONS_STRING)
    @GetMapping("/getExcelFile")
    public ResponseEntity<?> getExcelFile(@RequestParam String fileName, @RequestParam String fileType) {
        String folderPath;

        // 根据传递的文件类型来确定文件夹路径
        switch (fileType) {
            case "school":
                folderPath = StringConstant.DOWNLOAD_SCHOOL_EXCEL_FOLDER;
                break;
            case "class":
                folderPath = StringConstant.DOWNLOAD_CLASS_EXCEL_FOLDER;
                break;
            default:
                return ResponseEntity.badRequest()
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(Msg.notLegal("无效的文件类型"));
        }

        // 获取完整的文件路径
        String filePath = folderPath + "/" + fileName;

        try {
            // 创建资源对象
            Path path = Paths.get(filePath);
            org.springframework.core.io.Resource resource = new UrlResource(path.toUri());

            // 检查文件是否存在
            if (!resource.exists()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(Msg.fail("文件不存在，请检查模板类型"));
            }

            // 构建文件下载响应头
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Msg.fail("服务器内部错误"));
        }
    }

    // 通用文件上传处理方法
    private Msg handleFileUpload(String filePath,MultipartFile multipartFile, FileUploadFunction<String, Msg> fileProcessor) throws Exception {
        // 如果文件夹不存在，则创建
        File targetFile = new File(filePath);
        if (!targetFile.exists()) {
            targetFile.mkdirs();
        }
        // 生成文件名
        String suffix = multipartFile.getOriginalFilename().substring(multipartFile.getOriginalFilename().lastIndexOf("."));
        String fileName = UUID.randomUUID().toString().replaceAll("-", "") + suffix;
        String name = filePath + "/" + fileName;
        // 写入文件
        try (FileOutputStream out = new FileOutputStream(name)) {
            out.write(multipartFile.getBytes());
            // 传入不同表的处理逻辑
            return fileProcessor.apply(name);
        } catch (Exception e) {
            // 如果发生异常，删除已创建的文件
            Files.deleteIfExists(Paths.get(name));
            throw e;
        }
    }

    /**
     * 添加班级的课程授权
     * @param classeToCourseDTO
     * @return
     * @throws Exception
     */
    @SaCheckLogin
    @SaCheckRole(Role.OPERATIONS_STRING)
    @PostMapping("/insertClassToCourse")
    public Msg insertClassToCourse(@Validated(TotalValidation.insertClassToCourse.class) @RequestBody ClasseToCourseDTO classeToCourseDTO) throws Exception {
        return manageService.insertClassToCourse(classeToCourseDTO);
    }



}
