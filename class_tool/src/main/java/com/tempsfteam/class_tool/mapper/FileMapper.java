package com.tempsfteam.class_tool.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.tempsfteam.class_tool.entity.File;
import org.apache.ibatis.annotations.Mapper;

/**
 * @author 19735
 * @description 针对表【file】的数据库操作Mapper
 * @createDate 2024-09-14 18:43:35
 * @Entity com.rdc.entity.File
 */
@Mapper
public interface FileMapper extends BaseMapper<File> {

}



