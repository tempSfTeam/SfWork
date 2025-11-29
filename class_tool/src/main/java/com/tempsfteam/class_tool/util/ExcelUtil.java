package com.tempsfteam.class_tool.util;

import com.tempsfteam.class_tool.constant.StringConstant;
import com.tempsfteam.class_tool.entity.Classe;
import com.tempsfteam.class_tool.entity.School;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.File;
import java.io.FileOutputStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

public class ExcelUtil {
    /**
     * 将学校数据写入到 Excel 文件
     * @param schoolList 学校列表
     * @return 文件名
     * @throws Exception 异常
     */
    public static String writeSchoolDataToExcel(List<School> schoolList) throws Exception {
        String folderPath = StringConstant.DOWNLOAD_SCHOOL_EXCEL_FOLDER;
        // 确保文件夹存在
        File targetDir = new File(folderPath);
        if (!targetDir.exists()) {
            targetDir.mkdirs();
        }

        // 生成唯一文件名
        String fileName = UUID.randomUUID().toString().replaceAll("-", "") + ".xlsx";
        String filePath = folderPath + "/" + fileName;

        // 创建一个新的工作簿
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Schools");

        // 创建标题行
        Row headerRow = sheet.createRow(0);
        headerRow.createCell(0).setCellValue("学校名称");
        headerRow.createCell(1).setCellValue("学校编号");

        // 写入数据
        int rowNum = 1;
        for (School school : schoolList) {
            Row row = sheet.createRow(rowNum++);
            // 学校名称
            row.createCell(0).setCellValue(school.getName());
            // 插入后的 ID
            row.createCell(1).setCellValue(school.getSchoolId());
        }

        // 将Excel写入到文件
        try (FileOutputStream fileOut = new FileOutputStream(filePath)) {
            workbook.write(fileOut);
        } catch (Exception e) {
            // 如果发生异常，删除已创建的文件
            Files.deleteIfExists(Paths.get(filePath));
            // 抛出异常以便外层捕获
            throw e;
        } finally {
            // 关闭工作簿
            workbook.close();
        }
        return fileName;
    }

    /**
     * 将班级数据写入到 Excel 文件
     * @param classList 班级列表
     * @return  文件名
     * @throws Exception    异常
     */
    public static String writeClassDataToExcel(List<Classe> classList) throws Exception {
        String folderPath = StringConstant.DOWNLOAD_CLASS_EXCEL_FOLDER;
        // 确保文件夹存在
        File targetDir = new File(folderPath);
        if (!targetDir.exists()) {
            targetDir.mkdirs();
        }

        // 生成唯一文件名
        String fileName = UUID.randomUUID().toString().replaceAll("-", "") + ".xlsx";
        String filePath = folderPath + "/" + fileName;

        // 创建一个新的工作簿
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Classes");

        // 创建标题行
        Row headerRow = sheet.createRow(0);
        headerRow.createCell(0).setCellValue("班级编号");
        headerRow.createCell(1).setCellValue("班级名称");
        headerRow.createCell(2).setCellValue("年级");
        headerRow.createCell(3).setCellValue("学校编号");

        // 写入数据
        int rowNum = 1;
        for (Classe classe : classList) {
            Row row = sheet.createRow(rowNum++);
            // 插入后的 ID
            row.createCell(0).setCellValue(classe.getClasseId());
            // 班级名称
            row.createCell(1).setCellValue(classe.getName());
            // 年级
            row.createCell(2).setCellValue(classe.getGrade());
            // 学校编号
            row.createCell(3).setCellValue(classe.getSchoolId());
        }

        // 将Excel写入到文件
        try (FileOutputStream fileOut = new FileOutputStream(filePath)) {
            workbook.write(fileOut);
        } catch (Exception e) {
            // 如果发生异常，删除已创建的文件
            Files.deleteIfExists(Paths.get(filePath));
            // 抛出异常以便外层捕获
            throw e;
        } finally {
            // 关闭工作簿
            workbook.close();
        }
        return fileName;
    }
}
