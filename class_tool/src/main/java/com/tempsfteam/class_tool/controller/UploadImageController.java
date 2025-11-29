package com.tempsfteam.class_tool.controller;

import cn.dev33.satoken.annotation.SaCheckLogin;
import com.tempsfteam.class_tool.bean.Msg;
import com.tempsfteam.class_tool.util.FileUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.UUID;

// TODO:目前完全没用处，后面删了
/**
 * @author : IMG,hypocodeemia
 * @create : 2024/7/16
 */
@RestController
@RequestMapping("/image")

public class UploadImageController {

    private final String pre = "http://1.95.80.153:8089/cloudClassroom/api/file/image/";

    @Value("${image.courseIcon}")
    private String courseIconFolder;

    /**
     * 上传图片
     * @param image 图片文件
     * @param type 上传图片类型 0-课程图片
     * @return 图片链接
     */
    @PostMapping("/upload")
    @SaCheckLogin
    public Msg uploadImage(MultipartFile image, Integer type) throws Exception{
        if(image==null){
            return Msg.fail("参数image异常");
        }

        String path;
        String typeStr;

        switch (type){
            case 0:
                path = courseIconFolder;
                typeStr = "courseIcon";
                break;
            default:
                return Msg.fail("文件类型type输入错误");
        }

        File file = new File(path);
        if (!file.exists()){
            file.mkdirs();
        }
        String ext = image.getOriginalFilename().substring(image.getOriginalFilename().lastIndexOf("."));
        String fileName = UUID.randomUUID().toString().replaceAll("-", "") + ext;
        String filePath = path + fileName;
        File tempFile = FileUtil.multipartFileToFile(image, filePath);
        // 检查文件是否为图片
        if (!FileUtil.checkImg(tempFile)) {
            FileUtil.deleteTempFile(tempFile);
            return Msg.fail("非图片文件!");
        }
        return Msg.success("上传成功",pre + typeStr + "/" + fileName);
    }


}