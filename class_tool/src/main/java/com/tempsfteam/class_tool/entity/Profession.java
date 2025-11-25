package com.tempsfteam.class_tool.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;

/**
 * @author hypocodeemia
 * @TableName profession
 */
@TableName(value ="profession")
@Data
public class Profession implements Serializable {
    @TableId(type = IdType.AUTO)
    private Integer professionId;

    private Integer courseTypeId;

    private String name;

    private static final long serialVersionUID = 1L;
}
