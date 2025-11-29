package com.tempsfteam.class_tool.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.tempsfteam.class_tool.entity.RoleToPermission;
import com.tempsfteam.class_tool.mapper.RoleToPermissionMapper;
import com.tempsfteam.class_tool.service.RoleToPermissionService;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
* @author ADACHI
* @description 针对表【role_to_permission(角色权限中间表)】的数据库操作Service实现
* @createDate 2024-09-30 16:33:03
*/
@Service
public class RoleToPermissionServiceImpl extends ServiceImpl<RoleToPermissionMapper, RoleToPermission>
    implements RoleToPermissionService{
    @Resource
    private RoleToPermissionMapper roleToPermissionMapper;

    @Override
    public Map<Integer, List<String>> getRoleToPermissionList() {
        // 获取角色权限中间表的数据
        List<Map<Integer, Object>> roleToPermissionList = roleToPermissionMapper.getRoleToPermissionList();
        // 创建一个Map，用于存储角色ID和权限描述的映射关系
        Map<Integer, List<String>> roleToPermissionMap = new HashMap<>();
        // 遍历角色权限中间表的数据
        for (Map<Integer, Object> roleToPermission : roleToPermissionList) {
            // 获取角色ID和权限描述
            Integer roleId = (Integer) roleToPermission.get("role_id");
            String description = String.valueOf(roleToPermission.get("description"));
            // 如果角色ID不存在，则新建一个列表，并将权限描述添加到列表中，如果角色ID已存在，则直接将权限描述添加到列表中
            roleToPermissionMap.computeIfAbsent(roleId, k -> new ArrayList<>()).add(description);
        }
        // 返回角色ID和权限描述的映射关系
        return roleToPermissionMap;
    }
}




