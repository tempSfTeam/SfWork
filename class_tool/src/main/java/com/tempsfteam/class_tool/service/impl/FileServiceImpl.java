package com.tempsfteam.class_tool.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.tempsfteam.class_tool.constant.RedisConst;
import com.tempsfteam.class_tool.entity.File;
import com.tempsfteam.class_tool.mapper.FileMapper;
import com.tempsfteam.class_tool.service.FileService;
import com.tempsfteam.class_tool.util.RedisUtil;
import org.springframework.stereotype.Service;

/**
 * @author 19735
 * @description 针对表【file】的数据库操作Service实现
 * @createDate 2024-09-14 18:43:35
 */
@Service
public class FileServiceImpl extends ServiceImpl<FileMapper, File>
        implements FileService{


    @Override
    public Boolean checkUserPermission(String fileName, Long userId) {
        String PermissionSet = RedisConst.FILE_PERMISSION_KEY + userId;
        String permission = (String) RedisUtil.hget(PermissionSet, fileName);
        if (permission != null) {
            return permission.equals("1");
        }
        permission = "0";
        if (baseMapper.selectOneByFileNameFiles(fileName) != null) {
            if (!baseMapper.selectFileByUserIdAndFileName(userId, fileName).isEmpty()) {
                permission = "1";
            }
            RedisUtil.hset(PermissionSet, fileName, permission);
        }
        return permission.equals("1");
    }
}