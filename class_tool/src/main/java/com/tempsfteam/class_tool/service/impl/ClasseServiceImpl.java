package com.tempsfteam.class_tool.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
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
        // 1.检查是否存在相同学校下相同名称的班级
        LambdaQueryWrapper<Classe> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Classe::getSchoolId, schoolId).eq(Classe::getName, name);
        long count = this.count(queryWrapper);
        if (count > 0) {
            return Msg.fail("该学校下已存在同名班级，添加班级失败");
        }
        // 2.进行实际的添加
        Classe form = new Classe(name,schoolId);
        boolean isSaved = this.save(form);
        return isSaved ? Msg.success("添加班级成功",form.getClasseId(),null) : Msg.fail("添加班级失败");
    }

    @Override
    public Msg deleteClasse(Integer classeId) {
        return this.removeById(classeId) ? Msg.success() : Msg.fail("删除班级失败");
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
        return Msg.success("以下是目标课程的所有班级",this.getBaseMapper().getClasseListByCourseId(courseId));
    }
}





