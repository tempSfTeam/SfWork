package com.tempsfteam.class_tool.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.tempsfteam.class_tool.dto.CourseDTO;
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

    // unique
    private String name;

    private String description;

    private String icon;

    private Integer managerId;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;

    public Course() {
    }

    public Course(String name, String description, String icon, Integer managerId) {
        this.name = name;
        this.description = description;
        this.icon = icon;
        this.managerId = managerId;
    }

    public Course(CourseDTO courseDTO) {
        this.courseId = courseDTO.getCourseId();
        this.name = courseDTO.getName();
        this.description = courseDTO.getDescription();
        this.icon = courseDTO.getIcon();
        this.managerId = courseDTO.getManagerId();
    }
}
