package com.tempsfteam.class_tool.constant.role;

import lombok.Getter;

/**
 * @Description:
 * @Author: Zhan
 * @DateTime: 2023/7/30 14:12
 */
public enum IdentityEnum {
    // 学生
    STUDENT(0, "学生"),
    // 教师
    TEACHER(1, "教师"),
    // 课程管理员
    COURSE_MANAGER(2, "课程管理员"),
    // 运维(超级管理员)
    OPERATIONS(3, "超级管理员"),

    // 二级管理员
    SECONDARY_ADMIN(4, "二级管理员");
    private final int userRole;

    @Getter
    private final String userRoleString;

    IdentityEnum(int userRole, String userRoleString) {
        this.userRole = userRole;
        this.userRoleString = userRoleString;
    }

    public int getValue() {
        return userRole;
    }

    public static IdentityEnum fromValue(int value) {
        for (IdentityEnum role : IdentityEnum.values()) {
            if (role.getValue() == value) {
                return role;
            }
        }
        throw new IllegalArgumentException("不存在对应的身份: " + value);
    }

}