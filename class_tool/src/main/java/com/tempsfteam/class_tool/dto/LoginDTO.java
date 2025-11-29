package com.tempsfteam.class_tool.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author ADACHI
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginDTO {
    private String name;
    private String password;
    private String uncheckedCode;

    /**
     * 验证码对应的唯一标识
     */
    private String uuid;

}
