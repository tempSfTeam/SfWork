package com.tempsfteam.class_tool;

import com.tempsfteam.class_tool.constant.PermissionConst;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

import java.util.TimeZone;

@SpringBootApplication
@EnableWebMvc
@EnableTransactionManagement
public class ClassToolApplication {

    public static void main(String[] args) {
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Shanghai"));
        SpringApplication.run(ClassToolApplication.class, args);
        System.out.println(PermissionConst.MODULE);
    }

}
