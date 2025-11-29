package com.tempsfteam.class_tool.vo;

import com.tempsfteam.class_tool.constant.role.IdentityEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @Description:
 * @Author: Zhan
 * @DateTime: 2023/7/30 14:08
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SignInInfo {
    /**
     * token
     */
    private String token;
    /**
     * 用户身份
     */
    private String userRole;

    public void setUserRole(Integer userRole) {
        IdentityEnum identityEnum = IdentityEnum.fromValue(userRole);
        this.userRole = identityEnum.getUserRoleString();
    }
}

