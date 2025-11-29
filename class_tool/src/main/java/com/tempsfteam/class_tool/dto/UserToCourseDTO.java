package com.tempsfteam.class_tool.dto;

import com.tempsfteam.class_tool.validation.TotalValidation;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;

/**
 * @author ADACHI
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
public class UserToCourseDTO {
    @NotNull(message = "用户id不能为空", groups = {TotalValidation.DeleteUserToCourse.class,TotalValidation.InsertUserToCourse.class})
    private Long userId;
    @NotNull(message = "课程id不能为空", groups = {TotalValidation.DeleteUserToCourse.class,TotalValidation.InsertUserToCourse.class})
    private Integer courseId;

}
