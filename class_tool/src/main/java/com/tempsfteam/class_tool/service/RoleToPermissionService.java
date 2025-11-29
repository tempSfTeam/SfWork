package com.tempsfteam.class_tool.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.tempsfteam.class_tool.entity.RoleToPermission;

import java.util.List;
import java.util.Map;

/**
* @author ADACHI
* @description 针对表【role_to_permission(角色权限中间表)】的数据库操作Service
* @createDate 2024-09-30 16:33:03
*/
public interface RoleToPermissionService extends IService<RoleToPermission> {
    public Map<Integer, List<String>> getRoleToPermissionList();

}
