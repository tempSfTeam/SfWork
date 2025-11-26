package com.tempsfteam.class_tool.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;

/**
 * @author hypocodeemia
 * @TableName user_to_course
 */
@TableName(value ="user_to_course")
@Data
public class UserToCourse implements Serializable {
    @TableId(type = IdType.AUTO)
    private Integer id;

    private Long userId;

    private Integer courseId;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}