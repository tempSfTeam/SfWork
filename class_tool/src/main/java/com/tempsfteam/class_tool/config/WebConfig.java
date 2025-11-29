package com.tempsfteam.class_tool.config;

import com.tempsfteam.class_tool.interceptor.FilePicInterceptor;
import com.tempsfteam.class_tool.interceptor.ResourcesInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * @author : IMG
 * @create : 2024/9/14
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.filepath}")
    private String filePath;

    /**
     * 注册拦截器
     */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(resourcesInterceptor())
                .addPathPatterns("/test/**")
                .addPathPatterns("/file/pdf/**")
                .addPathPatterns("/file/video/**")
                .addPathPatterns("/file/word/**")
                .addPathPatterns("/file/ppt/**")
                .excludePathPatterns("/file/filePic/**");

        registry.addInterceptor(filePicInterceptor())
                .addPathPatterns("/file/filePic/**");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/file/filePic/**")
                .addResourceLocations("file:///" + filePath + "/filePic/");
        registry.addResourceHandler("/file/**")
                .addResourceLocations("file:///" + filePath);
    }

    @Bean
    public ResourcesInterceptor resourcesInterceptor() {
        return new ResourcesInterceptor();
    }

    @Bean
    public FilePicInterceptor filePicInterceptor() {
        return new FilePicInterceptor();
    }
}
