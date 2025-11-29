package com.tempsfteam.class_tool.util;

import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;

/**
 * @author : IMG
 * @create : 2024/7/16
 */
public class FileUtil {

    /**
     * MultipartFile 转 File
     * @param file 文件
     */
    public static File multipartFileToFile(MultipartFile file, String name) throws Exception {

        File toFile = null;
        if (file.equals("") || file.getSize() <= 0) {
            file = null;
        } else {
            InputStream ins = null;
            ins = file.getInputStream();
            toFile = new File(name);
            inputStreamToFile(ins, toFile);
            ins.close();
        }
        return toFile;
    }

    // 获取流文件
    private static void inputStreamToFile(InputStream ins, File file) {
        try {
            OutputStream os = Files.newOutputStream(file.toPath());
            int bytesRead = 0;
            byte[] buffer = new byte[8192];
            while ((bytesRead = ins.read(buffer, 0, 8192)) != -1) {
                os.write(buffer, 0, bytesRead);
            }
            os.close();
            ins.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * 检查文件是否为图片
     * @param file 文件
     * @return 是否为图片
     */
    public static boolean checkImg(File file) throws IOException {
        Image img = ImageIO.read(file);
        return img != null && img.getWidth(null) > 0 && img.getHeight(null) > 0;
    }

    /**
     * 删除本地临时文件
     */
    public static void deleteTempFile(File file) {
        if (file != null) {
            File del = new File(file.toURI());
            del.delete();
        }
    }
}
