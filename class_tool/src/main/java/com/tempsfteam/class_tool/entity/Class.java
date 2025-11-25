package com.tempsfteam.class_tool.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;

/**
 * @author hypocodeemia
 * @TableName class
 */
@TableName(value ="class")
@Data
public class Class implements Serializable {
    @TableId(type = IdType.AUTO)
    private Integer classId;

    private String name;

    private Integer schoolId;

    private static final long serialVersionUID = 1L;
}
