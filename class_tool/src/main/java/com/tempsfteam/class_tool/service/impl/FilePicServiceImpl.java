package com.tempsfteam.class_tool.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.core.net.URLEncodeUtil;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.tempsfteam.class_tool.constant.RedisConst;
import com.tempsfteam.class_tool.entity.FilePic;
import com.tempsfteam.class_tool.mapper.FilePicMapper;
import com.tempsfteam.class_tool.service.FilePicService;
import com.tempsfteam.class_tool.util.FileUtil;
import com.tempsfteam.class_tool.util.RedisUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;

/**
* @author 19735
* @description 针对表【file_pic】的数据库操作Service实现
* @createDate 2024-10-10 00:27:59
*/
@Service
public class FilePicServiceImpl extends ServiceImpl<FilePicMapper, FilePic>
    implements FilePicService{

    @Resource
    private RedisUtil redisUtil;

    @Value("${file.networkPath}")
    private String networkPath;

    @Resource
    private FileServiceImpl fileService;

    @Override
    public List<FilePic> selectFilePicByFileId(Integer fileId) {
        // 获取文件图片列表
        List<FilePic> filePics = baseMapper.selectByFileId(fileId);
        // 文件是否存在
        if (!filePics.isEmpty()) {
            String fileName = filePics.get(0).getFileName();
            String fileNameNoExt = FileUtil.getFileNameNoExt(fileName);
            // 增加文件访问次数 需要有拓展名的文件名
            addFileViewCount(fileName);
            // 缓存文件权限 无拓展名的文件名
            fileService.setFilePermissionCache(fileNameNoExt, StpUtil.getLoginIdAsLong(), "1");

            filePics.forEach(filePic -> {
                String webPath = networkPath + "filePic/" + fileNameNoExt + "/" + filePic.getFilePicName();
                filePic.setFilePicName(URLEncodeUtil.encode(webPath));
            });
        }
        return filePics;
    }

    public void addFileViewCount(String fileName) {
        redisUtil.hashIncrement(RedisConst.FILE_CLICK_COUNT_KEY, fileName);
    }
}




