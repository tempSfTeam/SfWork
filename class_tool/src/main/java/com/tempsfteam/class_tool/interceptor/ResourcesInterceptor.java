package com.tempsfteam.class_tool.interceptor;

import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.core.net.URLDecoder;
import com.tempsfteam.class_tool.service.impl.FileServiceImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.nio.charset.Charset;

/**
 * @author : IMG
 * @create : 2024/9/13
 */
public class ResourcesInterceptor implements HandlerInterceptor {

    private final Logger logger = LoggerFactory.getLogger(ResourcesInterceptor.class);

    @Resource
    private FileServiceImpl fileService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // 获取文件名
        String uri = request.getRequestURI();
        String fileName = uri.substring(uri.lastIndexOf("/") + 1);
        // 解码文件名
        fileName = URLDecoder.decode(fileName, Charset.defaultCharset());
        long userId = StpUtil.getLoginIdAsLong();
        System.out.println(fileService);
        logger.info("fileName: " + fileName);
        return fileService.checkUserPermission(fileName, userId);
    }
}