package com.tempsfteam.class_tool.entity;


import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.io.Serializable;

/**
 * 权限表
 * @TableName permission
 */
@TableName(value ="permission")
@Data
@AllArgsConstructor
public class Permission implements Serializable {

    /**
     * 自增id
     */
    @TableId(type = IdType.AUTO)
    private Integer permissionId;
    /**
     * 权限描述
     */
    private String description;
    /**
     * 权限对应模块
     */
    private String module;
    /**
     * 权限对应中文介绍
     */
    @TableField("desCN")
    private String desCN;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;

}
