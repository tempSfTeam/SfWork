package com.tempsfteam.class_tool.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tempsfteam.class_tool.bean.Msg;
import com.tempsfteam.class_tool.constant.PermissionConst;
import com.tempsfteam.class_tool.dto.ClasseDTO;
import com.tempsfteam.class_tool.entity.Classe;
import com.tempsfteam.class_tool.service.ClasseService;
import com.tempsfteam.class_tool.util.DTOUtils;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;

/**
 * @author hypocodeemia
 */
@RestController
@RequestMapping("/classe")

public class ClasseController {
    @Resource
    private ClasseService classeService;

    @PostMapping("/add")
    @SaCheckPermission(PermissionConst.CLASSE_ADD)
    public Msg add(@RequestBody ClasseDTO classeDTO){
        DTOUtils.checkInclude(
                classeDTO,
                ClasseDTO::getName,
                ClasseDTO::getSchoolId,
                ClasseDTO::getGrade
        );
        return classeService.addClasse(classeDTO.getName(), classeDTO.getSchoolId(),classeDTO.getGrade());
    }

    @PostMapping("/delete")
    @SaCheckPermission(PermissionConst.CLASSE_DELETE)
    public Msg delete(@RequestBody ClasseDTO classeDTO){
        DTOUtils.checkInclude(
                classeDTO,
                ClasseDTO::getClasseId
        );
        return classeService.deleteClasse(classeDTO.getClasseId());
    }

    @PostMapping("/update")
    @SaCheckPermission(PermissionConst.CLASSE_UPDATE)
    public Msg update(@RequestBody ClasseDTO classeDTO){
        DTOUtils.checkInclude(
                classeDTO,
                ClasseDTO::getClasseId,
                ClasseDTO::getName,
                ClasseDTO::getSchoolId,
                ClasseDTO::getGrade
        );
        return classeService.updateClasseInfo(classeDTO);
    }

    @GetMapping("/listAllBySchoolId")
    @SaCheckPermission(PermissionConst.CLASSE_QUERY)
    public Msg listAllBySchoolId(Page<Classe> pageDTO, @RequestParam("searchStr")String searchStr, @RequestParam("schoolId")Integer schoolId, @RequestParam(value = "grade",required = false)String grade){
        DTOUtils.checkInclude(
                pageDTO,
                Page::getCurrent,
                Page::getSize
        );
        if(schoolId == null){
            return Msg.fail("参数错误或缺失");
        }
        return classeService.listClasseBySchoolId(pageDTO,searchStr,schoolId,grade);
    }

}
