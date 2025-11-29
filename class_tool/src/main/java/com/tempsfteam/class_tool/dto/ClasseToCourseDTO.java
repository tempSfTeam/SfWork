package com.tempsfteam.class_tool.dto;

import com.tempsfteam.class_tool.validation.TotalValidation;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;
import java.util.List;

/**
 * @author hypocodeemia
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ClasseToCourseDTO {
    @NotNull(message = "班级id不能为空", groups = {TotalValidation.insertClassToCourse.class})
    private List<Integer> classeIds;
    @NotNull(message = "课程id不能为空", groups = {TotalValidation.insertClassToCourse.class})
    private List<Integer> courseIds;
}
