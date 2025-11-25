package com.tempsfteam.class_tool.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;

/**
 * @author hypocodeemia
 * @TableName course
 */
@TableName(value ="course")
@Data
public class Course implements Serializable {
    @TableId(type = IdType.AUTO)
    private Integer courseId;

    private String name;

    private String description;

    private String icon;

    private Integer managerId;

    private static final long serialVersionUID = 1L;
}
