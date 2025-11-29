package com.tempsfteam.class_tool.service.impl;

import cn.hutool.core.net.URLEncodeUtil;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.tempsfteam.class_tool.bean.Msg;
import com.tempsfteam.class_tool.constant.FileTypeConst;
import com.tempsfteam.class_tool.constant.RedisConst;
import com.tempsfteam.class_tool.constant.msg.MsgCode;
import com.tempsfteam.class_tool.entity.Experiment;
import com.tempsfteam.class_tool.entity.File;
import com.tempsfteam.class_tool.mapper.ExperimentMapper;
import com.tempsfteam.class_tool.service.ExperimentService;
import com.tempsfteam.class_tool.service.FilePicService;
import com.tempsfteam.class_tool.service.FileService;
import com.tempsfteam.class_tool.util.FileUtil;
import com.tempsfteam.class_tool.util.RedisUtil;
import com.tempsfteam.class_tool.vo.ExperimentInfoVO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.Resource;
import java.util.List;
import java.util.UUID;

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

    @Resource
    private FileService fileService;

    @Resource
    private FilePicService filePicService;

    @Value("${file.pdf}")
    private String pdfFolder;

    @Value("${file.video}")
    private String videoFolder;

    @Value("${file.word}")
    private String wordFolder;

    @Value("${file.ppt}")
    private String pptFolder;

    @Value("${file.filePic}")
    private String filePicFolder;

    @Resource
    private RedisUtil redisUtil;

    @Override
    public List<File> getExperimentFile(Integer experimentId, Integer resourceType) {
        List<File> fileList = baseMapper.selectFileByExperimentIdAndResourceType(experimentId, resourceType);
        // 判断用户是否有下载权限
        // TODO: 注释的是下载鉴权, 暂时不需要
//        boolean hasPermission = StpUtil.hasPermission(PermissionConst.FILE_DOWNLOAD);
        for (File file : fileList) {
            // 获取路径中的文件名
            Object viewResult = redisUtil.getMap(RedisConst.FILE_CLICK_COUNT_KEY, file.getFileName());
            int view = 0;
            if (viewResult != null) {
                view = (Integer) viewResult;
            }
            file.setView(view);
            // 如果用户有下载权限或者文件是视频文件, 那么返回文件路径
//            if (hasPermission || Objects.equals(file.getFileType(), FileTypeConst.MP4)){
            String webPath = FileUtil.getFilePathByFileType(networkPath, file.getFileName(), file.getFileType());
            file.setFileName(webPath);
//            }else {
//                file.setFileName(null);
//            }
        }
        return fileList;
    }

    @Override
    public Boolean checkUserPermission(Integer experimentId, Long userId) {
        return !baseMapper.selectExperimentByUserIdAndExperimentId(userId, experimentId).isEmpty();
    }

    @Override
    public Msg addExperiment(Experiment experimentData) {
        boolean saved = save(experimentData);
        if (!saved) {
            return Msg.fail(MsgCode.FAILED.getMessage());
        }
        return Msg.success();
    }

    @Override
    public Msg updateExperiment(Experiment experimentData) {
        boolean updated = updateById(experimentData);
        if (!updated) {
            return Msg.fail(MsgCode.FAILED.getMessage());
        }
        return Msg.success();
    }

    @Override
    @Transactional
    public Msg deleteExperiment(Integer experimentId) {
        boolean removed = removeById(experimentId);
        if (!removed) {
            return Msg.fail(MsgCode.FAILED.getMessage());
        }
        // 删除实验文件
        fileService.deleteFileByExperimentId(experimentId);
        return Msg.success();
    }

    @Override
    public Msg deleteFile(Integer fileId) {
        boolean removed = fileService.deleteFileById(fileId);
        if (!removed) {
            return Msg.fail(MsgCode.FAILED.getMessage());
        }
        return Msg.success();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Msg uploadFile(MultipartFile file, Integer experimentId, Integer resourceType) throws Exception {
        String ext = file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf(".")).toLowerCase();
        int fileType;
        String filePath;
        // 判断文件类型
        switch (ext){
            case ".pdf":
                fileType = FileTypeConst.PDF; filePath = pdfFolder;break;
            case ".mp4":
                fileType = FileTypeConst.MP4; filePath = videoFolder;break;
            case ".doc":
                fileType = FileTypeConst.DOC; filePath = wordFolder;break;
            case ".docx":
                fileType = FileTypeConst.DOCX; filePath = wordFolder;break;
            case ".ppt":
                fileType = FileTypeConst.PPT; filePath = pptFolder;break;
            case ".pptx":
                fileType = FileTypeConst.PPTX; filePath = pptFolder;break;
            default: return Msg.fail("文件类型错误");
        }

        // 生成文件名
        String fileNameNoExt = UUID.randomUUID().toString().replaceAll("-", "");
        String fileName = fileNameNoExt + ext;
        java.io.File saveFile = new java.io.File(filePath);
        if (!saveFile.exists()){
            saveFile.mkdirs();
        }
        // 保存文件
        String savePath = filePath + fileName;
        java.io.File toFile = FileUtil.multipartFileToFile(file, savePath);
        List<String> imageNameList = null;

        File fileData = new File();
        fileData.setFileName(fileName);
        fileData.setFileType(fileType);
        fileData.setResourceType(resourceType);
        fileData.setExperimentId(experimentId);

        boolean isSaved = fileService.save(fileData);
        if (!isSaved) {
            toFile.delete();
            throw new Exception("文件保存失败");
        }

        // TODO: 注释的是文件转换为图片, 暂时不需要
        // 生成图片文件夹路径
//        String imagePath = filePicFolder + fileNameNoExt + java.io.File.separator;
        // 如果不是视频文件, 那么转换文件
//        if (!ext.equals(".mp4")) {
//            switch (ext) {
//                case ".doc":
//                case ".docx":
//                    imageNameList = FileUtil.docToImage(toFile, imagePath);break;
//                case ".pdf":
//                    imageNameList = FileUtil.pdfToImage(toFile, imagePath);break;
//                case ".ppt":
//                case ".pptx":
//                    imageNameList = FileUtil.pptToImage(toFile, imagePath);break;
//            }
//            // 如果文件转换失败, 那么删除文件
//            if (imageNameList == null) {
//                toFile.delete();
//                return Msg.fail("文件格式不支持");
//            }
//            List<FilePic> filePicList = new ArrayList<>();
//            imageNameList.forEach(imageName -> {
//                FilePic filePic = new FilePic();
//                filePic.setFilePicName(imageName);
//                filePic.setFileId(fileData.getFileId());
//                filePicList.add(filePic);
//            });
//            // 保存文件图片数据到数据库
//            boolean isFilePicSaved = filePicService.saveBatch(filePicList);
//            if (!isFilePicSaved) {
//                toFile.delete();
//                new java.io.File(imagePath).delete();
//                throw new Exception("文件保存失败");
//            }
//        }
        return Msg.success();
    }

    @Override
    public Msg getExperimentInfo(Integer experimentId) {
        ExperimentInfoVO experimentInfoVO = baseMapper.selectExperimentInfo(experimentId);
        if (experimentInfoVO == null) {
            return Msg.fail("实验不存在");
        }
        return Msg.success("获取实验信息成功", experimentInfoVO);
    }
}

