package com.tempsfteam.class_tool.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tempsfteam.class_tool.entity.School;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * @author hypocodeemia
 * @description 针对表【school】的数据库操作Mapper
 * @createDate 2024-09-10 14:42:24
 * @Entity generator.entity.School
 */
@Mapper
public interface SchoolMapper extends BaseMapper<School> {

    Page<School> getSchoolByCondition(Page<School> pageDTO, @Param("searchStr")String searchStr);

}