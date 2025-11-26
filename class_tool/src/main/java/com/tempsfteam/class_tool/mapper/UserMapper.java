package com.tempsfteam.class_tool.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.tempsfteam.class_tool.entity.User;
import org.apache.ibatis.annotations.Mapper;


/**
 * @author ADACHI
 * @description 针对表【user】的数据库操作Mapper
 * @createDate 2024-07-16 10:38:59
 * @Entity com.rdc.entity.User
 */
@Mapper
public interface UserMapper extends BaseMapper<User> {

}




