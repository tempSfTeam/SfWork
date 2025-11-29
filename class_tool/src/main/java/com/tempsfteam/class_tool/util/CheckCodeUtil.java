package com.tempsfteam.class_tool.util;

import cn.hutool.core.codec.Base64;
import cn.hutool.core.util.IdUtil;
import com.tempsfteam.class_tool.constant.RedisConst;
import org.springframework.util.FastByteArrayOutputStream;

import javax.imageio.ImageIO;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpSession;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * @author Wookie
 * @create 2024/3/20 14:24
 * @description 验证码工具类
 */
public class CheckCodeUtil {

    public static void imgByStream(ServletOutputStream outputStream, HttpSession session) throws IOException {

        String verifyCode = VerifyCode.generateTextCode(VerifyCode.TYPE_NUM_UPPER, 4, "0oOilJI1");

        BufferedImage bim = VerifyCode.generateImageCode(verifyCode, 70, 22, 0, true, Color.WHITE, Color.BLACK, null);

        session.setAttribute(VerifyCode.VERIFY_TYPE_COMMENT, verifyCode);

        ImageIO.write(bim, "JPEG", outputStream);
    }

    public static ConcurrentHashMap<String, String> imgByMap() throws IOException {

        String verifyCode = VerifyCode.generateTextCode(VerifyCode.TYPE_NUM_UPPER, 4, "0oOilJI1");

        BufferedImage verifyImg = VerifyCode.generateImageCode(verifyCode, 70, 22, 0, true, Color.WHITE, Color.BLACK, null);

        // 生成uuid唯一标识符，并合成verifyKey
        String uuid = IdUtil.simpleUUID();
        String verifyKey = RedisConst.CAPTCHA_CODE_KEY + uuid;
        //将验证码存到redis
        RedisUtil.setEx(verifyKey, verifyCode, RedisConst.CAPTCHA_EXPIRATION, TimeUnit.MINUTES);
        // 转换流信息写出
        FastByteArrayOutputStream os = new FastByteArrayOutputStream();
        try {
            ImageIO.write(verifyImg, "jpg", os);
        } catch (IOException e) {
            throw new IOException("获取图片验证码异常");
        }
        // 用线程安全的ConcurrentHashMap存储验证码和图片
        ConcurrentHashMap<String, String> map = new ConcurrentHashMap<>(2);
        map.put("uuid", uuid);
        map.put("img", Base64.encode(os.toByteArray()));
        return map;
    }
}