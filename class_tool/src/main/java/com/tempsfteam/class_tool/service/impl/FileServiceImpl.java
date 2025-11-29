package com.tempsfteam.class_tool.service.impl;

import cn.dev33.satoken.annotation.SaCheckLogin;
import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.tempsfteam.class_tool.constant.RedisConst;
import com.tempsfteam.class_tool.constant.role.Role;
import com.tempsfteam.class_tool.entity.File;
import com.tempsfteam.class_tool.mapper.FileMapper;
import com.tempsfteam.class_tool.service.FileService;
import com.tempsfteam.class_tool.util.FileUtil;
import com.tempsfteam.class_tool.util.RedisUtil;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;

/**
 * @author 19735
 * @description 针对表【file】的数据库操作Service实现
 * @createDate 2024-09-14 18:43:35
 */
@Service
public class FileServiceImpl extends ServiceImpl<FileMapper, File>
        implements FileService{

    @Resource
    private RedisUtil redisUtil;

    @Override
    @SaCheckLogin
    public Boolean checkUserPermission(String fileName, Long userId) {
        // TODO:注意此方法中fileName包含拓展名 而且不包括对超管的判断
        fileName = FileUtil.getFileNameNoExt(fileName);

        String permission = getFilePermissionCache(fileName, userId);
        if (permission != null) {
            return permission.equals("1");
        }

        // redis中没有缓存
        permission = "0";
        if (baseMapper.selectOneByFileNameFiles(fileName) != null) {
            if (StpUtil.hasRole(Role.COURSE_MANAGER_STRING)){
                // 课程管理员
                if (baseMapper.selectOneByFileNameAndManagerId(fileName, userId) != null) {
                    permission = "1";
                }
            }else {
                // 普通用户
                if (!baseMapper.selectFileByUserIdAndFileName(userId, fileName).isEmpty()) {
                    permission = "1";
                }
            }
            setFilePermissionCache(fileName, userId, permission);
        }

        return permission.equals("1");
    }

    @Override
    @SaCheckLogin
    public Boolean checkUserPermission(Integer fileId, Long userId) {
        File file = getById(fileId);
        if (file == null) {
            return false;
        }
        String fileNameNoExt = FileUtil.getFileNameNoExt(file.getFileName());
        return checkUserPermission(fileNameNoExt, userId);
    }

    @Override
    public Boolean deleteFileByExperimentId(Integer experimentId) {
        LambdaQueryWrapper<File> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(File::getExperimentId, experimentId);
        List<File> fileList = baseMapper.selectList(wrapper);
        boolean isDeleted = baseMapper.delete(wrapper) != 0;
        if (isDeleted) {
            for (File file : fileList) {
                deleteFilePermissionCache(file.getFileName());
            }
            return true;
        }
        return false;
    }

    @Override
    public Boolean deleteFileById(Integer id) {
        LambdaQueryWrapper<File> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(File::getFileId, id);
        File file = getById(id);
        if (file == null) {
            return false;
        }
        boolean isDeleted = baseMapper.delete(wrapper) != 0;
        if (isDeleted) {
            deleteFilePermissionCache(FileUtil.getFileNameNoExt(file.getFileName()));
            return true;
        }
        return false;
    }

    public void deleteFilePermissionCache(String fileName) {
        redisUtil.delete(RedisConst.FILE_PERMISSION_KEY + fileName);
    }

    public void setFilePermissionCache(String fileName, Long userId, String permission) {
        RedisUtil.hset(RedisConst.FILE_PERMISSION_KEY + fileName, userId.toString(), permission);
    }

    public String getFilePermissionCache(String fileName, Long userId) {
        return (String) RedisUtil.hget(RedisConst.FILE_PERMISSION_KEY + fileName, userId.toString());
    }
}