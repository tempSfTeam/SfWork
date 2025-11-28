package com.tempsfteam.class_tool.controller;

import com.tempsfteam.class_tool.bean.Msg;
import com.tempsfteam.class_tool.dto.SchoolDTO;
import com.tempsfteam.class_tool.service.SchoolService;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;

/**
 * @author hypocodeemia
 */
@RestController
@RequestMapping("/school")

public class SchoolController {
    @Resource
    private SchoolService schoolService;

    @PostMapping("/add")
    public Msg add(@RequestBody SchoolDTO schoolDTO){
        return schoolService.addSchool(schoolDTO.getName());
    }

    @PostMapping("/delete")
    public Msg delete(@RequestBody SchoolDTO schoolDTO){
        return schoolService.deleteSchool(schoolDTO.getSchoolId());
    }

    @PostMapping("/update")
    public Msg update(@RequestBody SchoolDTO schoolDTO){
        return schoolService.updateSchoolInfo(schoolDTO);
    }

    @GetMapping("/listAll")
    public Msg listAll(){
        return schoolService.listAllSchool();
    }

}