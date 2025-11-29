package com.tempsfteam.class_tool.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.tempsfteam.class_tool.bean.Msg;
import com.tempsfteam.class_tool.entity.CourseToProfession;

/**
 * @author hypocodeemia
 * @description 针对表【course_to_profession】的数据库操作Service
 * @createDate 2024-09-10 14:42:23
 */
public interface CourseToProfessionService extends IService<CourseToProfession> {
    /**
     * 添加课程和课程科目之间的关联
     * @param courseId      课程id
     * @param professionId  课程科目id
     * @return              Msg
     */
    Msg connectProfession(Integer courseId, Integer professionId);

    /**
     * 删除课程和课程科目之间的关联
     * @param courseId      课程id
     * @param professionId  课程科目id
     * @return              Msg
     */
    Msg disconnectProfession(Integer courseId, Integer professionId);


    /**
     * 删除某个课程 和 课程科目的关联记录
     * @param courseId  课程id
     */
    void deleteByCourseId(Integer courseId);
}
