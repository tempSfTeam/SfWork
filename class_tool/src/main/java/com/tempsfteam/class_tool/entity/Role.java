package com.tempsfteam.class_tool.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.io.Serializable;

/**
 * 角色
 * @TableName role
 */
@TableName(value ="role")
@Data
@AllArgsConstructor
public class Role implements Serializable {
    /**
     * 角色id
     */
    @TableId(type = IdType.AUTO)
    private Integer roleId;

    /**
     * 角色描述
     */
    private String roleName;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;


}