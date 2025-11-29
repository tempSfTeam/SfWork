package com.tempsfteam.class_tool.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.tempsfteam.class_tool.bean.Msg;
import com.tempsfteam.class_tool.bean.UserData;
import com.tempsfteam.class_tool.dto.CourseTypeDTO;
import com.tempsfteam.class_tool.dto.SortDTO;
import com.tempsfteam.class_tool.entity.CourseType;
import com.tempsfteam.class_tool.mapper.CourseTypeMapper;
import com.tempsfteam.class_tool.service.CourseTypeService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static com.tempsfteam.class_tool.constant.PermissionConst.COURSE_ADMIN_QUERY;
import static com.tempsfteam.class_tool.constant.PermissionConst.COURSE_COURSE_MANAGER_QUERY;

/**
 * @author hypocodeemia
 * @description 针对表【course_type】的数据库操作Service实现
 * @createDate 2024-09-10 14:42:23
 */
@Service
public class CourseTypeServiceImpl extends ServiceImpl<CourseTypeMapper, CourseType>
        implements CourseTypeService {

    @Override
    @Transactional
    public Msg addCourseType(String name) {
        CourseType courseType = new CourseType(name);
        this.save(courseType);
        courseType.setSort(courseType.getCourseTypeId());
        boolean isSaved = this.updateById(courseType);
        return isSaved ? Msg.success("添加学习对象成功",courseType.getCourseTypeId(),null) : Msg.fail("添加学习对象失败");
    }

    @Override
    public Msg deleteCourseType(Integer courseTypeId) {
        if(this.getBaseMapper().checkAnyProfession(courseTypeId)){
            return Msg.fail("请先清空该学习对象下的课程科目，再删除该学习对象");
        }
        return this.removeById(courseTypeId) ? Msg.success() : Msg.fail("删除学习对象失败");
    }

    @Override
    public Msg updateCourseTypeInfo(CourseTypeDTO courseTypeDTO) {
        UpdateWrapper<CourseType> updateWrapper = new UpdateWrapper<>();
        updateWrapper.eq("course_type_id", courseTypeDTO.getCourseTypeId()).set("name", courseTypeDTO.getName());
        return this.getBaseMapper().update(new CourseType(), updateWrapper)>0 ? Msg.success()
                : Msg.fail("更改学习对象信息失败");
    }

    @Override
    @Transactional
    public Msg updateSort(SortDTO sortDTO) {
        // 判断目标 ID 是否存在
        CourseType existingCourseType = this.getBaseMapper().selectById(sortDTO.getTargetId());
        if (existingCourseType == null) {
            return Msg.fail("目标不存在");
        }

        // 1.先将排序值大于等于新排序值的记录排序值加 1
        LambdaUpdateWrapper<CourseType> updateWrapper = new LambdaUpdateWrapper<>();
        // 使用 lambda 表达式构建条件，选择排序值小于等于新排序值的记录
        updateWrapper.ge(CourseType::getSort, sortDTO.getNewSort());
        // 设置 SQL 语句，将这些记录的排序值加 1
        updateWrapper.setSql("sort = sort + 1");
        // 执行更新操作
        this.getBaseMapper().update(null, updateWrapper);

        // 2.更新目标 course_type 的排序值
        CourseType courseTypeToUpdate = new CourseType();
        // 设置目标记录的新排序值
        courseTypeToUpdate.setSort(sortDTO.getNewSort());
        LambdaUpdateWrapper<CourseType> targetUpdateWrapper = new LambdaUpdateWrapper<>();
        // 使用 lambda 表达式构建条件，选择要更新的目标记录，即 ID 为 courseTypeId 的记录
        targetUpdateWrapper.eq(CourseType::getCourseTypeId, sortDTO.getTargetId());
        // 执行更新操作
        this.getBaseMapper().update(courseTypeToUpdate, targetUpdateWrapper);

        return Msg.success();
    }

    @Override
    public Msg listAllCourseType() {
        return Msg.success("以下为全部的学习对象",this.list());
    }

    @Override
    public Msg listPreferenceCourseType(UserData userData) {
        List<CourseType> courseTypes;

        // 要根据用户的权限去决定呈现什么学习对象
        if(StpUtil.hasPermission(COURSE_ADMIN_QUERY)){
            // 如果有COURSE_ADMIN_QUERY,给全部
            Msg msg1 = this.listAllCourseType();
            courseTypes = (List<CourseType>) msg1.getData();
        }else if(StpUtil.hasPermission(COURSE_COURSE_MANAGER_QUERY)){
            // 如果只有COURSE_COURSE_MANAGER_QUERY,根据管理的课程去给学习对象
            List<Integer> courseTypeForCourseManager = this.getBaseMapper().getCourseTypeForCourseManager(userData.getUserId());
            courseTypes = this.listByIds(courseTypeForCourseManager);
        }else {
            // 如果两种权限都没有，那就按照user_to_course去呈现,只看user_to_course的权限去查对应course，然后找对应的courseType
            List<Integer> courseTypePreference = this.getBaseMapper().getCourseTypePreference(userData.getUserId());
            courseTypes = this.listByIds(courseTypePreference);
        }

        return Msg.success("学习对象",courseTypes);
    }

}
