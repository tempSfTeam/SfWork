package com.tempsfteam.class_tool.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.tempsfteam.class_tool.dto.CourseTypeDTO;
import lombok.Data;

import java.io.Serializable;

/**
 * @author hypocodeemia
 * @TableName course_type
 */
@TableName(value ="course_type")
@Data
public class
CourseType implements Serializable {
    @TableId(type = IdType.AUTO)
    private Integer courseTypeId;

    // unique
    private String name;

    private Integer sort;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;

    public CourseType() {
    }

    public CourseType(String name) {
        this.name = name;
    }

    public CourseType(CourseTypeDTO courseTypeDTO) {
        this.courseTypeId = courseTypeDTO.getCourseTypeId();
        this.name = courseTypeDTO.getName();
    }
}
