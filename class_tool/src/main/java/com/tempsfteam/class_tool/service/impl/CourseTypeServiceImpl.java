package com.tempsfteam.class_tool.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.tempsfteam.class_tool.bean.Msg;
import com.tempsfteam.class_tool.dto.CourseTypeDTO;
import com.tempsfteam.class_tool.entity.CourseType;
import com.tempsfteam.class_tool.mapper.CourseTypeMapper;
import com.tempsfteam.class_tool.service.CourseTypeService;
import org.springframework.stereotype.Service;

/**
 * @author hypocodeemia
 * @description 针对表【course_type】的数据库操作Service实现
 * @createDate 2024-09-10 14:42:23
 */
@Service
public class CourseTypeServiceImpl extends ServiceImpl<CourseTypeMapper, CourseType>
        implements CourseTypeService {

    @Override
    public Msg addCourseType(String name) {
        CourseType courseType = new CourseType(name);
        boolean isSaved = this.save(courseType);
        return isSaved ? Msg.success("添加学习对象成功",courseType.getCourseTypeId(),null) : Msg.fail("添加学习对象失败");
    }

    @Override
    public Msg deleteCourseType(Integer courseTypeId) {
        return this.removeById(courseTypeId) ? Msg.success() : Msg.fail("删除学习对象失败");
    }

    @Override
    public Msg updateCourseTypeInfo(CourseTypeDTO courseTypeDTO) {
        return this.updateById(new CourseType(courseTypeDTO)) ? Msg.success()
                : Msg.fail("更改学习对象信息失败");
    }

    @Override
    public Msg listAllCourseType() {
        return Msg.success("以下为全部的学习对象",this.list());
    }
}
