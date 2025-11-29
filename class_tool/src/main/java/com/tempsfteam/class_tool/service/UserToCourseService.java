package com.tempsfteam.class_tool.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.tempsfteam.class_tool.entity.UserToCourse;

import java.util.List;

/**
 * @author hypocodeemia
 * @description 针对表【user_to_course】的数据库操作Service
 * @createDate 2024-09-10 14:42:24
 */
public interface UserToCourseService extends IService<UserToCourse> {
    /**
     * 根据课程id删除用户与课程的关联
     * @param courseId
     * @return
     */
    public boolean deleteUserToCourseByCourseId(Integer courseId);
    public int customSaveBatch(List<UserToCourse> userToCourseList);
}
