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
public class CourseAllowanceVO {
    private Long userId;

    private String userName;

    private List<SimpleCourseVO> simpleCourseVOList;
}
