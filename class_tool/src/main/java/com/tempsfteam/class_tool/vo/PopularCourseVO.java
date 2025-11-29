package com.tempsfteam.class_tool.vo;

import com.tempsfteam.class_tool.entity.Course;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author hypocodeemia
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PopularCourseVO {
    private Integer courseId;

    private String name;

    private String icon;

    private Integer click;


    public PopularCourseVO(Course course, Double score) {
        this.courseId = course.getCourseId();
        this.name = course.getName();
        this.icon = course.getIcon();
        this.click = score.intValue();
    }

}
