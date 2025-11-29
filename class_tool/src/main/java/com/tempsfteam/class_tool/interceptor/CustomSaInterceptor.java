package com.tempsfteam.class_tool.interceptor;

import cn.dev33.satoken.exception.BackResultException;
import cn.dev33.satoken.exception.StopMatchException;
import cn.dev33.satoken.fun.SaParamFunction;
import cn.dev33.satoken.interceptor.SaInterceptor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class CustomSaInterceptor extends SaInterceptor {

    private final Logger errorLogger = LoggerFactory.getLogger("com.rdc.error");

    public CustomSaInterceptor() {
        super();
    }

    public CustomSaInterceptor(SaParamFunction<Object> auth) {
        super(auth);
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 记录请求的基本信息

        try {
            // 调用父类的 preHandle 方法
            return super.preHandle(request, response, handler);
        } catch (StopMatchException e) {
            // 记录日志
            errorLogger.error("StopMatchException: URL: {}, Method: {}, Params: {}, Message: {}",
                    request.getRequestURI(),
                    request.getMethod(),
                    getRequestParams(request),
                    e.getMessage());
            // 继续抛出异常
            throw e;
        } catch (BackResultException e) {
            // 记录日志
            errorLogger.error("BackResultException: URL: {}, Method: {}, Params: {}, Message: {}",
                    request.getRequestURI(),
                    request.getMethod(),
                    getRequestParams(request),
                    e.getMessage());
            if (response.getContentType() == null) {
                response.setContentType("text/plain; charset=utf-8");
            }
            response.getWriter().print(e.getMessage());
            return false;
        } catch (Exception e) {
            // 记录日志
            errorLogger.error("Exception: URL: {}, Method: {}, Params: {}, Message: {}",
                    request.getRequestURI(),
                    request.getMethod(),
                    getRequestParams(request),
                    e.getMessage(),e);
            // 继续抛出异常
            throw e;
        }
    }

    private String getRequestParams(HttpServletRequest request) {
        StringBuilder params = new StringBuilder();
        request.getParameterMap().forEach((key, value) -> {
            for (String val : value) {
                params.append(key).append("=").append(val).append("&");
            }
        });
        return params.length() > 0 ? params.substring(0, params.length() - 1) : "";
    }
}
