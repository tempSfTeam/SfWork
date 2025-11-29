package com.tempsfteam.class_tool.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import lombok.Data;

import java.io.Serializable;

/**
 *
 * @TableName experiment
 */
@Data
public class Experiment implements Serializable {
    /**
     *
     */
    @TableId(type = IdType.AUTO)
    private Integer experimentId;

    /**
     *
     */
    private String name;

    /**
     *
     */
    private Integer courseId;

    private static final long serialVersionUID = 1L;
}