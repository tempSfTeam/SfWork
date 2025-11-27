package com.tempsfteam.class_tool.controller;

import com.tempsfteam.class_tool.bean.Msg;
import com.tempsfteam.class_tool.exception.ServiceException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author : IMG
 * @create : 2024/7/19
 */
@RestController
@ControllerAdvice
public class ExceptionController {

    @ExceptionHandler(ServiceException.class)
    public Msg handleServiceException(ServiceException e){
        e.printStackTrace();
        return Msg.fail(e.getMsg());
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public Msg handleHttpMessageNotReadableException(HttpMessageNotReadableException e){
        return Msg.fail("请求参数不完整或有误");
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public Msg handleHttpRequestMethodNotSupportedException(HttpRequestMethodNotSupportedException e) {
        return Msg.fail("请求方式不正确");
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public Msg handleHttpMediaTypeNotSupportedException(HttpMediaTypeNotSupportedException e) {
        return Msg.fail("请求参数类型不正确");
    }

    @ExceptionHandler(Exception.class)
    public Msg handleException(Exception e){
        e.printStackTrace();
        return Msg.fail("服务器异常，请稍后再试!");
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public Msg handleDataIntegrityViolationException(DataIntegrityViolationException ex) {
        if (ex.getMessage().contains("Duplicate entry")) {
            return Msg.fail("数据库中存在重复的唯一值，操作失败。");
        } else {
            return Msg.fail("添加数据时发生未知错误");
        }
    }

}
