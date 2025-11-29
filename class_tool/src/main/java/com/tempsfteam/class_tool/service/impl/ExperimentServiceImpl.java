package com.tempsfteam.class_tool.service.impl;

import cn.hutool.core.net.URLEncodeUtil;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.tempsfteam.class_tool.entity.Experiment;
import com.tempsfteam.class_tool.entity.File;
import com.tempsfteam.class_tool.mapper.ExperimentMapper;
import com.tempsfteam.class_tool.service.ExperimentService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @author 19735
 * @description 针对表【experiment】的数据库操作Service实现
 * @createDate 2024-09-14 18:43:35
 */
@Service
public class ExperimentServiceImpl extends ServiceImpl<ExperimentMapper, Experiment>
        implements ExperimentService{

    @Value("${file.networkPath}")
    private String networkPath;

    @Override
    public List<File> getExperimentFile(Integer experimentId, Integer resourceType) {
        List<File> fileList = baseMapper.selectFileByExperimentIdAndResourceType(experimentId, resourceType);
        for (File file : fileList) {
            file.setFileName(URLEncodeUtil.encode(networkPath + file.getFileName()));
        }
        return fileList;
    }

    @Override
    public Boolean checkUserPermission(Integer experimentId, Long userId) {
        return !baseMapper.selectExperimentByUserIdAndExperimentId(userId, experimentId).isEmpty();
    }
}

