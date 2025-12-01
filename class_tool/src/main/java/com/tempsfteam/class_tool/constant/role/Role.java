package com.tempsfteam.class_tool.constant.role;

/**
 * @author hypocodeemia
 */
public class Role {

    /**
     * 学生
     */
    public static final int STUDENT_INT = 0;

    /**
     * 教师
     */
    public static final int TEACHER_INT = 1;

    /**
     * 课程管理员
     */
    public static final int COURSE_MANAGER_INT = 2;

    /**
     * 运维(超级管理员)
     */
    public static final int OPERATIONS_INT = 3;
    /**
     * 二级管理员
     */
    public static final int SECONDARY_ADMIN_INT = 4;

    /**
     * 学生
     */
    public static final Integer STUDENT = 0;

    /**
     * 教师
     */
    public static final Integer TEACHER = 1;

    /**
     * 课程管理员
     */
    public static final Integer COURSE_MANAGER = 2;

    /**
     * 运维(超级管理员)
     */
    public static final Integer OPERATIONS = 3;

    /**
     * 二级管理员
     */
    public static final Integer SECONDARY_ADMIN = 4;

    /**
     * 学生字符串
     */
    public static final String STUDENT_STRING = "STUDENT";

    /**
     * 教师字符串
     */
    public static final String TEACHER_STRING = "TEACHER";

    /**
     * 课程管理员字符串
     */
    public static final String COURSE_MANAGER_STRING = "COURSE_MANAGER";

    /**
     * 运维(超级管理员)字符串
     */
    public static final String OPERATIONS_STRING = "OPERATIONS";

    /**
     * 二级管理员字符串
     */
    public static final String SECONDARY_ADMIN_STRING = "SECONDARY_ADMIN";


    /**
     * 根据角色id获取角色名称字符串
     * @param roleId
     * @return
     */
    public static String getRoleNameById(int roleId) {
        switch (roleId) {
            case STUDENT_INT:
                return STUDENT_STRING;
            case TEACHER_INT:
                return TEACHER_STRING;
            case COURSE_MANAGER_INT:
                return COURSE_MANAGER_STRING;
            case OPERATIONS_INT:
                return OPERATIONS_STRING;
            case SECONDARY_ADMIN_INT:
                return SECONDARY_ADMIN_STRING;
            default:
                return "error";
        }
    }



}
