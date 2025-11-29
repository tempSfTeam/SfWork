package com.tempsfteam.class_tool.dto;

import com.tempsfteam.class_tool.validation.TotalValidation;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.Email;
import javax.validation.constraints.Pattern;
/**
 * @author ADACHI
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateUserDTO {
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确", groups = {TotalValidation.UpdateUser.class})
    private String phone;
    @Email(message = "邮箱格式不正确", groups = {TotalValidation.UpdateUser.class})
    private String email;

}