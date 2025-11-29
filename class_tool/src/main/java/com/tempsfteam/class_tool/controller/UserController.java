package com.tempsfteam.class_tool.controller;

import com.tempsfteam.class_tool.bean.Msg;
import com.tempsfteam.class_tool.dto.LoginDTO;
import com.tempsfteam.class_tool.service.UserService;
import com.tempsfteam.class_tool.util.CheckCodeUtil;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/user")

public class UserController {
    @Resource
    UserService userService;

    /**
     * 获取图形验证码
     *
     * @param response 响应
     */
    @GetMapping("/getVerifyCode")
    public Msg getVerifyCode(HttpServletResponse response) throws IOException {
        //禁用缓存
        response.setHeader("pragma", "no-cache");
        response.setHeader("cache-control", "no-cache");
        response.setHeader("expires", "0");
        //获取验证码
        ConcurrentHashMap<String, String> map;
        map = CheckCodeUtil.imgByMap();
        //返回
        return Msg.success("获取验证码成功", map);
    }

    @PostMapping("/login")
    public Msg login(@RequestBody LoginDTO loginDTO) throws IOException {
        return userService.login(loginDTO);
    }

}