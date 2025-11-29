package com.tempsfteam.class_tool.bean;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author Wookie
 * @create 2024/3/20 16:55
 * @description 存放在sa-token session中的用户数据
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserData {
    /**
     * 用户id
     */
    private Long userId;
    /**
     * 用户名
     */
    private String name;

    /**
     * 用户角色
     */
    private Integer role;
}