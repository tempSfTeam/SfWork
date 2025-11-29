package com.tempsfteam.class_tool.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tempsfteam.class_tool.bean.Msg;
import com.tempsfteam.class_tool.constant.PermissionConst;
import com.tempsfteam.class_tool.dto.SchoolDTO;
import com.tempsfteam.class_tool.entity.School;
import com.tempsfteam.class_tool.service.SchoolService;
import com.tempsfteam.class_tool.util.DTOUtils;
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
    @SaCheckPermission(PermissionConst.SCHOOL_ADD)
    public Msg add(@RequestBody SchoolDTO schoolDTO){
        DTOUtils.checkInclude(
                schoolDTO,
                SchoolDTO::getName
        );
        return schoolService.addSchool(schoolDTO.getName());
    }

    @PostMapping("/delete")
    @SaCheckPermission(PermissionConst.SCHOOL_DELETE)
    public Msg delete(@RequestBody SchoolDTO schoolDTO){
        DTOUtils.checkInclude(
                schoolDTO,
                SchoolDTO::getSchoolId
        );
        return schoolService.deleteSchool(schoolDTO.getSchoolId());
    }

    @PostMapping("/update")
    @SaCheckPermission(PermissionConst.SCHOOL_UPDATE)
    public Msg update(@RequestBody SchoolDTO schoolDTO){
        DTOUtils.checkInclude(
                schoolDTO,
                SchoolDTO::getSchoolId,
                SchoolDTO::getName
        );
        return schoolService.updateSchoolInfo(schoolDTO);
    }

    @GetMapping("/listAll")
    @SaCheckPermission(PermissionConst.SCHOOL_QUERY)
    public Msg listAll(Page<School> pageDTO, @RequestParam("searchStr")String searchStr){
        DTOUtils.checkInclude(
                pageDTO,
                Page::getCurrent,
                Page::getSize
        );
        return schoolService.listAllSchool(pageDTO,searchStr);
    }

}