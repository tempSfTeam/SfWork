package com.tempsfteam.class_tool.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.tempsfteam.class_tool.bean.Msg;
import com.tempsfteam.class_tool.dto.*;
import com.tempsfteam.class_tool.entity.User;

import java.io.IOException;

/**
 * @author ADACHI
 * @description 针对表【user】的数据库操作Service
 * @createDate 2024-07-16 10:38:59
 */
public interface UserService extends IService<User> {

    /**
     * 登录
     * @return 用户Id和token
     */
    Msg login(LoginDTO loginDTO) throws IOException;

    /**
     * 修改密码
     * @param updatePassDTO updatePassDTO
     * @return
     * @throws Exception
     */
    Msg updatePassword(UpdatePassDTO updatePassDTO) throws Exception;
    /**
     * 更新用户信息
     * @param updateUserDTO
     * @return
     * @throws Exception
     */
    Msg updateInfo(UpdateUserDTO updateUserDTO) throws Exception;

    /**
     * 获取用户信息
     * @param userQueryDTO 用户查询条件
     * @return
     * @throws Exception
     */
    Msg getAllUserByRole(UserQueryDTO userQueryDTO) throws Exception;

    Msg addUser(UserAddDTO user) throws Exception;



}
