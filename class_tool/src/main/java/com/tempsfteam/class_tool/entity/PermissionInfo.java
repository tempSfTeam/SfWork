package com.tempsfteam.class_tool.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author ADACHI
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PermissionInfo {
    // 角色id
    private Integer roleId;
    // 权限id
    private Integer permissionId;
    // 权限对应模块
    private String module;
    // 权限对应英文介绍
    private String description;
    // 权限对应中文介绍
    private String desCN;
}
