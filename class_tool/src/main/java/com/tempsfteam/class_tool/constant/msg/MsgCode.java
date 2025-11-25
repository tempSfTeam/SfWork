package com.tempsfteam.class_tool.constant.msg;

/**
 * @author HypoCodeEmia
 */
public enum MsgCode {
    /**
     * 成功状态码
     */
    SUCCESS(200,"成功"),
    /**
     * 失败状态码
     */
    FAILED(400,"失败"),
    /**
     * 未登录
     */
    NOT_LOGIN(401, "未登录"),
    /**
     * 权限不足
     */
    FORBIDDEN(403, "无权访问"),
    /**
     * 资源冲突，或者资源被锁
     */
    CONFLICT(409,"资源冲突"),
    /**
     * 未知异常
     */
    UNKNOWN_ERROR(10001, "未知异常"),
    /**
     * 首次登录未注册
     */
    UNREGISTERED(10002, "未注册"),
    /**
     * 参数不合法
     */
    PARAM_ILLEGAL(10006, "参数不合法");

    private int code;

    private String message;

    MsgCode(int code, String message) {
        this.code = code;
        this.message = message;
    }

    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
