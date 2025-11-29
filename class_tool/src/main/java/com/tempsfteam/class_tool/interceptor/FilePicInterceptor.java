package com.tempsfteam.class_tool.interceptor;

import cn.dev33.satoken.stp.StpUtil;
import com.tempsfteam.class_tool.constant.role.Role;
import com.tempsfteam.class_tool.service.FileService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * @author : IMG
 * @create : 2024/10/10
 */
public class FilePicInterceptor implements HandlerInterceptor {

    @Value("${file.networkPath}")
    private String networkPath;

    @Resource
    private FileService fileService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (StpUtil.hasRole(Role.OPERATIONS_STRING)) {
            return true;
        }
        // 获取拦截器拦截路径后的路径
        String uri = request.getRequestURI();
        // 获取uri中networkPath后的路径
        String webPath = networkPath + "filePic/";
        String path = uri.substring(uri.indexOf(webPath) + webPath.length());
        String[] strings = path.split("/");
        // 获取文件名
        String fileName = strings[0];
        long userId;
        try {
            userId = StpUtil.getLoginIdAsLong();
        }catch (Exception e){
            return false;
        }

        // 鉴权
        return fileService.checkUserPermission(fileName, userId);
    }
}
