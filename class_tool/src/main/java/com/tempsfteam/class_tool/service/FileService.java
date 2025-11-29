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
}
