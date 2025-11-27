package com.tempsfteam.class_tool.interceptor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.HandlerMapping;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Map;

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
        Map<String, String> pathVars = (Map<String, String>) request.getAttribute(HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE);
        String pdfId = pathVars.get("pdfId");
        logger.info("pdfId: " + pdfId);
        logger.info("videoId: " + pathVars.get("videoId"));
        return true;
    }
}