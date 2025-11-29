package com.tempsfteam.class_tool.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.tempsfteam.class_tool.bean.Msg;
import com.tempsfteam.class_tool.bean.UserData;
import com.tempsfteam.class_tool.dto.CourseTypeDTO;
import com.tempsfteam.class_tool.dto.SortDTO;
import com.tempsfteam.class_tool.entity.CourseType;

/**
 * @author hypocodeemia
 * @description 针对表【course_type】的数据库操作Service
 * @createDate 2024-09-10 14:42:23
 */
public interface CourseTypeService extends IService<CourseType> {
    /**
     * 添加学习对象
     * @param name      学习对象名字
     * @return          Msg
     */
    Msg addCourseType(String name);

    /**
     * 删除学习对象
     * @param courseTypeId  学习对象id
     * @return               Msg
     */
    Msg deleteCourseType(Integer courseTypeId);

    /**
     * 更新学习对象基础信息(不包含sort)
     * @param courseTypeDTO courseTypeDTO
     * @return              Msg
     */
    Msg updateCourseTypeInfo(CourseTypeDTO courseTypeDTO);

    /**
     * 更新sort
     * @param sortDTO   sortDTO
     * @return          Msg
     */
    Msg updateSort(SortDTO sortDTO);

    /**
     * 获取全部学习对象
     * @return          Msg
     */
    Msg listAllCourseType();

    /**
     * 结合用户的权限permission以及被授予的课程去获取学习对象
     * @return          Msg
     */
    Msg listPreferenceCourseType(UserData userData);
}
