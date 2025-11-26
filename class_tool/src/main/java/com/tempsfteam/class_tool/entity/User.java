package com.tempsfteam.class_tool.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 *
 * @TableName user
 */
@TableName(value ="user")
@Data
public class User implements Serializable {
    /**
     *
     */
    @TableId(type = IdType.NONE)
    private Long userId;

    /**
     *
     */
    private String name;

    /**
     *
     */
    private String avatar;

    /**
     *
     */
    private String openId;

    private LocalDateTime createTime;

    private Integer accountBookId;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}
