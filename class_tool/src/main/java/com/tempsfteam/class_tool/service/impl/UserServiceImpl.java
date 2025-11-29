package com.tempsfteam.class_tool.service.impl;


import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.tempsfteam.class_tool.bean.Msg;
import com.tempsfteam.class_tool.bean.UserData;
import com.tempsfteam.class_tool.constant.PermissionConst;
import com.tempsfteam.class_tool.constant.RedisConst;
import com.tempsfteam.class_tool.constant.SecretConst;
import com.tempsfteam.class_tool.constant.UserConst;
import com.tempsfteam.class_tool.dto.LoginDTO;
import com.tempsfteam.class_tool.dto.UpdatePassDTO;
import com.tempsfteam.class_tool.dto.UpdateUserDTO;
import com.tempsfteam.class_tool.dto.UserAddDTO;
import com.tempsfteam.class_tool.entity.User;
import com.tempsfteam.class_tool.mapper.RoleToPermissionMapper;
import com.tempsfteam.class_tool.mapper.UserMapper;
import com.tempsfteam.class_tool.service.UserService;
import com.tempsfteam.class_tool.util.DTOUtils;
import com.tempsfteam.class_tool.util.MD5Util;
import com.tempsfteam.class_tool.vo.SignInInfo;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

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
    private RoleToPermissionMapper roleToPermissionMapper;

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
        String md5Password = MD5Util.encodeByMd5WithSalt(loginDTO.getPassword(), SecretConst.LOGIN_SALT);
        // 查询用户
        User user = userMapper.selectOne(new LambdaQueryWrapper<User>()
                .eq(User::getName, loginDTO.getName())
                .eq(User::getPassword, md5Password));
        // 判断用户是否存在
        if (user == null) {
            return Msg.notLegal("账号或者密码错误");
        }
        // 判断用户是否为教师/管理员
//        if (IdentityEnum.fromValue(user.getRole()).getValue() == Role.STUDENT) {
//            return Msg.notLegal("您不是教师或管理员");
//        }
        // sa-token登录，获取token值，将权限存放session
        StpUtil.login(user.getUserId());
        String token = StpUtil.getTokenValue();
        // 将用户信息存放session
        Integer role = user.getRole();
        UserData userData = new UserData(user.getUserId(), user.getName(), role);
        StpUtil.getSession().set("userData", userData);
        // 封装返回信息
        SignInInfo signInInfo = new SignInInfo();
        signInInfo.setToken(token);
        // 设置用户身份
        signInInfo.setUserRole(role);
        // 获取用户权限
        List<Map<String, String>> roleToPermissionList = roleToPermissionMapper.getRoleToPermissionListByModule(role, PermissionConst.MODULE);
        // 将权限按照 module 分组
        Map<String, List<String>> permissionList = roleToPermissionList.stream()
                .collect(Collectors.groupingBy(
                        // 以 module 作为 key
                        row -> row.get("module"),
                        Collectors.mapping(
                                // 提取 description
                                row -> row.get("description"),
                                // 将 description 聚合到 List 中
                                Collectors.toList()
                        )
                ));
        signInInfo.setPermissionList(permissionList);
        return Msg.success("登录成功", signInInfo);
    }

    @Override
    public Msg updatePassword(UpdatePassDTO updatePassDTO) throws Exception {
        // 从token中获取用户id
        long userId = StpUtil.getLoginIdAsLong();
        // 查询用户
        User user = userMapper.selectById(userId);
        // 判断用户是否存在
        if (user == null) {
            return Msg.notLegal("用户不存在");
        }
        // 判断旧密码是否正确
        String oldPassword = MD5Util.encodeByMd5WithSalt(updatePassDTO.getOldPassword(), SecretConst.LOGIN_SALT);
        if (!oldPassword.equals(user.getPassword())) {
            return Msg.notLegal("旧密码错误");
        }
        // 通过SaToken进行密码加盐加密
        String newPassword = MD5Util.encodeByMd5WithSalt(updatePassDTO.getNewPassword(), SecretConst.LOGIN_SALT);
        // 更新密码
        user.setPassword(newPassword);
        return this.updateById(user) ? Msg.success("修改成功") : Msg.fail("修改失败");
    }

    @Override
    public Msg updateInfo(UpdateUserDTO updateUserDTO) throws Exception {
        // 从token中获取用户id
        long userId = StpUtil.getLoginIdAsLong();
        // 将dto转换为实体类
        User user = DTOUtils.convertDtoToDo(updateUserDTO, User.class, UpdateUserDTO::getPhone, UpdateUserDTO::getEmail);
        user.setUserId(userId);
        return this.updateById(user) ? Msg.success("更新成功") : Msg.fail("更新失败");
    }

    @Override
    public Msg getAllUserByRole(Integer role) throws Exception {
        // 查询用户
        List<User> userList = userMapper.getAllUserByRole(role);
        // 判断用户是否存在
        if (userList.isEmpty()) {
            return Msg.notLegal("用户不存在");
        }
        return Msg.success("查询成功", userList);
    }

    /**
     * 添加用户
     * @param user 用户信息
     * @return Msg
     * @throws Exception 异常
     */
    @Override
    public Msg addUser(UserAddDTO user) throws Exception {
        // 判断用户是否存在
        if (userMapper.selectOne(new LambdaQueryWrapper<User>().eq(User::getName, user.getName())) != null) {
            return Msg.notLegal("该用户名已存在");
        }
        User realUser = new User();
        realUser.setName(user.getName());
        // 通过SaToken进行密码加盐加密
        realUser.setPassword(MD5Util.encodeByMd5WithSalt(user.getPassword(), SecretConst.LOGIN_SALT));
        realUser.setRole(user.getRole());
        realUser.setPhone(user.getPhone());
        realUser.setEmail(user.getEmail());
        // 设置默认头像
        realUser.setAvatar(UserConst.DEFAULT_AVATAR_PATH);
        // 如果有学校id则设置学校id，否则设置默认学校id
        realUser.setSchoolId(user.getSchoolId() == null ? UserConst.DEFAULT_SCHOOL_ID : user.getSchoolId());
        // 如果有班级id则设置班级id，否则设置默认班级id
        realUser.setClassId(user.getClassId() == null ? UserConst.DEFAULT_CLASS_ID : user.getClassId());
        // 保存用户
        return this.save(realUser) ? Msg.success("添加成功") : Msg.fail("添加失败");
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
