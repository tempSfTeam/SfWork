package com.tempsfteam.class_tool.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.tempsfteam.class_tool.dto.ProfessionDTO;
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

    private Integer sort;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;

    public Profession() {
    }

    public Profession(Integer courseTypeId, String name) {
        this.courseTypeId = courseTypeId;
        this.name = name;
    }

    public Profession(ProfessionDTO professionDTO) {
        this.professionId = professionDTO.getProfessionId();
        this.courseTypeId = professionDTO.getCourseTypeId();
        this.name = professionDTO.getName();
    }
}
