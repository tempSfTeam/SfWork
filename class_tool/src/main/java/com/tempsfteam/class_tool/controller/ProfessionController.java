package com.tempsfteam.class_tool.controller;

import cn.dev33.satoken.annotation.SaCheckLogin;
import cn.dev33.satoken.annotation.SaCheckPermission;
import cn.dev33.satoken.stp.StpUtil;
import com.tempsfteam.class_tool.bean.Msg;
import com.tempsfteam.class_tool.bean.UserData;
import com.tempsfteam.class_tool.constant.PermissionConst;
import com.tempsfteam.class_tool.dto.ProfessionDTO;
import com.tempsfteam.class_tool.dto.SortDTO;
import com.tempsfteam.class_tool.service.ProfessionService;
import com.tempsfteam.class_tool.util.DTOUtils;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;

/**
 * @author hypocodeemia
 */
@RestController
@RequestMapping("/profession")

public class ProfessionController {
    @Resource
    private ProfessionService professionService;

    @PostMapping("/add")
    @SaCheckPermission(PermissionConst.PROFESSION_ADD)
    public Msg add(@RequestBody ProfessionDTO professionDTO){
        DTOUtils.checkInclude(
                professionDTO,
                ProfessionDTO::getCourseTypeId,
                ProfessionDTO::getName
        );
        return professionService.addProfession(professionDTO.getCourseTypeId(), professionDTO.getName());
    }

    @PostMapping("/delete")
    @SaCheckPermission(PermissionConst.PROFESSION_DELETE)
    public Msg delete(@RequestBody ProfessionDTO professionDTO){
        DTOUtils.checkInclude(
                professionDTO,
                ProfessionDTO::getProfessionId
        );
        return professionService.deleteProfession(professionDTO.getProfessionId());
    }

    @PostMapping("/update")
    @SaCheckPermission(PermissionConst.PROFESSION_UPDATE)
    public Msg update(@RequestBody ProfessionDTO professionDTO){
        DTOUtils.checkInclude(
                professionDTO,
                ProfessionDTO::getProfessionId,
                ProfessionDTO::getCourseTypeId,
                ProfessionDTO::getName
        );
        return professionService.updateProfessionInfo(professionDTO);
    }

    @PostMapping("/updateSort")
    @SaCheckPermission(PermissionConst.PROFESSION_UPDATE)
    public Msg updateSort(@RequestBody SortDTO sortDTO){
        DTOUtils.checkInclude(
                sortDTO,
                SortDTO::getTargetId,
                SortDTO::getNewSort
        );
        return professionService.updateSort(sortDTO);
    }

    @GetMapping("/listAll")
    @SaCheckLogin
    public Msg listAll(){
        return professionService.listAllProfession();
    }

    @GetMapping("/listByCourseTypeId")
    @SaCheckLogin
    public Msg listByCourseTypeId(@RequestParam("courseTypeId") Integer courseTypeId){
        if(courseTypeId == null || courseTypeId <= 0){
            return Msg.fail("参数异常");
        }
        return professionService.listByCourseTypeId(courseTypeId);
    }

    @GetMapping("/listPreference")
    @SaCheckLogin
    public Msg listPreference(@RequestParam("courseTypeId") Integer courseTypeId){
        UserData userData = (UserData) StpUtil.getSession().get("userData");
        return professionService.listPreferenceByCourseTypeId(courseTypeId,userData);
    }

}
