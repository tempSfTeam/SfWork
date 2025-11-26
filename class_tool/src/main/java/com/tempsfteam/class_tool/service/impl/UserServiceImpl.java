package com.tempsfteam.class_tool.service.impl;


import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.tempsfteam.class_tool.bean.Msg;
import com.tempsfteam.class_tool.entity.User;
import com.tempsfteam.class_tool.mapper.UserMapper;
import com.tempsfteam.class_tool.service.UserService;
import org.springframework.stereotype.Service;

import java.io.IOException;

/**
 * @author ADACHI
 * @description 针对表【user】的数据库操作Service实现
 * @createDate 2024-07-16 10:38:59
 */
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User>
        implements UserService {

    @Override
    public Msg login(String code) throws IOException {
        return null;
    }
}
