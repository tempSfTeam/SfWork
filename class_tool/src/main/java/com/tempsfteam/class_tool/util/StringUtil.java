package com.tempsfteam.class_tool.util;

public class StringUtil {

    /**
     * 判断字符串是否为空或空白
     */

    public static boolean isBlank(String str) {
        return str == null || str.trim().isEmpty();
    }

    /**
     * 去除字符串两端的空白字符
     */

    public static String trim(String str) {
        return str == null ? null : str.trim();
    }

    /**
     * 获取字符串的长度
     */

    public static int length(String str) {
        return str == null ? 0 : str.length();
    }

}
