package com.tempsfteam.class_tool.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tempsfteam.class_tool.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;


/**
 * @author ADACHI
 * @description 针对表【school】的数据库操作Mapper
 * @createDate 2024-09-10 14:42:24
 * @Entity generator.entity.School
 */
@Mapper
public interface UserMapper extends BaseMapper<User> {
    Page<User> getAllUserByRole(Page<User> page, @Param("role") Integer role);

}





