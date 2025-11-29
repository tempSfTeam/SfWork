package com.tempsfteam.class_tool.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tempsfteam.class_tool.entity.Classe;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * @author hypocodeemia
 * @description 针对表【classe】的数据库操作Mapper
 * @createDate 2024-09-12 23:12:18
 * @Entity com.rdc.entity.Classe
 */
@Mapper
public interface ClasseMapper extends BaseMapper<Classe> {

    Page<Classe> getClasseByCondition(Page<Classe> pageDTO, @Param("searchStr")String searchStr, @Param("schoolId")Integer schoolId, @Param("grade")String grade);

}



