package com.tempsfteam.class_tool.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.tempsfteam.class_tool.entity.File;

/**
 * @author 19735
 * @description 针对表【file】的数据库操作Service
 * @createDate 2024-09-14 18:43:35
 */
public interface FileService extends IService<File> {

    /**
     * 检查用户是否有权限访问文件
     * @param fileName 文件名
     * @param userId 用户id
     * @return 是否有权限
     */
    Boolean checkUserPermission(String fileName, Long userId);

    /**
     * 检查用户是否有权限访问文件
     * @param fileId 文件id
     * @param userId 用户id
     * @return 是否有权限
     */
    Boolean checkUserPermission(Integer fileId, Long userId);

    /**
     * 根据实验id删除文件
     * @param experimentId 实验id
     * @return 是否删除成功
     */
    Boolean deleteFileByExperimentId(Integer experimentId);

    /**
     * 根据文件id删除文件
     * @param id 文件id
     * @return 是否删除成功
     */
    Boolean deleteFileById(Integer id);
}

