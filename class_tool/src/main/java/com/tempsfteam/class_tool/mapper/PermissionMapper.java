package com.tempsfteam.class_tool.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.tempsfteam.class_tool.entity.Permission;
import org.apache.ibatis.annotations.Mapper;

/**
* @author ADACHI
* @description 针对表【permission(权限表)】的数据库操作Mapper
* @createDate 2024-09-30 16:06:38
* @Entity com.rdc.rdc.Permission
*/
@Mapper
public interface PermissionMapper extends BaseMapper<Permission> {

}




