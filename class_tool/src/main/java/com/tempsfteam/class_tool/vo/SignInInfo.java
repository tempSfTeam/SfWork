package com.tempsfteam.class_tool.vo;

import com.tempsfteam.class_tool.constant.role.IdentityEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

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
    /**
     * 用户权限列表
     */
    private Map<String, List<String>> permissionList;

    public void setUserRole(Integer userRole) {
        IdentityEnum identityEnum = IdentityEnum.fromValue(userRole);
        this.userRole = identityEnum.getUserRoleString();
    }
}
