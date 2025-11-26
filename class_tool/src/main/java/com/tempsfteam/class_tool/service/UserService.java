package com.tempsfteam.class_tool.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.tempsfteam.class_tool.bean.Msg;
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
     * @param code code
     * @return 用户Id和token
     */
    Msg login(String code) throws IOException;


}
