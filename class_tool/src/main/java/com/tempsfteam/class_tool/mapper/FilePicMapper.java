package com.tempsfteam.class_tool.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.tempsfteam.class_tool.entity.FilePic;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

/**
* @author 19735
* @description 针对表【file_pic】的数据库操作Mapper
* @createDate 2024-10-10 00:27:59
* @Entity com.rdc.entity.FilePic
*/
@Mapper
public interface FilePicMapper extends BaseMapper<FilePic> {

    /**
     * 根据文件id查询文件图片
     * @param fileId 文件id
     * @return 文件图片列表
     */
    List<FilePic> selectByFileId(Integer fileId);
}




