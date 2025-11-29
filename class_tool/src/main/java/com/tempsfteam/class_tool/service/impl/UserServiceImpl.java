package com.tempsfteam.class_tool.service.impl;


import cn.dev33.satoken.secure.SaSecureUtil;
import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.tempsfteam.class_tool.bean.Msg;
import com.tempsfteam.class_tool.bean.UserData;
import com.tempsfteam.class_tool.constant.RedisConst;
import com.tempsfteam.class_tool.constant.SecretConst;
import com.tempsfteam.class_tool.constant.role.IdentityEnum;
import com.tempsfteam.class_tool.constant.role.Role;
import com.tempsfteam.class_tool.dto.LoginDTO;
import com.tempsfteam.class_tool.entity.User;
import com.tempsfteam.class_tool.mapper.UserMapper;
import com.tempsfteam.class_tool.service.UserService;
import com.tempsfteam.class_tool.vo.SignInInfo;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.io.IOException;
import java.util.regex.Pattern;

/**
 * @author ADACHI
 * @description 针对表【user】的数据库操作Service实现
 * @createDate 2024-07-16 10:38:59
 */
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User>
        implements UserService {
    @Resource
    private UserMapper userMapper;

    @Resource
    private RedisTemplate<String, Object> redisTemplate;
    @Override
    public Msg login(LoginDTO loginDTO) throws IOException {
        // 去除密码中的空格
        String passwordWithoutBlank = loginDTO.getPassword().replaceAll("\\s", "");
        // 判断密码格式

        //TODO:测试的时候方便登录跑开的,后面要删掉账号
        if (!"114514".equals(passwordWithoutBlank) && !isValidPassword(passwordWithoutBlank)) {
            return Msg.notLegal("密码格式不正确");
        }
        String verifyKey = RedisConst.CAPTCHA_CODE_KEY + loginDTO.getUuid();
        String captcha = (String) redisTemplate.opsForValue().get(verifyKey);
        // 判断验证码
        if (StrUtil.isEmpty(captcha)) {
            return Msg.notLegal("验证码已过期");
        }
        // 验证码只使用一次
        redisTemplate.delete(verifyKey);
        if (!loginDTO.getUncheckedCode().equalsIgnoreCase(captcha)) {
            return Msg.notLegal("验证码错误");
        }


        loginDTO.setPassword(passwordWithoutBlank);
        // 通过SaToken进行密码加盐加密
        String md5Password = SaSecureUtil.md5BySalt(loginDTO.getPassword(), SecretConst.LOGIN_SALT);
        // 查询用户
        User user = userMapper.selectOne(new LambdaQueryWrapper<User>()
                .eq(User::getName, loginDTO.getName())
                .eq(User::getPassword, md5Password));
        // 判断用户是否存在
        if (user == null) {
            return Msg.notLegal("账号或者密码错误");
        }
        // 判断用户是否为教师/管理员
        if (IdentityEnum.fromValue(user.getRole()).getValue() == Role.STUDENT) {
            return Msg.notLegal("您不是教师或管理员");
        }
        // sa-token登录，获取token值，将权限存放session
        StpUtil.login(user.getUserId());
        String token = StpUtil.getTokenValue();
        UserData userData = new UserData(user.getUserId(), user.getName(), user.getRole());
        StpUtil.getSession().set("userData", userData);
        // 封装返回信息
        SignInInfo signInInfo = new SignInInfo();
        signInInfo.setToken(token);
        signInInfo.setUserRole(user.getRole());
        return Msg.success("登录成功", signInInfo);
    }


    private static boolean isValidPassword(String password) {
        // 正则表达式，6-18 位，必须包含大小写字母、数字，允许特殊字符
        String regex = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d\\S]{6,18}$";

        // 创建正则模式
        Pattern pattern = Pattern.compile(regex);

        // 验证密码
        return pattern.matcher(password).matches();
    }
}
