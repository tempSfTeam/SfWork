package com.tempsfteam.class_tool.interceptor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * @author : IMG
 * @create : 2024/9/13
 */
@Component
public class ResourcesInterceptor implements HandlerInterceptor {

    private final Logger logger = LoggerFactory.getLogger(ResourcesInterceptor.class);

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // 获取路径变量
//        Map<String, String> pathVars = (Map<String, String>) request.getAttribute(HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE);
//        String pdfId = pathVars.get("pdfId");
//        logger.info("pdfId: " + pdfId);
//        logger.info("videoId: " + pathVars.get("videoId"));
        // 获取文件名
        String uri = request.getRequestURI();
        String fileName = uri.substring(uri.lastIndexOf("/") + 1);
        logger.info("fileName: " + fileName);
        return true;
    }
}