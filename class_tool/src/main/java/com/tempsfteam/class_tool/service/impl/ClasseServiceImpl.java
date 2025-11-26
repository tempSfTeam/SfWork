package com.tempsfteam.class_tool.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.tempsfteam.class_tool.bean.Msg;
import com.tempsfteam.class_tool.dto.ClasseDTO;
import com.tempsfteam.class_tool.entity.Classe;
import com.tempsfteam.class_tool.mapper.ClasseMapper;
import com.tempsfteam.class_tool.service.ClasseService;
import org.springframework.stereotype.Service;

/**
 * @author hypocodeemia
 * @description 针对表【form】的数据库操作Service实现
 * @createDate 2024-09-12 17:35:32
 */
@Service
public class ClasseServiceImpl extends ServiceImpl<ClasseMapper, Classe>
        implements ClasseService {

    @Override
    public Msg addClasse(String name, Integer schoolId) {
        Classe form = new Classe(name,schoolId);
        boolean isSaved = this.save(form);
        return isSaved ? Msg.success("添加班级成功",form.getClasseId(),null) : Msg.fail("添加班级失败");
    }

    @Override
    public Msg deleteClasse(Integer formId) {
        return this.removeById(formId) ? Msg.success() : Msg.fail("删除班级失败");
    }

    @Override
    public Msg updateClasseInfo(ClasseDTO classeDTO) {
        return this.updateById(new Classe(classeDTO)) ? Msg.success()
                : Msg.fail("更改班级信息失败");
    }

    @Override
    public Msg listClasseBySchoolId(Integer schoolId) {
        return Msg.success("以下是目标学校的所有班级",this.getBaseMapper().getClasseListBySchoolId(schoolId));
    }

    @Override
    public Msg listClasseByCourseId(Integer courseId) {
        return Msg.success("以下是目标学校的所有班级",this.getBaseMapper().getClasseListByCourseId(courseId));
    }
}





