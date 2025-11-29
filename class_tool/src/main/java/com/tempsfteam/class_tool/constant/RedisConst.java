package com.tempsfteam.class_tool.constant;

/**
 * @author Wookie
 * @create 2024/3/24 18:45
 */
public class RedisConst {

    /**
     * 验证码 redis key
     */
    public static final String CAPTCHA_CODE_KEY = "captcha_codes:";

    /**
     * 验证码有效期（分钟）
     */
    public static final Integer CAPTCHA_EXPIRATION = 3;
}
