package com.tempsfteam.class_tool.constant;

/**
 * @author ADACHI
 * @description 储存密码常量类
 */
public class SecretConst {


    /**
     * 私有化构造器防止外部创建实例
     */
    private SecretConst() {
    }

    public final static String APPID = "wx2d566f9d220d31f1";

    public final static String APP_SECRET = "462e5b1745a7bbf26aa0f5e3236217f7";

    /**
     * redis中的公告状态
     */
    public final static String ANNOUNCEMENT_STATUS="announcementStatus";

    /**
     * 登录盐值
     */
    public final static String LOGIN_SALT="RDC23@backend";

}
