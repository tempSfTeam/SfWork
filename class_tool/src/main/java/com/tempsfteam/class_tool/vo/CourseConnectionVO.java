package com.tempsfteam.class_tool.vo;

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
public class CourseConnectionVO {
    private Integer courseId;

    private String courseName;

    private String icon;

    private List<SimpleProfessionVO> SimpleProfessionVOList;
}