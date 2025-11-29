package com.tempsfteam.class_tool.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;

/**
 * 
 * @TableName file_pic
 */
@TableName(value ="file_pic")
@Data
public class FilePic implements Serializable {
    /**
     * 文件图片id
     */
    @TableId(type = IdType.AUTO)
    private Integer id;

    /**
     * 文件图片名称
     */
    private String filePicName;

    /**
     * 图片所属文件的id
     */
    private Integer fileId;

    private String fileName;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}