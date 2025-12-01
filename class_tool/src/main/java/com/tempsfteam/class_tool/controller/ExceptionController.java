package com.tempsfteam.class_tool.controller;

import cn.dev33.satoken.exception.NotLoginException;
import cn.dev33.satoken.exception.NotPermissionException;
import cn.dev33.satoken.exception.NotRoleException;
import com.tempsfteam.class_tool.bean.Msg;
import com.tempsfteam.class_tool.exception.ServiceException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.List;

/**
 * @author : IMG
 * @create : 2024/7/19
 */
@RestController
@ControllerAdvice
public class ExceptionController {

    @ExceptionHandler(ServiceException.class)
    public Msg handleServiceException(ServiceException e){
        //e.printStackTrace();
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

    @ExceptionHandler({MethodArgumentNotValidException.class})
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Msg paramExceptionHandler(MethodArgumentNotValidException e) {
        BindingResult exceptions = e.getBindingResult();
        // 判断异常中是否有错误信息，如果存在就使用异常中的消息，否则使用默认消息
        if (exceptions.hasErrors()) {
            List<ObjectError> errors = exceptions.getAllErrors();
            if (!errors.isEmpty()) {
                // 这里列出了全部错误参数，按正常逻辑，只需要第一条错误即可
                FieldError fieldError = (FieldError) errors.get(0);
                return Msg.fail(fieldError.getDefaultMessage());
            }
        }
        return Msg.fail("请求参数不完整或有误");
    }

    @ExceptionHandler({NotLoginException.class})
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public Msg notLoginExceptionExceptionHandler(NotLoginException e) {
        return Msg.notLogin(e.getMessage());
    }

    @ExceptionHandler({NotRoleException.class})
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Msg notRoleExceptionExceptionHandler(NotRoleException e) {
        return Msg.notPermitted("您没有权限进行此操作");
    }

    @ExceptionHandler({NotPermissionException.class})
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public Msg notPermissionExceptionHandler(NotPermissionException e) {
        return Msg.notPermitted("您没有权限进行此操作");
    }
    @ExceptionHandler({MethodArgumentTypeMismatchException.class})
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public Msg methodArgumentTypeMismatchException(MethodArgumentTypeMismatchException e) {
        return Msg.fail("参数转换错误");
    }

}
