package com.tempsfteam.class_tool.controller;

import cn.dev33.satoken.annotation.SaCheckLogin;
import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.tempsfteam.class_tool.bean.Msg;
import com.tempsfteam.class_tool.bean.UserData;
import com.tempsfteam.class_tool.dto.LoginDTO;
import com.tempsfteam.class_tool.dto.UpdateUserDTO;
import com.tempsfteam.class_tool.entity.User;
import com.tempsfteam.class_tool.service.UserService;
import com.tempsfteam.class_tool.util.CheckCodeUtil;
import com.tempsfteam.class_tool.validation.TotalValidation;
import com.tempsfteam.class_tool.vo.UserVO;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;

/**
 * @author ADACHI
 */
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

    @SaCheckLogin
    @PostMapping("/logout")
    public Msg logout() {
        // 如果已经登录，则登出
        StpUtil.checkLogin();
        return Msg.success("登出成功");
    }
    @SaCheckLogin
    @PostMapping("/updateInfo")
    public Msg updateInfo(@Validated(TotalValidation.UpdateUser.class) @RequestBody UpdateUserDTO updateUserDTO) throws Exception {
        return userService.updateInfo(updateUserDTO);
    }

    @SaCheckLogin
    @GetMapping("/getUserInfo")
    public Msg getUserInfo() throws Exception {
        long userId = StpUtil.getLoginIdAsLong();
        User user = userService.getById(userId);
        return user == null ? Msg.notLegal("用户不存在") : Msg.success("获取用户信息成功", UserVO.convertToUserVO(user));
    }

    // TODO: 测试用, 后续删除
    @GetMapping("/getToken")
    public Msg getToken(@RequestBody LoginDTO loginDTO) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getName, loginDTO.getName());
        User user = userService.getOne(wrapper);
        if (user == null) {
            return Msg.notLegal("用户不存在");
        }
        StpUtil.login(user.getUserId());
        UserData userData = new UserData(user.getUserId(), user.getName(), user.getRole());
        StpUtil.getSession().set("userData", userData);
        return Msg.success("获取token成功", StpUtil.getTokenValue());
    }

}
