package com.tempsfteam.class_tool.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.tempsfteam.class_tool.bean.Msg;
import com.tempsfteam.class_tool.constant.msg.MsgCode;
import com.tempsfteam.class_tool.entity.File;
import com.tempsfteam.class_tool.service.ExperimentService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;
import java.util.List;

/**
 * @author : IMG
 * @create : 2024/9/14
 */
@RestController
@RequestMapping("/experiment")
public class ExperimentController {

    @Resource
    private ExperimentService experimentService;

    @GetMapping("/getFiles")
    public Msg get(@RequestParam("experimentId") Integer experimentId, @RequestParam("resourceType") Integer resourceType) {
        long userId = StpUtil.getLoginIdAsLong();
        if (!experimentService.checkUserPermission(experimentId, userId)) {
            return Msg.notPermitted(MsgCode.FORBIDDEN.getMessage());
        }
        List<File> fileList = experimentService.getExperimentFile(experimentId, resourceType);
        return Msg.success().setData(fileList);
    }
}