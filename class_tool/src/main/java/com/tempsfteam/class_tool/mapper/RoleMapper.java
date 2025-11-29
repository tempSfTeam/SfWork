package com.tempsfteam.class_tool.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.tempsfteam.class_tool.entity.Role;
import org.apache.ibatis.annotations.Mapper;

/**
* @author ADACHI
* @description 针对表【role(角色)】的数据库操作Mapper
* @createDate 2024-09-30 15:56:04
* @Entity com.rdc.entity.Role
*/
@Mapper
public interface RoleMapper extends BaseMapper<Role> {

}




