package com.tempsfteam.class_tool.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.tempsfteam.class_tool.bean.Msg;
import com.tempsfteam.class_tool.entity.Experiment;
import com.tempsfteam.class_tool.entity.File;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * @author 19735
 * @description 针对表【experiment】的数据库操作Service
 * @createDate 2024-09-14 18:43:35
 */
public interface ExperimentService extends IService<Experiment> {

    /**
     * 根据实验id和资源类型查询文件
     * @param experimentId 实验id
     * @param resourceType 资源类型
     * @return 文件列表
     */
    List<File> getExperimentFile(Integer experimentId, Integer resourceType);

    /**
     * 检查用户是否有权限
     * @param experimentId 实验id
     * @param userId 用户id
     * @return 是否有权限
     */
    Boolean checkUserPermission(Integer experimentId, Long userId);

    /**
     * 添加实验
     * @param experimentData 实验数据
     * @return Msg
     */
    Msg addExperiment(Experiment experimentData);

    /**
     * 更新实验
     * @param experimentData 实验数据
     * @return Msg
     */
    Msg updateExperiment(Experiment experimentData);

    /**
     * 删除实验
     * @param experimentId 实验id
     * @return Msg
     */
    Msg deleteExperiment(Integer experimentId);

    /**
     * 删除实验文件
     * @param fileId 文件id
     * @return Msg
     */
    Msg deleteFile(Integer fileId);

    /**
     * 上传文件
     * @param file 文件
     * @param experimentId 实验id
     * @param resourceType 资源类型
     * @return Msg
     */
    Msg uploadFile(MultipartFile file, Integer experimentId, Integer resourceType) throws Exception;

    /**
     * 获取实验信息
     * @param experimentId 实验id
     * @return Msg
     */
    Msg getExperimentInfo(Integer experimentId);
}