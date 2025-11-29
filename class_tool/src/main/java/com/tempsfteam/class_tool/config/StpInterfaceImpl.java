package com.tempsfteam.class_tool.config;

import cn.dev33.satoken.stp.StpInterface;
import cn.dev33.satoken.stp.StpUtil;
import com.tempsfteam.class_tool.bean.UserData;
import com.tempsfteam.class_tool.constant.role.Role;
import com.tempsfteam.class_tool.service.RoleToPermissionService;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @author Wookie
 * @create 2024/3/22 14:16
 * @description sa-token权限验证接口实现类
 */
@Component
public class StpInterfaceImpl implements StpInterface {

    @Resource
    private RoleToPermissionService roleToPermissionService;

    private Map<Integer,List<String>> roleToPermissionMap = new HashMap<>();

    @PostConstruct
    public void init() {
        // 获取角色权限中间表的数据
        roleToPermissionMap = roleToPermissionService.getRoleToPermissionList();
    }

    @Override
    public List<String> getPermissionList(Object loginId, String loginType) {
        // 获取当前登录用户的角色ID
        UserData userData = (UserData) StpUtil.getSession().get("userData");
        Integer userRole = userData.getRole();
        // 根据用户角色ID获取用户权限
        return roleToPermissionMap.get(userRole);
    }

    @Override
    public List<String> getRoleList(Object loginId, String loginType) {
        // 获取当前登录用户的角色ID
        UserData userData = (UserData) StpUtil.getSession().get("userData");
        Integer userRole = userData.getRole();
        List<String> list = new ArrayList<>();
        // 根据用户角色ID获取用户角色
        if (userRole.equals(Role.TEACHER)) {
            list.add("TEACHER");
        } else if (userRole.equals(Role.COURSE_MANAGER)) {
            list.add("COURSE_MANAGER");
        } else if (userRole.equals(Role.OPERATIONS)) {
            list.add("OPERATIONS");
        } else if (userRole.equals(Role.STUDENT)) {
            list.add("STUDENT");
        }
        return list;
    }
}