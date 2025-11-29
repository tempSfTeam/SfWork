package com.tempsfteam.class_tool.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.tempsfteam.class_tool.bean.FileUploadFunction;
import com.tempsfteam.class_tool.bean.Msg;
import com.tempsfteam.class_tool.constant.SecretConst;
import com.tempsfteam.class_tool.constant.StringConstant;
import com.tempsfteam.class_tool.constant.UserConst;
import com.tempsfteam.class_tool.constant.msg.MsgCode;
import com.tempsfteam.class_tool.constant.role.Role;
import com.tempsfteam.class_tool.dto.ClasseToCourseDTO;
import com.tempsfteam.class_tool.dto.UpdateUserDTO;
import com.tempsfteam.class_tool.entity.Classe;
import com.tempsfteam.class_tool.entity.School;
import com.tempsfteam.class_tool.entity.User;
import com.tempsfteam.class_tool.entity.UserToCourse;
import com.tempsfteam.class_tool.service.*;
import com.tempsfteam.class_tool.util.DTOUtils;
import com.tempsfteam.class_tool.util.ExcelUtil;
import com.tempsfteam.class_tool.util.MD5Util;
import com.tempsfteam.class_tool.util.StringUtil;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.function.Consumer;
import java.util.stream.Collectors;

/**
* @author ADACHI
* @description 针对表【user】的数据库操作Service实现
* @createDate 2024-07-16 10:38:59
*/
@Service
public class ManageServiceImpl implements ManageService {

    @Resource
    private UserService userService;
    @Resource
    private SchoolService schoolService;

    @Resource
    private ClasseService classeService;
    @Resource
    private UserToCourseService userToCourseService;

    /**
     * 通过文件插入数据
     * @param fileName 文件完整路径
     * @param headers 规定的表头
     * @param rowMapper 行映射函数
     * @return Msg
     * @param <T> 泛型
     * @throws Exception 异常
     */
    private <T> Msg insertDataByFile(String fileName, String[] headers, FileUploadFunction<Row, T> rowMapper) throws Exception {
        // 读取文件
        Path excelFile = Paths.get(fileName);
        InputStream is = Files.newInputStream(excelFile);
        // 创建工作簿
        Workbook hssfWorkbook = createWorkbook(is, fileName);
        // 如果工作簿为空，返回文件格式不正确
        if (hssfWorkbook == null) {
            is.close();
            Files.deleteIfExists(excelFile);
            return Msg.notLegal("文件格式不正确");
        }
        // 创建一个列表，用于存放数据
        List<T> list = new ArrayList<>();
        // 获取工作簿中的表单数量
        int numberOfSheets = hssfWorkbook.getNumberOfSheets();
        // 遍历每个表单
        for (int numSheet = 0; numSheet < numberOfSheets; numSheet++) {
            // 获取表单
            Sheet hssfSheet = hssfWorkbook.getSheetAt(numSheet);
            // 如果表单为空，跳过
            if (hssfSheet == null) {
                continue;
            }
            // 获取表单的最后一行
            int lastRowNum = hssfSheet.getLastRowNum();
            // 获取表单的第四行，即超管上传的Excel表的数据表头
            Row header = hssfSheet.getRow(3);

            // 检查表头是否合法
            for (int i = 0; i < headers.length; i++) {
                Cell nowCell = header.getCell(i);
                // 如果当前单元格为空或者当前单元格的值不等于规定的表头，返回不合法
                if (nowCell == null || !nowCell.toString().equals(headers[i])) {
                    is.close();
                    return Msg.notLegal("请不要修改文件模板");
                }
            }

            // 从第六行开始读取数据
            for (int rowNum = 5; rowNum <= lastRowNum; rowNum++) {
                Row hssfRow = hssfSheet.getRow(rowNum);
                if (hssfRow != null) {
                    DataFormatter dataFormatter = new DataFormatter();
                    T item = rowMapper.apply(hssfRow);
                    if (item != null) {
                        list.add(item);
                    }
                }
            }
        }
        // 关闭输入流
        is.close();
        HashMap<String, Object> map = new HashMap<>();
        // 返回数据
        map.put("fileName", fileName.substring(fileName.lastIndexOf("/") + 1));
        map.put("dataList", list);
        return Msg.success("获取成功", map);
    }

    @Override
    public Msg insertUserByFile(String fileName) throws Exception {
        return insertDataByFile(fileName, new String[]{"用户名", "初始密码", "用户类型", "班级编号", "学校编号"}, row -> {
            // 创建一个数据格式化对象
            DataFormatter dataFormatter = new DataFormatter();
            User user = new User();
            // 分别获取每一行的单元格
            Cell name = row.getCell(0);
            Cell password = row.getCell(1);
            Cell role = row.getCell(2);
            Cell classId = row.getCell(3);
            Cell schoolId = row.getCell(4);
            // 跳过空行
            if (name == null || password == null || role == null || classId == null || schoolId == null) {
                return null;
            }

            // 格式化单元格的值
            String nameStr = dataFormatter.formatCellValue(name);
            String passwordStr = dataFormatter.formatCellValue(password);
            String roleStr = dataFormatter.formatCellValue(role);
            String classIdStr = dataFormatter.formatCellValue(classId);
            String schoolIdStr = dataFormatter.formatCellValue(schoolId);

            if (StringUtil.isBlank(nameStr) || StringUtil.isBlank(passwordStr) || StringUtil.isBlank(roleStr)
                    || StringUtil.isBlank(classIdStr) || StringUtil.isBlank(schoolIdStr)) {
                return null; // 跳过空值
            }
            // 设置用户的属性
            user.setName(nameStr);
            user.setPassword(passwordStr);
            user.setRole(Integer.valueOf(roleStr));
            user.setAvatar(UserConst.DEFAULT_AVATAR_PATH);
            user.setSchoolId(Integer.valueOf(schoolIdStr));
            user.setClassId(Integer.valueOf(classIdStr));

            return user;
        });
    }

    @Override
    public Msg insertSchoolByFile(String fileName) throws Exception {
        return insertDataByFile(fileName, new String[]{"学校名称"}, row -> {
            // 创建一个数据格式化对象
            DataFormatter dataFormatter = new DataFormatter();
            School school = new School();
            // 获取第一列的单元格
            Cell name = row.getCell(0);

            if (name == null) {
                return null; // 跳过空行
            }

            String nameStr = dataFormatter.formatCellValue(name);
            if (StringUtil.isBlank(nameStr)) {
                return null; // 跳过空值
            }

            school.setName(nameStr);
            return school;
        });
    }

    @Override
    public Msg insertClassByFile(String fileName) throws Exception {
        return insertDataByFile(fileName, new String[]{"班级名称","年级","学校编号"}, row -> {
            // 创建一个数据格式化对象
            DataFormatter dataFormatter = new DataFormatter();
            Classe classe = new Classe();
            // 获取第一列和第二列的单元格
            Cell name = row.getCell(0);
            Cell grade = row.getCell(1);
            Cell schoolId = row.getCell(2);

            if (name == null || schoolId == null) {
                return null; // 跳过空行
            }

            String nameStr = dataFormatter.formatCellValue(name);
            String schoolIdStr = dataFormatter.formatCellValue(schoolId);
            String gradeStr = dataFormatter.formatCellValue(grade);
            if (StringUtil.isBlank(nameStr) || StringUtil.isBlank(schoolIdStr)) {
                return null; // 跳过空值
            }

            classe.setName(nameStr);
            classe.setSchoolId(Integer.valueOf(schoolIdStr));
            classe.setGrade(gradeStr);
            return classe;
        });
    }
    @Override
    public Msg insertUserByFileConfirm(String fileName) throws Exception {
        // 记录开始时间
        long begin = System.currentTimeMillis();
        // 调用上面的方法，获取用户列表
        Msg msg = insertUserByFile(StringConstant.UPLOAD_USER_EXCEL_FOLDER + "/" + fileName);
        // 如果状态码不是200，直接返回
        if (msg.getCode() != MsgCode.SUCCESS.getCode()) {
            return Msg.fail("保存失败");
        }
        // 拿到用户列表
        HashMap<String, Object> data = (HashMap<String, Object>) msg.getData();
        List<User> userList = (List<User>) data.get("dataList");
        // 每批次处理的用户数量
        int batchSize = 1000;
        int totalCount = userList.size();
        int batchCount = (int) Math.ceil((double) totalCount / batchSize);

        // 创建一个集合，用于存放所有批次的异步操作
        List<CompletableFuture<Void>> futures = new ArrayList<>();
        // 按照批次数，分割用户列表
        for (int i = 0; i < batchCount; i++) {
            // 计算每个批次的开始索引和结束索引
            int fromIndex = i * batchSize;
            int toIndex = Math.min((i + 1) * batchSize, totalCount);
            // 截取每个批次的用户列表
            List<User> batchList = new CopyOnWriteArrayList<>(userList.subList(fromIndex, toIndex));
            // 异步操作
            CompletableFuture<Void> future = CompletableFuture.runAsync(() -> {
                processBatch(batchList);
            });
            // 将异步操作添加到集合中
            futures.add(future);
        }

        // 等待所有批次的异步操作完成
        CompletableFuture<Void>[] futureArray = futures.toArray(new CompletableFuture[0]);
        // allOf()方法接收一个泛型参数，表示所有异步操作的返回值类型
        CompletableFuture<Void> allOf = CompletableFuture.allOf(futureArray);
        // join()方法会阻塞当前线程，直到所有异步操作完成
        allOf.join();
        // 记录结束时间
        long end = System.currentTimeMillis();
        // 计算耗时 秒
        long time = (end - begin) / 1000;
        System.out.println("耗时：" + time + "秒");
        // 返回结果
        // TODO 这里返回的是总添加个数，而不是成功个数
        return Msg.success("成功添加 " + totalCount + " 位用户");
    }

    private void processBatch(List<User> batchList) {
        // 创建两个集合，用于存放失败的用户和需要移除的元素
        List<User> failUser = new ArrayList<>();
        List<User> elementsToRemove = new ArrayList<>();

        // 提取所有用户的 name
        List<String> name = batchList.stream()
                .map(User::getName)
                .collect(Collectors.toList());

        // 一次性查询数据库中已存在的 name
        LambdaQueryWrapper<User> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.in(User::getName, name);
        List<User> existingUsers = userService.list(queryWrapper);

        // 使用 Set 提高查找效率
        Set<String> existingSchoolNumbers = existingUsers.stream()
                .map(User::getName)
                .collect(Collectors.toSet());

        // 进行比对并处理
        for (User user : batchList) {
            if (existingSchoolNumbers.contains(user.getName())) {
                // 如果数据库中已存在该用户，将其移除
                elementsToRemove.add(user);
                // 添加到失败列表
                failUser.add(user);
                System.out.println("不要插入重复的用户: " + user.getName());
            } else {
                // 对密码进行加密
                user.setPassword(MD5Util.encodeByMd5(user.getPassword()));
            }
        }
        // 批量移除需要移除的元素
        batchList.removeAll(elementsToRemove);
        // 批量插入
        userService.saveBatch(batchList);
        // 输出结果
        System.out.println("插入成功的数据条数：" + batchList.size());
        System.out.println("插入失败的数据条数：" + failUser.size());
    }

    /**
     * 针对班级和学校通用的简单批量插入数据方法
     * @param fileName
     * @param folderPath
     * @param insertDataFunction
     * @param processDataFunction
     * @param downloadDataFunction
     * @return
     * @throws Exception
     */
    private Msg simpleInsertDataByFileConfirm(
            String fileName,
            String folderPath,
            FileUploadFunction<String, Msg> insertDataFunction,
            Consumer<List<?>> processDataFunction,
            FileUploadFunction<List<?>, String> downloadDataFunction) throws Exception {

        // 调用上面的方法，获取数据列表
        Msg msg = insertDataFunction.apply(folderPath + "/" + fileName);

        // 如果状态码不是200，直接返回
        if (msg.getCode() != MsgCode.SUCCESS.getCode()) {
            return Msg.fail("保存失败");
        }

        // 拿到数据列表
        HashMap<String, Object> data = (HashMap<String, Object>) msg.getData();
        List<?> dataList = (List<?>) data.get("dataList");

        // 批量处理数据
        processDataFunction.accept(dataList);

        // 生成 Excel 文件
        String excelFileName = downloadDataFunction.apply(dataList);

        // 返回结果，包含生成的 Excel 文件名
        return Msg.success("成功添加 " + dataList.size() + " 条数据", excelFileName);
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public Msg insertSchoolByFileConfirm(String fileName) throws Exception {
        return simpleInsertDataByFileConfirm(
                fileName,
                StringConstant.UPLOAD_SCHOOL_EXCEL_FOLDER,
                this::insertSchoolByFile,
                // 使用批量处理学校数据的方法
                (List<?> dataList) -> schoolService.saveBatch((Collection<School>) dataList),
                // 使用生成Excel文件的方法,将插入成功的数据生成Excel表并保存
                (List<?> dataList) -> ExcelUtil.writeSchoolDataToExcel((List<School>) dataList)
        );
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public Msg insertClassByFileConfirm(String fileName) throws Exception {
        return simpleInsertDataByFileConfirm(
                fileName,
                StringConstant.UPLOAD_CLASS_EXCEL_FOLDER,
                this::insertClassByFile,
                // 使用批量处理班级数据的方法
                (List<?> dataList) -> classeService.saveBatch((Collection<Classe>) dataList),
                // 使用生成Excel文件的方法,将插入成功的数据生成Excel表并保存
                (List<?> dataList) -> ExcelUtil.writeClassDataToExcel((List<Classe>) dataList)
        );
    }


    @Override
    public Msg updateUser(UpdateUserDTO updateUserDTO) throws Exception {
        // TODO 这里增加判断用户类型是否合法的校验注解  可以考虑自定义注解
        // 将dto转换为实体类
        User user = DTOUtils.convertDtoToDo(updateUserDTO, User.class, UpdateUserDTO::getUserId, UpdateUserDTO::getName,
                UpdateUserDTO::getRole, UpdateUserDTO::getSchoolId, UpdateUserDTO::getClassId,
                UpdateUserDTO::getPhone, UpdateUserDTO::getEmail);
        // 如果密码不为空，对密码进行加密，否则不更新密码
        user.setPassword(updateUserDTO.getPassword() == null ? null : MD5Util.encodeByMd5WithSalt(updateUserDTO.getPassword(), SecretConst.LOGIN_SALT));
        return userService.updateById(user) ? Msg.success("更新成功") : Msg.fail("更新失败");
    }

    /**
     * 创建工作簿
     * @param is 输入流
     * @param fileName
     * @return
     * @throws Exception
     */
    private Workbook createWorkbook(InputStream is, String fileName) throws Exception {
        // 根据文件名后缀判断文件类型
        if (fileName.endsWith("xlsx")) {
            return new XSSFWorkbook(is);
        } else if (fileName.endsWith("xls")) {
            return new HSSFWorkbook(is);
        }
        return null;
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public Msg insertClassToCourse(ClasseToCourseDTO classeToCourseDTO) throws Exception {
        // 获取班级id和课程id
        List<Integer> classeIds = classeToCourseDTO.getClasseIds();
        List<Integer> courseIds = classeToCourseDTO.getCourseIds();

        // 根据所有班级ID获取所有学生
        List<User> userList = userService.list(new LambdaQueryWrapper<User>()
                .in(User::getClassId, classeIds)
                .eq(User::getRole, Role.STUDENT));

        // 如果没有学生，直接返回失败
        if (userList.isEmpty()) {
            return Msg.fail("对应班级没有学生");
        }

        // 存储要插入的所有关联数据
        List<UserToCourse> userToCourseList = new ArrayList<>(userList.size() * courseIds.size());

        // 遍历每个学生
        for (User user : userList) {
            // 遍历每个课程ID，插入学生和课程的关联
            courseIds.forEach(courseId -> userToCourseList.add(new UserToCourse(user.getUserId(), courseId)));
        }

        // 根据实际需求调整批次大小, 批量插入
        int batchSize = 1000;
        for (int i = 0; i < userToCourseList.size(); i += batchSize) {
            int end = Math.min(i + batchSize, userToCourseList.size());
            // 调用自定义的批量插入方法, 数据重复时不抛出唯一约束异常
            userToCourseService.customSaveBatch(userToCourseList.subList(i, end));
        }
        return Msg.success("操作成功");
    }
}




