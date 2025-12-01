package com.tempsfteam.class_tool.constant;

import java.util.Arrays;
import java.util.List;

public class PermissionConst {
    // 用户登录时返回权限限制的模块, 只返回这些模块的权限, 忽略特定模块的权限
    public static final List<String> MODULE = Arrays.asList(
            "user", "profession", "course_type", "course", "school",
            "classe", "file", "experiment");
    // 用户权限
    public static final String USER_ADD = "user.add";
    public static final String USER_DELETE = "user.delete";
    public static final String USER_UPDATE = "user.update";
    public static final String USER_QUERY = "user.query";

    // 课程科目权限
    public static final String PROFESSION_ADD = "profession.add";
    public static final String PROFESSION_DELETE = "profession.delete";
    public static final String PROFESSION_UPDATE = "profession.update";
    public static final String PROFESSION_QUERY = "profession.query";

    // 学习对象权限
    public static final String COURSE_TYPE_ADD = "course_type.add";
    public static final String COURSE_TYPE_DELETE = "course_type.delete";
    public static final String COURSE_TYPE_UPDATE = "course_type.update";
    public static final String COURSE_TYPE_QUERY = "course_type.query";

    // 课程权限
    public static final String COURSE_ADD = "course.add";
    public static final String COURSE_DELETE = "course.delete";
    public static final String COURSE_UPDATE = "course.update";
    public static final String COURSE_QUERY = "course.query";

    // 学校权限
    public static final String SCHOOL_ADD = "school.add";
    public static final String SCHOOL_DELETE = "school.delete";
    public static final String SCHOOL_UPDATE = "school.update";
    public static final String SCHOOL_QUERY = "school.query";

    // 班级权限
    public static final String CLASSE_ADD = "classe.add";
    public static final String CLASSE_DELETE = "classe.delete";
    public static final String CLASSE_UPDATE = "classe.update";
    public static final String CLASSE_QUERY = "classe.query";

    // 文件权限
    public static final String FILE_ADD = "file.add";
    public static final String FILE_DELETE = "file.delete";
    public static final String FILE_UPDATE = "file.update";
    public static final String FILE_READ = "file.read";
    public static final String FILE_DOWNLOAD = "file.download";

    // 实验权限
    public static final String EXPERIMENT_ADD = "experiment.add";
    public static final String EXPERIMENT_DELETE = "experiment.delete";
    public static final String EXPERIMENT_UPDATE = "experiment.update";
    public static final String EXPERIMENT_QUERY = "experiment.query";

    // 角色权限关联
    public static final String ROLE_TO_PERMISSION_UPDATE = "role_to_permission.update";
    public static final String ROLE_TO_PERMISSION_DELETE = "role_to_permission.delete";

    // 管理员课程权限
    public static final String COURSE_ADMIN_ADD = "course.adminAdd";
    public static final String COURSE_ADMIN_DELETE = "course.adminDelete";
    public static final String COURSE_ADMIN_UPDATE = "course.adminUpdate";
    public static final String COURSE_ADMIN_QUERY = "course.adminQuery";

    // 课程管理员权限
    public static final String COURSE_COURSE_MANAGER_QUERY = "course.courseManagerQuery";

    // 批量添加学生/班级/学校的权限
    public static final String USER_ADD_BY_FILE = "user.addByFile";
    public static final String CLASSE_ADD_BY_FILE = "classe.addByFile";
    public static final String SCHOOL_ADD_BY_FILE = "school.addByFile";


}

