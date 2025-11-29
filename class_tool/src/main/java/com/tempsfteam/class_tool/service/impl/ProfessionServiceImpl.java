package com.tempsfteam.class_tool.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.tempsfteam.class_tool.bean.Msg;
import com.tempsfteam.class_tool.bean.UserData;
import com.tempsfteam.class_tool.dto.ProfessionDTO;
import com.tempsfteam.class_tool.dto.SortDTO;
import com.tempsfteam.class_tool.entity.Profession;
import com.tempsfteam.class_tool.mapper.CourseToProfessionMapper;
import com.tempsfteam.class_tool.mapper.ProfessionMapper;
import com.tempsfteam.class_tool.service.ProfessionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.util.List;

import static com.tempsfteam.class_tool.constant.PermissionConst.COURSE_ADMIN_QUERY;
import static com.tempsfteam.class_tool.constant.PermissionConst.COURSE_COURSE_MANAGER_QUERY;

/**
 * @author hypocodeemia
 * @description 针对表【profession】的数据库操作Service实现
 * @createDate 2024-09-10 14:42:23
 */
@Service
public class ProfessionServiceImpl extends ServiceImpl<ProfessionMapper, Profession>
        implements ProfessionService {

    @Resource
    CourseToProfessionMapper courseToProfessionMapper;

    @Override
    @Transactional
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
        this.save(profession);
        profession.setSort(profession.getProfessionId());
        boolean isSaved = this.updateById(profession);
        return isSaved ? Msg.success("添加课程科目成功",profession.getProfessionId(),null) : Msg.fail("添加课程科目失败");
    }

    @Override
    public Msg deleteProfession(Integer professionId) {
        if(this.getBaseMapper().checkAnyCourse(professionId)){
            return Msg.fail("请先清空该课程科目下的课程(断开联系)，再删除该课程科目");
        }
        // 1.尝试删除课程和课程科目中间表中的数据（成功与否的判断留给@Transactional）
        courseToProfessionMapper.deleteByProfessionId(professionId);
        // 2.删除课程科目
        return this.removeById(professionId) ? Msg.success() : Msg.fail("删除课程科目失败");
    }

    @Override
    public Msg updateProfessionInfo(ProfessionDTO professionDTO) {
        UpdateWrapper<Profession> updateWrapper = new UpdateWrapper<>();
        updateWrapper.eq("profession_id", professionDTO.getProfessionId()).set("course_type_id", professionDTO.getCourseTypeId()).set("name", professionDTO.getName());
        return this.getBaseMapper().update(new Profession(), updateWrapper)>0 ? Msg.success()
                : Msg.fail("更改课程科目信息失败");
    }

    @Override
    @Transactional
    public Msg updateSort(SortDTO sortDTO) {
        // 判断目标 ID 是否存在
        Profession existingProfession = this.getBaseMapper().selectById(sortDTO.getTargetId());
        if (existingProfession == null) {
            return Msg.fail("目标不存在");
        }

        // 1.先将排序值大于等于新排序值的记录排序值加 1
        LambdaUpdateWrapper<Profession> updateWrapper = new LambdaUpdateWrapper<>();
        // 使用 lambda 表达式构建条件，选择排序值小于等于新排序值的记录
        updateWrapper.ge(Profession::getSort, sortDTO.getNewSort());
        // 设置 SQL 语句，将这些记录的排序值加 1
        updateWrapper.setSql("sort = sort + 1");
        // 执行更新操作
        this.getBaseMapper().update(null, updateWrapper);

        // 2.更新目标 course_type 的排序值
        Profession professionToUpdateToUpdate = new Profession();
        // 设置目标记录的新排序值
        professionToUpdateToUpdate.setSort(sortDTO.getNewSort());
        LambdaUpdateWrapper<Profession> targetUpdateWrapper = new LambdaUpdateWrapper<>();
        // 使用 lambda 表达式构建条件，选择要更新的目标记录，即 ID 为 professionId 的记录
        targetUpdateWrapper.eq(Profession::getProfessionId, sortDTO.getTargetId());
        // 执行更新操作
        this.getBaseMapper().update(professionToUpdateToUpdate, targetUpdateWrapper);

        return Msg.success();
    }

    @Override
    public Msg listAllProfession() {
        return Msg.success("以下为全部的课程科目",this.list());
    }

    @Override
    public Msg listByCourseTypeId(Integer courseTypeId) {
        return Msg.success("以下为属于学习对象id: "+courseTypeId+" 的课程科目",this.getBaseMapper().getProfessionListByCourseTypeId(courseTypeId));
    }

    @Override
    public Msg listPreferenceByCourseTypeId(Integer courseTypeId, UserData userData) {
        List<Profession> professions;

        // 要根据用户的权限去决定呈现什么学习对象
        if(StpUtil.hasPermission(COURSE_ADMIN_QUERY)){
            // 如果有COURSE_ADMIN_QUERY,给全部
            Msg msg1 = this.listByCourseTypeId(courseTypeId);;
            professions = (List<Profession>) msg1.getData();
        }else if(StpUtil.hasPermission(COURSE_COURSE_MANAGER_QUERY)){
            // 如果只有COURSE_COURSE_MANAGER_QUERY,根据管理的课程去给
            professions = this.getBaseMapper().getProfessionForCourseManager(userData.getUserId(), courseTypeId);
        }else {
            // 如果两种权限都没有，那就按照user_to_course去呈现,只看user_to_course的权限去查对应course，然后找对应的profession
            professions = this.getBaseMapper().getProfessionPreferenceByCourseTypeId(userData.getUserId(),courseTypeId);
        }

        return Msg.success("课程科目",professions);
    }

}
