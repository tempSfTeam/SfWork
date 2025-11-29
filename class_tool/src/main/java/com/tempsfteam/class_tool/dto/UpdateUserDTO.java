package com.tempsfteam.class_tool.dto;

import com.tempsfteam.class_tool.validation.TotalValidation;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
/**
 * @author ADACHI
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateUserDTO {
    @NotNull(message = "用户Id不能为空", groups = {TotalValidation.ManageUpdateUser.class})
    private Long userId;
    @NotNull(message = "用户名不能为空", groups = {TotalValidation.ManageUpdateUser.class})
    private String name;
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d\\S]{6,18}$",
            message = "密码必须包含至少一个大写字母、一个小写字母和一个数字，长度为6到18个字符",
            groups = {TotalValidation.ManageUpdateUser.class})
    private String password;
    @NotNull(message = "角色不能为空", groups = {TotalValidation.ManageUpdateUser.class})
    private Integer role;
    private Integer schoolId;
    private Integer classId;
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确", groups = {TotalValidation.UpdateUser.class, TotalValidation.ManageUpdateUser.class})
    private String phone;
    @Email(message = "邮箱格式不正确", groups = {TotalValidation.UpdateUser.class, TotalValidation.ManageUpdateUser.class})
    private String email;

}