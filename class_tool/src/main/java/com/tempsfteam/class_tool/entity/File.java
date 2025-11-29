package com.tempsfteam.class_tool.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import lombok.Data;

import java.io.Serializable;

/**
 *
 * @TableName file
 */
@Data
public class File implements Serializable {
    /**
     *
     */
    @TableId(type = IdType.AUTO)
    private Integer fileId;

    /**
     *
     */
    private String fileName;

    /**
     *
     */
    private Integer fileType;

    /**
     *
     */
    private Integer resourceType;

    /**
     *
     */
    private Integer experimentId;

    /**
     *
     */
    @TableField(exist = false)
    private Integer view;

    private static final long serialVersionUID = 1L;
}