package com.tempsfteam.class_tool.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author : IMG
 * @create : 2024/10/17
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExperimentInfoVO {

    private Integer experimentId;

    private String name;

    private Integer courseId;

    private String courseName;

    private String courseDescription;

    private String courseIcon;
}
