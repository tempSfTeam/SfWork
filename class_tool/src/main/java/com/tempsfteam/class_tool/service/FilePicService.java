package com.tempsfteam.class_tool.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.tempsfteam.class_tool.entity.FilePic;


import java.util.List;

/**
* @author 19735
* @description 针对表【file_pic】的数据库操作Service
* @createDate 2024-10-10 00:27:59
*/
public interface FilePicService extends IService<FilePic> {

    /**
     * 根据文件id查询文件图片
     * @param fileId 文件id
     * @return 文件图片列表
     */
    List<FilePic> selectFilePicByFileId(Integer fileId);
}
