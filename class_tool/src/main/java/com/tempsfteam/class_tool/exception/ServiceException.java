package com.tempsfteam.class_tool.exception;

import lombok.Data;

/**
 * @author : IMG
 * @create : 2024/7/15
 */
@Data
public class ServiceException extends RuntimeException{
    private String msg;
    private Object obj;

    public ServiceException(String msg){
        this.msg = msg;
    }

    public ServiceException(String msg, Object obj){
        this.msg = msg;
        this.obj = obj;
    }
}
