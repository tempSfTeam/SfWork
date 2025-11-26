package com.tempsfteam.class_tool.controller;

import com.tempsfteam.class_tool.service.UserService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;
import java.io.IOException;

@RestController
@RequestMapping("user")

public class UserController {
    @Resource
    UserService userService;

    @PostMapping("login")
    public String login() throws IOException {
        return "login";
    }

}