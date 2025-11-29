package com.tempsfteam.class_tool.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.tempsfteam.class_tool.entity.Experiment;
import com.tempsfteam.class_tool.entity.File;

import com.tempsfteam.class_tool.vo.ExperimentInfoVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * @author 19735
 * @description 针对表【experiment】的数据库操作Mapper
 * @createDate 2024-09-14 18:43:35
 * @Entity com.rdc.entity.Experiment
 */
@Mapper
public interface ExperimentMapper extends BaseMapper<Experiment> {

    /**
     * 根据实验id和资源类型查询文件
     * @param experimentId 实验id
     * @param resourceType 资源类型
     * @return 文件列表
     */
    List<File> selectFileByExperimentIdAndResourceType(@Param("experimentId")Integer experimentId, @Param("resourceType") Integer resourceType);

    /**
     * 根据用户id和实验id查询实验
     * @param userId 用户id
     * @param experimentId 实验id
     * @return 实验列表
     */
    List<Experiment> selectExperimentByUserIdAndExperimentId(@Param("userId") Long userId, @Param("experimentId") Integer experimentId);

    /**
     * 根据实验id查询实验信息
     * @param experimentId 实验id
     * @return 实验信息
     */
    ExperimentInfoVO selectExperimentInfo(@Param("experimentId") Integer experimentId);
}




