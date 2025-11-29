package com.tempsfteam.class_tool.util;

import com.aspose.pdf.devices.JpegDevice;
import com.aspose.pdf.devices.Resolution;
import com.aspose.slides.Presentation;
import com.aspose.words.Document;
import com.aspose.words.ImageSaveOptions;
import com.aspose.words.SaveFormat;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.io.*;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

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


    /**
     * 检查给到的MultipartFile实际上是不是空
     * @param file 文件
     * @return 是否为图片
     */
    public static boolean checkNothing(MultipartFile file)  {
        if(file==null){
            return true;
        }
        String originalFilename = file.getOriginalFilename();
        if(Objects.equals(originalFilename, "")||originalFilename==null){
            return true;
        }
        return false;
    }

    /**
     * doc转图片
     * @param file 文件
     * @param imagePath 图片路径
     * @return 图片名列表
     */
    public static java.util.List<String> docToImage(File file, String imagePath) {
        try {

            FileInputStream inputStream = new FileInputStream(file);
            Document document = new Document(inputStream);
            int pageCount = document.getPageCount();
            ArrayList<String> imageNameList = new ArrayList<>();

            File imageFolder = new File(imagePath);
            if (!imageFolder.exists()) {
                imageFolder.mkdirs();
            }

            for (int i = 0; i < pageCount; i++) {
                Document extractPages = document.extractPages(i, 1);
                ImageSaveOptions options = new ImageSaveOptions(SaveFormat.PNG);
                options.setResolution(300);
                String imageName = UUID.randomUUID().toString().replaceAll("-", "") + ".png";
                extractPages.save(imagePath + imageName , options);
                imageNameList.add(imageName);
            }
            return imageNameList;
        }catch (Exception e){
            // 删除文件夹
            File imageFolder = new File(imagePath);
            if (imageFolder.exists()) {
                imageFolder.delete();
            }
            e.printStackTrace();
            return null;
        }
    }

    /**
     * ppt转图片
     * @param file 文件
     * @param imagePath 图片路径
     * @return 图片名列表
     */
    public static java.util.List<String> pptToImage(File file, String imagePath) {
        try {

            FileInputStream inputStream = new FileInputStream(file);
            Presentation presentation = new Presentation(inputStream);
            ArrayList<String> imageNameList = new ArrayList<>();

            File imageFolder = new File(imagePath);
            if (!imageFolder.exists()) {
                imageFolder.mkdirs();
            }

            presentation.getSlides().forEach(slide -> {
                String imageName = UUID.randomUUID().toString().replaceAll("-", "") + ".svg";
                try {
                    FileOutputStream outputStream = new FileOutputStream(imagePath + imageName);
                    slide.writeAsSvg(outputStream);
                    imageNameList.add(imageName);
                    outputStream.close();
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
            });
            return imageNameList;
        }catch (Exception e){
            // 删除文件夹
            File imageFolder = new File(imagePath);
            if (imageFolder.exists()) {
                imageFolder.delete();
            }
            e.printStackTrace();
            return null;
        }
    }

    public static List<String> pdfToImage(File file, String imagePath) {
        try {
            FileInputStream inputStream = new FileInputStream(file);
            com.aspose.pdf.Document document = new com.aspose.pdf.Document(inputStream);

            Resolution resolution = new Resolution(180);
            JpegDevice jpegDevice = new JpegDevice(resolution);

            File imageFolder = new File(imagePath);
            if (!imageFolder.exists()) {
                imageFolder.mkdirs();
            }

            ArrayList<String> imageNameList = new ArrayList<>();

            for (int i = 1; i <= document.getPages().size(); i++) {
                String imageName = UUID.randomUUID().toString().replaceAll("-", "") + ".jpg";

                jpegDevice.process(document.getPages().get_Item(i), imagePath + imageName);
                imageNameList.add(imageName);
            }
            return imageNameList;
        }catch (Exception e){
            // 删除文件夹
            File imageFolder = new File(imagePath);
            if (imageFolder.exists()) {
                imageFolder.delete();
            }
            e.printStackTrace();
            return null;
        }
    }

    /**
     * 根据文件类型获取文件路径
     * @param prePath 文件路径
     * @param fileName 文件名
     * @param fileType 文件类型
     * @return 文件路径
     */
    public static String getFilePathByFileType(String prePath, String fileName, Integer fileType) {
        switch (fileType) {
            case 0:
                return prePath + "pdf" + '/' + fileName;
            case 1:
                return prePath + "video" + '/' + fileName;
            case 2:
            case 3:
                return prePath + "ppt" + '/' + fileName;
            case 4:
            case 5:
                return prePath + "word" + '/' + fileName;
            default:
                return null;
        }
    }

    /**
     * 获取无拓展名的文件名
     * @param fileName 文件名
     * @return 无拓展名的文件名
     */
    public static String getFileNameNoExt(String fileName) {
        try{
            return fileName.substring(0, fileName.lastIndexOf("."));
        }catch (Exception e){
            return fileName;
        }
    }
}