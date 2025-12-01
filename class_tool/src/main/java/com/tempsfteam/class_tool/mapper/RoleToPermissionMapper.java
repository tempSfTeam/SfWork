package com.tempsfteam.class_tool.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.tempsfteam.class_tool.entity.PermissionInfo;
import com.tempsfteam.class_tool.entity.RoleToPermission;
import org.apache.ibatis.annotations.MapKey;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

/**
 * @author ADACHI
 * @description 针对表【role_to_permission(角色权限中间表)】的数据库操作Mapper
 * @createDate 2024-09-30 16:33:03
 * @Entity com.rdc.entity.RoleToPermission
 */
@Mapper
public interface RoleToPermissionMapper extends BaseMapper<RoleToPermission> {
    @MapKey("role_id")
    public List<Map<Integer, Object>> getRoleToPermissionList();

    /**
     * 根据角色id获取权限列表,并按模块分组,仅获取指定模块的权限
     * @param roleIds 角色id
     * @param permissionModule 指定权限模块
     * @return 权限列表
     */
    public List<PermissionInfo> getRoleToPermissionListByModule(@Param("roleIds") List<Integer> roleIds, @Param("list") List<String> permissionModule);

    /**
     * 根据权限id获取角色id列表
     * @param permissionId
     * @return
     */
    public List<Integer> getRoleIdsByPermissionId(@Param("permissionId") Integer permissionId);

    /**
     * 根据权限id删除角色权限关联
     * @param permissionId
     * @param roleIds
     * @return
     */
    public Integer deleteRoleToPermissions(@Param("permissionId") Integer permissionId, @Param("roleIds") List<Integer> roleIds);

    /**
     * 插入角色权限关联
     * @param permissionId
     * @param roleIds
     * @return
     */
    public Integer insertRoleToPermissions(@Param("permissionId") Integer permissionId, @Param("roleIds") List<Integer> roleIds);

}




