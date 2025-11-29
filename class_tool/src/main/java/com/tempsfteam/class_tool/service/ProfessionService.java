package com.tempsfteam.class_tool.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.tempsfteam.class_tool.bean.Msg;
import com.tempsfteam.class_tool.bean.UserData;
import com.tempsfteam.class_tool.dto.ProfessionDTO;
import com.tempsfteam.class_tool.dto.SortDTO;
import com.tempsfteam.class_tool.entity.Profession;

/**
 * @author hypocodeemia
 * @description 针对表【profession】的数据库操作Service
 * @createDate 2024-09-10 14:42:24
 */
public interface ProfessionService extends IService<Profession> {
    /**
     * 添加课程科目
     * @param name          课程科目名字
     * @param courseTypeId  归属的学习对象的id
     * @return              Msg
     */
    Msg addProfession(Integer courseTypeId,String name);

    /**
     * 删除课程科目
     * @param professionId  课程科目id
     * @return              Msg
     */
    Msg deleteProfession(Integer professionId);

    /**
     * 更新课程科目基础信息(不包含sort)
     * @param professionDTO  professionDTO
     * @return               Msg
     */
    Msg updateProfessionInfo(ProfessionDTO professionDTO);

    /**
     * 更新sort
     * @param sortDTO   sortDTO
     * @return          Msg
     */
    Msg updateSort(SortDTO sortDTO);

    /**
     * 获取全部课程科目
     * @return          Msg
     */
    Msg listAllProfession();

    /**
     * 获取指定学习对象的课程科目
     * @param courseTypeId  学习对象id
     * @return              Msg
     */
    Msg listByCourseTypeId(Integer courseTypeId);

    /**
     * 结合用户的权限permission以及被授予的课程 去获取课程科目
     * @return          Msg
     */
    Msg listPreferenceByCourseTypeId(Integer courseTypeId, UserData userData);

}

