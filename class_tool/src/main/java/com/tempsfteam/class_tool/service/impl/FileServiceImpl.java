package com.tempsfteam.class_tool.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.tempsfteam.class_tool.entity.File;
import com.tempsfteam.class_tool.mapper.FileMapper;
import com.tempsfteam.class_tool.service.FileService;
import org.springframework.stereotype.Service;

/**
 * @author 19735
 * @description 针对表【file】的数据库操作Service实现
 * @createDate 2024-09-14 18:43:35
 */
@Service
public class FileServiceImpl extends ServiceImpl<FileMapper, File>
        implements FileService {

}