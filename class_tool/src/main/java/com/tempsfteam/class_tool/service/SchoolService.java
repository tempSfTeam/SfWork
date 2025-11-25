package com.tempsfteam.class_tool.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.tempsfteam.class_tool.bean.Msg;
import com.tempsfteam.class_tool.dto.SchoolDTO;
import com.tempsfteam.class_tool.entity.School;

/**
 * @author 21983
 * @description 针对表【school】的数据库操作Service
 * @createDate 2024-09-10 14:42:24
 */
public interface SchoolService extends IService<School> {
    /**
     * 添加学校
     * @param name      学校名字
     * @return          Msg
     */
    Msg addSchool(String name);

    /**
     * 删除学校
     * @param schoolId  学校id
     * @return          Msg
     */
    Msg deleteSchool(Integer schoolId);

    /**
     * 更新学校基础信息
     * @param schoolDTO schoolDTO
     * @return          Msg
     */
    Msg updateSchoolInfo(SchoolDTO schoolDTO);

    /**
     * 获取全部学校
     * @return          Msg
     */
    Msg listAllSchool();


}

