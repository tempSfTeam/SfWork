package com.tempsfteam.class_tool.entity;

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
    private Integer id;

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

    private static final long serialVersionUID = 1L;
}