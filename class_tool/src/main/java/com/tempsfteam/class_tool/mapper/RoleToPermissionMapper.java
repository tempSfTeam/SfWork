package com.tempsfteam.class_tool.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
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
     * @param roleId 角色id
     * @param permissionModule 指定权限模块
     * @return 权限列表
     */
    @MapKey("module")
    public List<Map<String, String>> getRoleToPermissionListByModule(@Param("roleId")Integer roleId,@Param("list") List<String> permissionModule);

}




