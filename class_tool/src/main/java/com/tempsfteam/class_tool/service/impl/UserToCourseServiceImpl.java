package com.tempsfteam.class_tool.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.tempsfteam.class_tool.entity.UserToCourse;
import com.tempsfteam.class_tool.mapper.UserToCourseMapper;
import com.tempsfteam.class_tool.service.UserToCourseService;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;

/**
 * @author hypocodeemia
 * @description 针对表【user_to_course】的数据库操作Service实现
 * @createDate 2024-09-10 14:42:24
 */
@Service
public class UserToCourseServiceImpl extends ServiceImpl<UserToCourseMapper, UserToCourse>
        implements UserToCourseService {
    @Resource
    private UserToCourseMapper userToCourseMapper;

    @Override
    public boolean deleteUserToCourseByCourseId(Integer courseId) {
        LambdaQueryWrapper<UserToCourse> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserToCourse::getCourseId, courseId);
        return userToCourseMapper.delete(wrapper) > 0;
    }

    @Override
    public int customSaveBatch(List<UserToCourse> userToCourseList) {
        return userToCourseMapper.insertIgnoreBatch(userToCourseList);
    }
}
