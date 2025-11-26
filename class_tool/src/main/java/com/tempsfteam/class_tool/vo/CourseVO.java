package com.tempsfteam.class_tool.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;

/**
 * @author hypocodeemia
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CourseVO {
    private Integer courseId;

    private String name;

    private String icon;

    private ArrayList<Integer> courseTypeIds;

    private String description;

    private ArrayList<SimpleSection> sections;
}