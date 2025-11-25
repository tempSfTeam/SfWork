package com.tempsfteam.class_tool.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;

/**
 * @author hypocodeemia
 * @TableName class_to_course
 */
@TableName(value ="class_to_course")
@Data
public class ClassToCourse implements Serializable {
    @TableId(type = IdType.AUTO)
    private Integer id;

    private Integer classId;

    private Integer courseId;

    private static final long serialVersionUID = 1L;
}