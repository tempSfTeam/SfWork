package com.tempsfteam.class_tool.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.tempsfteam.class_tool.bean.Msg;
import com.tempsfteam.class_tool.dto.SchoolDTO;
import com.tempsfteam.class_tool.entity.School;
import com.tempsfteam.class_tool.mapper.SchoolMapper;
import com.tempsfteam.class_tool.service.SchoolService;
import org.springframework.stereotype.Service;

/**
 * @author hypocodeemia
 * @description 针对表【school】的数据库操作Service实现
 * @createDate 2024-09-10 14:42:24
 */
@Service
public class SchoolServiceImpl extends ServiceImpl<SchoolMapper, School>
        implements SchoolService {

    @Override
    public Msg addSchool(String name) {
        School school = new School(name);
        boolean isSaved = this.save(school);
        return isSaved? Msg.success("添加学校成功", school.getSchoolId(), null) : Msg.fail("添加学校失败");
    }

    @Override
    public Msg deleteSchool(Integer schoolId) {
        return this.removeById(schoolId) ? Msg.success() : Msg.fail("删除学校失败");
    }

    @Override
    public Msg updateSchoolInfo(SchoolDTO schoolDTO) {
        return this.updateById(new School(schoolDTO)) ? Msg.success()
                : Msg.fail("更改学校信息失败");
    }

    @Override
    public Msg listAllSchool() {
        return Msg.success("以下为全部的学校",this.list());
    }
}
