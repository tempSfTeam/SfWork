package com.tempsfteam.class_tool.controller;

import com.tempsfteam.class_tool.bean.Msg;
import com.tempsfteam.class_tool.dto.ClasseDTO;
import com.tempsfteam.class_tool.service.ClasseService;
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
    public Msg add(@RequestBody ClasseDTO classeDTO){
        return classeService.addClasse(classeDTO.getName(), classeDTO.getSchoolId());
    }

    @PostMapping("/delete")
    public Msg delete(@RequestBody ClasseDTO classeDTO){
        return classeService.deleteClasse(classeDTO.getClasseId());
    }

    @PostMapping("/update")
    public Msg update(@RequestBody ClasseDTO classeDTO){
        return classeService.updateClasseInfo(classeDTO);
    }

    @GetMapping("/listAllBySchoolId")
    public Msg listAllBySchoolId(@RequestParam("schoolId")Integer schoolId){
        return classeService.listClasseBySchoolId(schoolId);
    }

    @GetMapping("/listAllByCourseId")
    public Msg listAllByCourseId(@RequestParam("courseId")Integer courseId){
        return classeService.listClasseByCourseId(courseId);
    }

}
