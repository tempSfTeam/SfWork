package com.tempsfteam.class_tool.controller;

import com.tempsfteam.class_tool.bean.Msg;
import com.tempsfteam.class_tool.dto.ProfessionDTO;
import com.tempsfteam.class_tool.service.ProfessionService;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;

/**
 * @author hypocodeemia
 */
@RestController
@RequestMapping("profession")
public class ProfessionController {
    @Resource
    private ProfessionService professionService;

    @PostMapping("add")
    public Msg add(@RequestBody ProfessionDTO professionDTO){
        return professionService.addProfession(professionDTO.getCourseTypeId(), professionDTO.getName());
    }

    @PostMapping("delete")
    public Msg delete(@RequestBody ProfessionDTO professionDTO){
        return professionService.deleteProfession(professionDTO.getProfessionId());
    }

    @PostMapping("update")
    public Msg update(@RequestBody ProfessionDTO professionDTO){
        return professionService.updateProfessionInfo(professionDTO);
    }

    @GetMapping("listAll")
    public Msg listAll(){
        return professionService.listAllProfession();
    }

}

