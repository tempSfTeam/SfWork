package com.tempsfteam.class_tool.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;

/**
 * @author hypocodeemia
 * @TableName course_to_profession
 */
@TableName(value ="course_to_profession")
@Data
public class CourseToProfession implements Serializable {
    @TableId(type = IdType.AUTO)
    private Integer id;

    private Integer courseId;

    private Integer professionId;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;

    public CourseToProfession() {
    }

    public CourseToProfession(Integer courseId, Integer professionId) {
        this.courseId = courseId;
        this.professionId = professionId;
    }

}
