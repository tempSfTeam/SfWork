package com.tempsfteam.class_tool.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.tempsfteam.class_tool.bean.Msg;
import com.tempsfteam.class_tool.dto.ClassDTO;

/**
 * @author 21983
 * @description 针对表【class】的数据库操作Service
 * @createDate 2024-09-10 14:42:23
 */
public interface ClassService extends IService<Class> {
    /**
     * 添加班级
     * @param name      班级名字
     * @param schoolId  归属的学校的id
     * @return          Msg
     */
    Msg addClass(String name, Integer schoolId);

    /**
     * 删除班级
     * @param classId   班级id
     * @return          Msg
     */
    Msg deleteClass(Integer classId);

    /**
     * 更新班级基础信息
     * @param classDTO  classDTO
     * @return          Msg
     */
    Msg updateClassInfo(ClassDTO classDTO);

    /**
     * 获取某学校的全部班级
     * @param schoolId  学校id
     * @return          Msg
     */
    Msg listClassBySchoolId(Integer schoolId);

    /**
     * 获取某课程的全部班级
     * @param courseId  课程id
     * @return          Msg
     */
    Msg listClassByCourseId(Integer courseId);
}

