package com.tempsfteam.class_tool.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;


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

    private Long managerId;

    private List<Integer> professionIds;

    public CourseDTO(Integer courseId,String name, String description, Long managerId) {
        this.courseId = courseId;
        this.name = name;
        this.description = description;
        this.managerId = managerId;
    }

    public CourseDTO(String name, String description, Long managerId, List<Integer> professionIds) {
        this.name = name;
        this.description = description;
        this.managerId = managerId;
        this.professionIds = professionIds;
    }
}
