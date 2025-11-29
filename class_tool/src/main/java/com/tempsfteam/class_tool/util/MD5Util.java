package com.tempsfteam.class_tool.util;

import java.io.UnsupportedEncodingException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * 密码加密
 * @author lj
 */
public class MD5Util {

    private static String[] hex = {"0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"};

    /**
     * 将明文密码转成MD5密码
     */
    public static String encodeByMd5(String password) {

        MessageDigest md5 = null;
        try {
            md5 = MessageDigest.getInstance("MD5");
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
        }
        //调用MD5算法，返回16个byte类型的值
        byte[] byteArray = md5.digest(password.getBytes());
        return byteArrayToHexString(byteArray);
    }

    /**
     * 用盐值生成MD5哈希
     */
    public static String encodeByMd5WithSalt(String password, String salt) {
        String passwordWithSalt = password + salt;
        return encodeByMd5(passwordWithSalt);
    }

    public static void main(String[] args) throws Exception {
        System.out.println(encodeByMd5("114514"));
    }

    /**
     * 将byte[]转在16进制字符串
     */
    private static String byteArrayToHexString(byte[] byteArray) {
        StringBuffer sb = new StringBuffer();

        for(byte b: byteArray){
            //取出每一个byte类型，进行转换
            String hex = byteToHexString(b);
            //将转换后的值放入StringBuffer中
            sb.append(hex);
        }
        return sb.toString();
    }

    /**
     * 将byte转在16进制字符串
     */
    private static String byteToHexString(byte b) {
        //将byte类型赋给int类型
        int n = b;
        //如果n是负数
        if(n < 0){
            //转正数
            //-31的16进制数，等价于求225的16进制数
            n = 256 + n;
        }
        //商(14)，数组的下标
        int d1 = n / 16;
        //余(1)，数组的下标
        int d2 = n % 16;
        //通过下标取值
        return hex[d1] + hex[d2];
    }

    public static String getMd5Str(String str){
        String result = null;

        // 生成一个MD5加密计算摘要
        MessageDigest md = null;
        try {
            md = MessageDigest.getInstance("MD5");
            byte[] bytes = md.digest(str.getBytes("utf-8"));
            final char[] HEX_DIGITS = "0123456789ABCDEF".toCharArray();
            StringBuilder ret = new StringBuilder(bytes.length * 2);
            for (int i = 0; i < bytes.length; i++) {
                ret.append(HEX_DIGITS[(bytes[i] >> 4) & 0x0f]);
                ret.append(HEX_DIGITS[bytes[i] & 0x0f]);
            }
            result = ret.toString().toUpperCase();
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }finally {
            return result;
        }
    }


}
