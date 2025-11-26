package com.tempsfteam.class_tool.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.tempsfteam.class_tool.dto.ClasseDTO;
import lombok.Data;

import java.io.Serializable;

/**
 * @author hypocodeemia
 * @TableName classe
 */
@TableName(value ="classe")
@Data
public class Classe implements Serializable {
    @TableId(type = IdType.AUTO)
    private Integer classeId;

    private String name;

    private Integer schoolId;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;

    public Classe() {
    }

    public Classe(String name, Integer schoolId) {
        this.name = name;
        this.schoolId = schoolId;
    }

    public Classe(ClasseDTO classeDTO) {
        this.classeId = classeDTO.getClasseId();
        this.name = classeDTO.getName();
        this.schoolId = classeDTO.getSchoolId();
    }
}
