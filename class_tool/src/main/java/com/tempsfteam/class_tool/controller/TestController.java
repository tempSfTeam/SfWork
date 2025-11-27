package com.tempsfteam.class_tool.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;
import java.io.RandomAccessFile;

/**
 * @author : IMG
 * @create : 2024/9/12
 */
@RestController
@RequestMapping("/test")
public class TestController {

    private static final Long MB = 1048576L;

    @Value("${file.pdf}")
    private String pdfPath;

    @Value("${file.video}")
    private String videoPath;


    private final Logger logger = LoggerFactory.getLogger(TestController.class);

    @GetMapping("/pdf/{pdfId}")
    public ResponseEntity<FileSystemResource> getPdf(@PathVariable String pdfId) {
        String filePath = pdfPath + pdfId + ".pdf";
        File file = new File(filePath);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "inline;filename=a.pdf");
        return ResponseEntity.ok().headers(headers).contentLength(file.length()).contentType(MediaType.parseMediaType("application/octet-stream")).body(new FileSystemResource(file));
    }

//    @GetMapping("/video/{videoId}")
//    public ResponseEntity<FileSystemResource> getVideo(@PathVariable String videoId) {
//        String filePath = "E:\\document\\视频\\input.mp4";
//        File file = new File(filePath);
//        HttpHeaders headers = new HttpHeaders();
//        headers.add("Content-Disposition", "inline");
//        return ResponseEntity.ok().headers(headers).contentLength(file.length()).contentType(MediaType.parseMediaType("application/octet-stream")).body(new FileSystemResource(file));
//    }

    @GetMapping("/video/{videoId}")
    public void getVideo(HttpServletRequest request, HttpServletResponse response, @PathVariable String videoId) throws IOException {
        String filePath = videoPath + videoId + ".mp4";
        File file = new File(filePath);
        if (!file.exists()) {
            response.sendError(HttpStatus.NOT_FOUND.value(), "文件不存在");
            return;
        }
        String range = request.getHeader("Range");
        logger.info("Range:" + range);
//        if (range != null && range.length() > 7) {
        if (range == null) {
            range = "bytes=0-";
        }
        logger.info("该请求符合断点续传");
        range = range.substring(6);
        String[] arr = range.split("-");
        long lenStart = Long.parseLong(arr[0]);
        long end = 0;
        if (arr.length > 1) {
            end = Long.parseLong(arr[1]) ;
        }
        logger.info("lenStart:" + lenStart);
        logger.info("end:" + end);
//        long contentLength= end > 0 ? (end - (lenStart - 1)) : (file.length() - (lenStart > 0 ? lenStart : 0));//如果指定范围，就返回范围数据长度，如果没有就返回剩余全部长度
        //如果指定范围，就返回范围数据长度，如果没有就返回剩余全部长度
        long contentLength= end > 0 ? (end - (lenStart - 1)) :
                (Math.min(file.length() - (lenStart > 0 ? lenStart : 0), 10 * MB));
        response.setHeader("Content-Length", String.valueOf(contentLength));
        response.setHeader("Content-Range", "bytes " + lenStart + "-" + (end>0?end:(file.length() - 1)) + "/" + file.length());
        response.setContentType("video/mp4");
        response.setHeader("Accept-Ranges", "bytes");
        // 响应码206表示响应内容为部分数据，需要多次请求
        response.setStatus(HttpStatus.PARTIAL_CONTENT.value());
        RandomAccessFile randomAccessFile = new RandomAccessFile(file, "r");
        // 设置读取的开始字节数
        randomAccessFile.seek(lenStart);
//        if(end > 0){
        // 客户端指定了范围的数据，那就只给范围数据
//            int size = (int) (end-lenStart+1);
        int size = (int) contentLength;
        byte[] buffer = new byte[size];
        int len = randomAccessFile.read(buffer);
        if (len != -1) {
            response.getOutputStream().write(buffer, 0, len);
        }
//        }else{
//            //没有指定范围
//            //视频每次返回一兆数据
//            int size = 1048576;
//            byte[] buffer = new byte[size];
//            int len ;
//            while ((len = randomAccessFile.read(buffer)) != -1) {
//                response.getOutputStream().write(buffer, 0, len);
//            }
//        }
        randomAccessFile.close();
//        }else{
//            System.out.println("该请求不符合断点续传");
//            response.setStatus(HttpStatus.PARTIAL_CONTENT.value());
////            response.setHeader("Content-Disposition", "attachment; filename=\"" +System.currentTimeMillis()+".mp4" + "\"");//不能用中文
//            response.setHeader("Content-Length", String.valueOf(file.length()-1));
////            response.setHeader("Content-Range", "" + (file.length()-1));
//            response.setHeader("Accept-Ranges", "bytes");
//            InputStream inStream = Files.newInputStream(file.toPath());
//            byte[] buffer = new byte[1024];
////            int len;
////            while ((len = inStream.read(buffer)) != -1) {
////                response.getOutputStream().write(buffer, 0, len);
////            }
//            response.getOutputStream().write(buffer, 0, inStream.read(buffer));
//        }
        response.getOutputStream().flush();
        response.getOutputStream().close();

    }

}