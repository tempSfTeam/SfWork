package com.tempsfteam.class_tool.service;

import com.tempsfteam.class_tool.bean.Msg;
import com.tempsfteam.class_tool.dto.ClasseToCourseDTO;
import com.tempsfteam.class_tool.dto.UpdateUserDTO;

/**
 * @author ADACHI
 */
public interface ManageService {
    /**
     * 批量插入用户前的确认
     * @param fileName
     * @return
     * @throws Exception
     */
    Msg insertUserByFile(String fileName) throws Exception;

    /**
     * 批量插入学校前的确认
     * @param fileName
     * @return
     * @throws Exception
     */
    Msg insertSchoolByFile(String fileName) throws Exception;

    /**
     * 批量插入班级前的确认
     * @param fileName
     * @return
     * @throws Exception
     */
    Msg insertClassByFile(String fileName) throws Exception;

    /**
     * 真正批量插入用户
     * @param fileName
     * @return
     * @throws Exception
     */
    Msg insertUserByFileConfirm(String fileName) throws Exception;

    /**
     * 真正批量插入学校
     * @param fileName
     * @return
     * @throws Exception
     */
    Msg insertSchoolByFileConfirm(String fileName) throws Exception;

    /**
     * 真正批量插入班级
     * @param fileName
     * @return
     * @throws Exception
     */
    Msg insertClassByFileConfirm(String fileName) throws Exception;

    /**
     * 更新用户信息
     * @param updateUserDTO
     * @return
     * @throws Exception
     */

    Msg updateUser(UpdateUserDTO updateUserDTO) throws Exception;

    /**
     * 添加班级的课程授权
     * @param classeToCourseDTO
     * @return
     * @throws Exception
     */
    Msg insertClassToCourse(ClasseToCourseDTO classeToCourseDTO) throws Exception;


}
