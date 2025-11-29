package com.tempsfteam.class_tool.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.tempsfteam.class_tool.bean.Msg;
import com.tempsfteam.class_tool.entity.CourseToProfession;
import com.tempsfteam.class_tool.mapper.CourseToProfessionMapper;
import com.tempsfteam.class_tool.service.CourseToProfessionService;
import org.springframework.stereotype.Service;

/**
 * @author hypocodeemia
 * @description 针对表【course_to_profession】的数据库操作Service实现
 * @createDate 2024-09-10 14:42:23
 */
@Service
public class CourseToProfessionServiceImpl extends ServiceImpl<CourseToProfessionMapper, CourseToProfession>
        implements CourseToProfessionService {

    @Override
    public Msg connectProfession(Integer courseId,Integer professionId){
        // 1.检查是否存在相同的
        LambdaQueryWrapper<CourseToProfession> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(CourseToProfession::getCourseId, courseId).eq(CourseToProfession::getProfessionId, professionId);
        long count = this.count(queryWrapper);
        if (count > 0) {
            return Msg.fail("该课程已与此课程科目关联");
        }
        // 2.进行实际的添加
        CourseToProfession courseToProfession = new CourseToProfession(courseId, professionId);
        boolean isSaved = this.save(courseToProfession);
        return isSaved ? Msg.success("添加课程与课程科目间的关联成功",courseToProfession.getId(),null) : Msg.fail("添加课程与课程科目间的关联失败");
    }

    @Override
    public Msg disconnectProfession(Integer courseId, Integer professionId) {
        if(this.getBaseMapper().getConnectionCount(courseId)<=1){
            return Msg.fail("课程至少要和一个课程科目建立联系");
        }
        int affectedRows = this.getBaseMapper().deleteByCourseIdAndProfessionId(courseId, professionId);
        return affectedRows > 0? Msg.success() : Msg.fail("删除课程与课程科目间的关联失败");
    }

    @Override
    public void deleteByCourseId(Integer courseId){
        this.getBaseMapper().deleteByCourseId(courseId);
    }


}
