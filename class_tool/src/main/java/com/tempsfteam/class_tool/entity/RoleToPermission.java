package com.tempsfteam.class_tool.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.io.Serializable;

/**
 * 角色权限中间表
 * @TableName role_to_permission
 */
@TableName(value ="role_to_permission")
@Data
@AllArgsConstructor
public class RoleToPermission implements Serializable {
    /**
     * 映射id
     */
    @TableId(type = IdType.AUTO)
    private Integer mappingId;

    /**
     * 角色id
     */
    private Integer roleId;

    /**
     * 权限id
     */
    private Integer permissionId;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}