package com.tempsfteam.class_tool.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


/**
 * @author hypocodeemia
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CourseDTO {
    private Integer courseId;

    private String name;

    private String description;

    private String icon;

    private Integer managerId;
}
