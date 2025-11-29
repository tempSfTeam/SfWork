package com.tempsfteam.class_tool.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.tempsfteam.class_tool.bean.Msg;
import com.tempsfteam.class_tool.dto.ProfessionDTO;
import com.tempsfteam.class_tool.entity.Profession;
import com.tempsfteam.class_tool.mapper.ProfessionMapper;
import com.tempsfteam.class_tool.service.ProfessionService;
import org.springframework.stereotype.Service;

/**
 * @author hypocodeemia
 * @description 针对表【profession】的数据库操作Service实现
 * @createDate 2024-09-10 14:42:23
 */
@Service
public class ProfessionServiceImpl extends ServiceImpl<ProfessionMapper, Profession>
        implements ProfessionService {

    @Override
    public Msg addProfession(Integer courseTypeId,String name) {
        // 1.检查是否存在相同学校下相同名称的班级
        LambdaQueryWrapper<Profession> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Profession::getCourseTypeId, courseTypeId).eq(Profession::getName, name);
        long count = this.count(queryWrapper);
        if (count > 0) {
            return Msg.fail("该学习对象下已存在同名课程科目，添加失败");
        }
        // 2.进行实际的添加
        Profession profession = new Profession(courseTypeId,name);
        boolean isSaved = this.save(profession);
        return isSaved ? Msg.success("添加课程科目成功",profession.getProfessionId(),null) : Msg.fail("添加课程科目失败");
    }

    @Override
    public Msg deleteProfession(Integer professionId) {
        return this.removeById(professionId) ? Msg.success() : Msg.fail("删除课程科目失败");
    }

    @Override
    public Msg updateProfessionInfo(ProfessionDTO professionDTO) {
        return this.updateById(new Profession(professionDTO)) ? Msg.success()
                : Msg.fail("更改课程科目信息失败");
    }

    @Override
    public Msg listAllProfession() {
        return Msg.success("以下为全部的课程科目",this.list());
    }
}

