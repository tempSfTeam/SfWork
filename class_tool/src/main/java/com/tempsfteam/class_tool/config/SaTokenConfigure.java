package com.tempsfteam.class_tool.config;

import com.tempsfteam.class_tool.interceptor.ResourcesInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * @author : IMG
 * @create : 2024/9/12
 */
@Configuration
public class SaTokenConfigure implements WebMvcConfigurer {

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
                .addPathPatterns("/test/**");
    }
}
