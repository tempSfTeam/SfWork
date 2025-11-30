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
 * Web 配置：保留原有 /file/** 的磁盘映射，同时显式映射 /src/** 到 classpath:/static/src/
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.filepath}")
    private String filePath;

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
        // 保留现有的磁盘映射（原样）
        registry.addResourceHandler("/file/filePic/**")
                .addResourceLocations("file:///" + filePath + "/filePic/");
        registry.addResourceHandler("/file/**")
                .addResourceLocations("file:///" + filePath);

        // 明确映射前端模块目录：把 /src/** 映射到 classpath:/static/src/
        // 这会让请求 /cloudClassroom/api/src/main.js 对应到 classpath:/static/src/main.js
        registry.addResourceHandler("/src/**")
                .addResourceLocations("classpath:/static/src/")
                .setCachePeriod(0);
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