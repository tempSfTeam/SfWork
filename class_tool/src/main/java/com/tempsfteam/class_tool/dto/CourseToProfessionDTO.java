package com.tempsfteam.class_tool.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * @author hypocodeemia
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CourseToProfessionDTO implements Serializable {

    private Integer courseId;

    private Integer professionId;

}