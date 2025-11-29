package com.tempsfteam.class_tool.interceptor;

import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.core.net.URLDecoder;
import com.tempsfteam.class_tool.constant.RedisConst;
import com.tempsfteam.class_tool.constant.role.Role;
import com.tempsfteam.class_tool.service.impl.FileServiceImpl;
import com.tempsfteam.class_tool.util.FileUtil;
import com.tempsfteam.class_tool.util.RedisUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    @Resource
    private RedisUtil redisUtil;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // 获取文件名
        String uri = request.getRequestURI();
        String fileName = uri.substring(uri.lastIndexOf("/") + 1);
        // 解码文件名
        fileName = URLDecoder.decode(fileName, Charset.defaultCharset());
        // 管理员有全部权限
        if(StpUtil.hasRole(Role.OPERATIONS_STRING)){
            return true;
        }
        long userId;
        try{
            userId = StpUtil.getLoginIdAsLong();
        }catch (Exception e){
            return false;
        }

        // 获取无拓展名的文件名
        String fileNameNoExt = FileUtil.getFileNameNoExt(fileName);
        if (fileService.checkUserPermission(fileNameNoExt, userId)) {
            // 获取文件后缀名
            String suffix = fileName.substring(fileName.lastIndexOf(".") + 1);
            // 根据后缀名判断文件类型
            if ("mp4".equals(suffix)){
                // 判断获取视频是不是从零开始
                String range = request.getHeader("Range");
                if (range == null || range.startsWith("bytes=0-")){
                    // 增加访问次数
                    redisUtil.hashIncrement(RedisConst.FILE_CLICK_COUNT_KEY, fileName);
                }
            }else {
                // 增加访问次数
                // redisUtil.hashIncrement(RedisConst.FILE_CLICK_COUNT_KEY, fileName);
            }
            return true;
        }else {
            return false;
        }
    }
}