package com.tempsfteam.class_tool.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.tempsfteam.class_tool.bean.Msg;
import com.tempsfteam.class_tool.constant.role.Role;
import com.tempsfteam.class_tool.entity.Permission;
import com.tempsfteam.class_tool.entity.PermissionInfo;
import com.tempsfteam.class_tool.entity.RoleToPermission;
import com.tempsfteam.class_tool.mapper.PermissionMapper;
import com.tempsfteam.class_tool.mapper.RoleToPermissionMapper;
import com.tempsfteam.class_tool.service.RoleToPermissionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.util.*;

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

    @Resource
    private PermissionMapper permissionMapper;

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

    @Override
    public Msg listRoleToPermission(List<String> modules) {
        // Step 1: 获取所有的权限数据，限定可修改的权限模块，非所有权限
        List<Permission> permissions = permissionMapper.selectList(new LambdaQueryWrapper<Permission>()
                .in(Permission::getModule, modules)
        );

        // Step 2: 获取角色拥有的权限数据，限定可修改的角色，非所有角色
        List<PermissionInfo> roleToPermissionList = roleToPermissionMapper.getRoleToPermissionListByModule(
                Arrays.asList(Role.STUDENT, Role.TEACHER, Role.COURSE_MANAGER), modules
        );

        // Step 3: 将角色权限数据按 permissionId 分组，以便于后续操作
        Map<Integer, List<Integer>> permissionRoleMap = new HashMap<>();
        for (PermissionInfo permissionInfo : roleToPermissionList) {
            // 将角色ID添加到对应的权限ID下
            permissionRoleMap.computeIfAbsent(permissionInfo.getPermissionId(), k -> new ArrayList<>())
                    .add(permissionInfo.getRoleId());
        }

        // Step 4: 将所有权限与角色信息结合
        Map<String, List<Map<String, Object>>> categorizedPermissions = new HashMap<>();

        // 遍历所有权限，结合角色信息
        for (Permission permission : permissions) {
            // 创建权限数据
            Map<String, Object> permissionData = new HashMap<>();
            permissionData.put("permissionId", permission.getPermissionId());
            permissionData.put("desCN", permission.getDesCN());

            // 获取当前权限的角色ID
            List<Integer> roleIds = permissionRoleMap.getOrDefault(permission.getPermissionId(), new ArrayList<>());

            // 将角色ID放入权限数据
            permissionData.put("roleIds", roleIds);

            // 按模块分组
            String module = permission.getModule();
            categorizedPermissions.computeIfAbsent(module, k -> new ArrayList<>())
                    .add(permissionData);
        }

        // 返回结果
        return Msg.success("获取成功", categorizedPermissions);
    }

    @Transactional
    @Override
    public Msg updateRoleToPermission(List<Map<String, Object>> updatedPermissions) {
        // Step 1: 遍历前端传递过来的权限数据
        for (Map<String, Object> permissionData : updatedPermissions) {
            // 获取权限ID和拥有该权限的角色ID
            Integer permissionId = (Integer) permissionData.get("permissionId");
            List<Integer> newRoleIds = (List<Integer>) permissionData.get("roleIds");

            // Step 2: 获取数据库中当前该权限的所有角色
            List<Integer> currentRoleIds = roleToPermissionMapper.getRoleIdsByPermissionId(permissionId);

            // 只保留学生、教师、课程管理员的角色ID，防止其他不可修改权限的角色被修改
            currentRoleIds.retainAll(Arrays.asList(Role.STUDENT, Role.TEACHER, Role.COURSE_MANAGER));

            // Step 3: 计算新增的角色ID和需要删除的角色ID
            List<Integer> rolesToAdd = new ArrayList<>(newRoleIds);
            // 计算需要添加对应权限的角色
            rolesToAdd.removeAll(currentRoleIds);
            List<Integer> rolesToRemove = new ArrayList<>(currentRoleIds);
            // 计算需要删除对应权限的角色
            rolesToRemove.removeAll(newRoleIds);

            // Step 4: 删除不再拥有该权限的角色权限
            if (!rolesToRemove.isEmpty()) {
                roleToPermissionMapper.deleteRoleToPermissions(permissionId, rolesToRemove);
            }

            // Step 5: 添加新的角色权限关系
            if (!rolesToAdd.isEmpty()) {
                roleToPermissionMapper.insertRoleToPermissions(permissionId, rolesToAdd);
            }
        }

        // 返回成功消息
        return Msg.success("权限更新成功");
    }
}




