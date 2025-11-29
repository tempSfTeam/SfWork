package com.tempsfteam.class_tool.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.tempsfteam.class_tool.entity.File;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * @author 19735
 * @description 针对表【file】的数据库操作Mapper
 * @createDate 2024-09-14 18:43:35
 * @Entity com.rdc.entity.File
 */
@Mapper
public interface FileMapper extends BaseMapper<File> {

    /**
     * 根据用户id和文件名查询文件
     * @param userId 用户id
     * @param fileName 文件名
     * @return 文件列表
     */
    List<File> selectFileByUserIdAndFileName(@Param("userId") Long userId, @Param("fileName") String fileName);

    /**
     * 根据文件名查询文件
     * @param fileName 文件名
     * @return 文件列表
     */
    File selectOneByFileNameFiles(@Param("fileName") String fileName);
}


