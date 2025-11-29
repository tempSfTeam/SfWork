package com.tempsfteam.class_tool.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.tempsfteam.class_tool.bean.Msg;
import com.tempsfteam.class_tool.dto.ClasseDTO;
import com.tempsfteam.class_tool.entity.Classe;

/**
 * @author hypocodeemia
 * @description 针对表【classe】的数据库操作Service
 * @createDate 2024-09-12 17:35:32
 */
public interface ClasseService extends IService<Classe> {
    /**
     * 添加班级
     * @param name      班级名字
     * @param schoolId  归属的学校的id
     * @param grade     入学年份
     * @return          Msg
     */
    Msg addClasse(String name, Integer schoolId,String grade);

    /**
     * 删除班级
     * @param classeId  班级id
     * @return          Msg
     */
    Msg deleteClasse(Integer classeId);

    /**
     * 更新班级基础信息
     * @param classeDTO  classDTO
     * @return          Msg
     */
    Msg updateClasseInfo(ClasseDTO classeDTO);

    /**
     * 获取某学校的全部班级
     * @param schoolId  学校id
     * @return          Msg
     */
    Msg listClasseBySchoolId(Page<Classe> pageDTO, String searchStr, Integer schoolId, String grade);

}

