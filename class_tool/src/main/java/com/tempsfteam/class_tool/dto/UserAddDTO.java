package com.tempsfteam.class_tool.dto;

import com.tempsfteam.class_tool.validation.TotalValidation;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserAddDTO {
    /**
     * 用户名
     */
    @NotNull(message = "用户名不能为空", groups = {TotalValidation.AddUser.class})
    private String name;
    /**
     * 初始密码
     */
    @NotNull(message = "初始密码不能为空", groups = {TotalValidation.AddUser.class})
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d\\S]{6,18}$",
            message = "密码必须包含至少一个大写字母、一个小写字母和一个数字，长度为6到18个字符",
            groups = {TotalValidation.AddUser.class})
    private String password;
    private String phone;
    private String email;
    @NotNull(message = "角色不能为空", groups = {TotalValidation.AddUser.class})
    private Integer role;
    private Integer schoolId;
    private Integer classId;
    private String schoolNumber;
}
