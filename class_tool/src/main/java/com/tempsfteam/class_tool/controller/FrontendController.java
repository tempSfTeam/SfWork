package com.tempsfteam.class_tool.controller;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import java.io.IOException;

/**
 * 简单的 FrontendController：把 SPA 的根路径等请求转发/返回 static/index.html
 * 放在 com.tempsfteam.class_tool.controller 包下，编译后重启应用。
 */
@Controller
public class FrontendController {

    // 直接返回 classpath:/static/index.html 的内容
    @GetMapping(value = {"/", "/index.html", "/#", "/#/login", "/login"})
    public ResponseEntity<Resource> index() throws IOException {
        ClassPathResource resource = new ClassPathResource("static/index.html");
        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(resource);
    }
}