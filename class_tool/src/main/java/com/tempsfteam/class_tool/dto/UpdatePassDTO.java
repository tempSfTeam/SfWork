package com.tempsfteam.class_tool.dto;

import com.tempsfteam.class_tool.validation.TotalValidation;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;

/**
 * @author ADACHI
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdatePassDTO {
    @NotNull
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d\\S]{6,18}$",
            message = "旧密码必须包含至少一个大写字母、一个小写字母和一个数字，长度为6到18个字符",
            groups = {TotalValidation.UpdatePassword.class})
    private String oldPassword;
    @NotNull
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d\\S]{6,18}$",
            message = "新密码必须包含至少一个大写字母、一个小写字母和一个数字，长度为6到18个字符",
            groups = {TotalValidation.UpdatePassword.class})
    private String newPassword;
}
