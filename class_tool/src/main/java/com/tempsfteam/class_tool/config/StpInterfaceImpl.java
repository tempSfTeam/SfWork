package com.tempsfteam.class_tool.config;

import cn.dev33.satoken.stp.StpInterface;
import cn.dev33.satoken.stp.StpUtil;
import com.tempsfteam.class_tool.bean.UserData;
import com.tempsfteam.class_tool.constant.role.Role;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * @author Wookie
 * @create 2024/3/22 14:16
 * @description sa-token权限验证接口实现类
 */
@Component
public class StpInterfaceImpl implements StpInterface {
    @Override
    public List<String> getPermissionList(Object loginId, String loginType) {
        return null;
    }

    @Override
    public List<String> getRoleList(Object loginId, String loginType) {
        UserData userData = (UserData) StpUtil.getSession().get("userData");
        Integer userRole = userData.getRole();
        List<String> list = new ArrayList<>();
        if (userRole.equals(Role.TEACHER)) {
            list.add("TEACHER");
        } else if (userRole.equals(Role.COURSE_MANAGER)) {
            list.add("COURSE_MANAGER");
        } else if (userRole.equals(Role.OPERATIONS)) {
            list.add("OPERATIONS");
        }
        return list;
    }
}