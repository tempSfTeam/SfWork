package com.tempsfteam.class_tool.bean;

import com.tempsfteam.class_tool.constant.msg.MsgCode;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

/**
 * @author : IMG
 * @create : 2024/7/14
 */
@NoArgsConstructor
@AllArgsConstructor
public class Msg {
    private int code;

    private String message;

    private Object data;

    private Object other;

    public int getCode() {
        return code;
    }

    public Msg setCode(int code){
        this.code = code;
        return this;
    }

    public String getMessage() {
        return message;
    }

    public Msg setMessage(String message){
        this.message = message;
        return this;
    }

    public Object getData() {
        return data;
    }

    public Msg setData(Object data){
        this.data = data;
        return this;
    }

    public Object getOther(){
        return this.other;
    }

    public Msg setOther(Object other){
        this.other = other;
        return this;
    }

    public static Msg success(String message, Object data, Object other){
        return new Msg().setCode(MsgCode.SUCCESS.getCode()).setMessage(message).setData(data).setOther(other);
    }

    public static Msg success(String message){
        return success(message,null,null);
    }

    public static Msg success(){
        return success(null,null,null);
    }

    public static Msg success(String message, Object data){return success(message, data, null);}

    public static Msg fail(String message){
        return new Msg().setCode(MsgCode.FAILED.getCode()).setMessage(message);
    }

    public static Msg fail(){
        return fail(null);
    }

    public static Msg repeated(String message){
        return new Msg().setCode(MsgCode.CONFLICT.getCode()).setMessage(message);
    }

    public static Msg notLogin(String message){
        return new Msg().setCode(MsgCode.NOT_LOGIN.getCode()).setMessage(message);
    }
    public static Msg notPermitted(String message){
        return new Msg().setCode(MsgCode.FORBIDDEN.getCode()).setMessage(message);
    }

    public static Msg notLegal(String message){
        return new Msg().setCode(MsgCode.PARAM_ILLEGAL.getCode()).setMessage(message);
    }


}

