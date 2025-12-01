package com.tempsfteam.class_tool.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.tempsfteam.class_tool.bean.Msg;
import com.tempsfteam.class_tool.entity.RoleToPermission;

import java.util.List;
import java.util.Map;

/**
 * @author ADACHI
 * @description 针对表【role_to_permission(角色权限中间表)】的数据库操作Service
 * @createDate 2024-09-30 16:33:03
 */
public interface RoleToPermissionService extends IService<RoleToPermission> {
    /**
     * 获取角色所拥有的权限，返回角色ID和权限描述的映射关系，用于satoken的权限验证
     * @return
     */
    public Map<Integer, List<String>> getRoleToPermissionList();

    /**
     * 获取角色拥有的权限，用于超管修改角色权限的前端展示
     * @param module
     * @return
     */
    public Msg listRoleToPermission(List<String> module);

    /**
     * 更新角色权限
     * @param updatedPermissions
     * @return
     */
    public Msg updateRoleToPermission(List<Map<String, Object>> updatedPermissions);

}
