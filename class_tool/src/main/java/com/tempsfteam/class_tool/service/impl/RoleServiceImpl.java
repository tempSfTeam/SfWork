package com.tempsfteam.class_tool.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.tempsfteam.class_tool.entity.Role;
import com.tempsfteam.class_tool.mapper.RoleMapper;
import com.tempsfteam.class_tool.service.RoleService;
import org.springframework.stereotype.Service;

/**
* @author ADACHI
* @description 针对表【role(角色)】的数据库操作Service实现
* @createDate 2024-09-30 15:56:04
*/
@Service
public class RoleServiceImpl extends ServiceImpl<RoleMapper, Role>
    implements RoleService{

}




