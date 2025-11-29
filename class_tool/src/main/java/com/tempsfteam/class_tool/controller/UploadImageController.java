package com.tempsfteam.class_tool.controller;

import com.tempsfteam.class_tool.bean.Msg;
import com.tempsfteam.class_tool.util.FileUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.UUID;

/**
 * @author : IMG,hypocodeemia
 * @create : 2024/7/16
 */
@RestController
@RequestMapping("/image")

public class UploadImageController {
    @Value("${image.image}")
    private String imageFolder;

    @Value("${image.courseIcon}")
    private String courseIconFolder;

    /**
     * 上传图片
     * @param image 图片文件
     * @param type 上传图片类型 0-头像 1-图标
     * @return 图片链接
     */
    @PostMapping("/upload")
    public Msg uploadImage(MultipartFile image, Integer type) throws Exception{
        if(image==null){
            return Msg.fail("参数image异常");
        }

        String path;
        String webPath = "";

        switch (type){
            case 0:
                path = courseIconFolder;
                webPath += "courseIcon/";
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
        return Msg.success("上传成功",webPath + fileName);
    }


    @GetMapping("/get")
    public ResponseEntity<FileSystemResource> getImage(@RequestParam String imagePath) {
        String fullPath = imageFolder + imagePath;
        FileSystemResource file = new FileSystemResource(fullPath);
        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_JPEG);
        System.out.println("124312341241");
        return ResponseEntity.ok().headers(headers).body(file);
    }


}
