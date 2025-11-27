package com.tempsfteam.class_tool.config;

import com.tempsfteam.class_tool.interceptor.ResourcesInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * @author : IMG
 * @create : 2024/9/12
 */
@Configuration
public class SaTokenConfigure implements WebMvcConfigurer {

    @Value("${file.pdf}")
    private String pdfPath;

    @Value("${file.video}")
    private String videoPath;

    /**
     * 注册拦截器
     */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // 注册 Sa-Token 拦截器，校验规则为 StpUtil.checkLogin() 登录校验。
//            registry.addInterceptor(new SaInterceptor(handle -> {
//                        SaRouter.match("/test/**", r -> System.out.println("拦截到了路径：" + r));
//            })).addPathPatterns("/test/**");
        registry.addInterceptor(new ResourcesInterceptor())
                .addPathPatterns("/test/**")
                .addPathPatterns("/file/**");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/file/pdf/**")
                .addResourceLocations("file:///" + pdfPath);
        registry.addResourceHandler("/file/video/**")
                .addResourceLocations("file:///" + videoPath);
    }
}

