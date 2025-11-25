package com.tempsfteam.class_tool.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;

/**
 * @author hypocodeemia
 * @TableName school
 */
@TableName(value ="school")
@Data
public class School implements Serializable {
    @TableId(type = IdType.AUTO)
    private Integer schoolId;

    private String name;

    private static final long serialVersionUID = 1L;
}
