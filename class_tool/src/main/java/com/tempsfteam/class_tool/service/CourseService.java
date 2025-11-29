package com.tempsfteam.class_tool.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.tempsfteam.class_tool.bean.Msg;
import com.tempsfteam.class_tool.dto.CourseDTO;
import com.tempsfteam.class_tool.entity.Course;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * @author hypocodeemia
 * @description 针对表【course】的数据库操作Service
 * @createDate 2024-09-10 14:42:23
 */
public interface CourseService extends IService<Course> {
    /**
     * 添加课程
     * @param name          课程名字
     * @param description   课程简介
     * @param managerId     课程管理员id
     * @param professionIds 归属的课程科目
     * @param image         上传的图片
     * @return              Msg
     */
    Msg addCourse(String name, String description, Long managerId, List<Integer> professionIds, MultipartFile image);

    /**
     * 删除课程
     * @param courseId  课程id
     * @return          Msg
     */
    Msg deleteCourse(Integer courseId);

    /**
     * 给课程的浏览次数+1
     * @param courseId 课程id
     */
    void plusCourseClick(Integer courseId);

    /**
     * 更新课程基础信息
     * @param courseDTO courseDTO
     * @param image     image file
     * @return          Msg
     */
    Msg updateCourseInfo(CourseDTO courseDTO,MultipartFile image);

    /**
     * 获取全部课程
     * @return          Msg
     */
    Msg listAllCourse();

    /**
     * 根据用户的角色去获取它应该看到的课程
     * @return          Msg
     */
    Msg listCourseByRole();

    /**
     * 获取特定的一个课程
     * @param courseId 课程id
     * @return         Msg
     */
    Msg getOne(Integer courseId);

    /**
     * 从redis中获取点击数最多的n个课程的id，然后去mysql补齐
     * @param number    需要的热门课程的数量
     * @return          Msg
     */
    Msg listPopularCourse (Integer number);

    /**
     * 判断有无权限查看课程详细信息
     * @param courseId 课程id
     * @return         Msg
     */
    boolean isAuthorizedForCourseDetails(Integer courseId);

    /**
     * 判断有无权限修改课程信息(即 ①有COURSE_ADMIN_UPDATE 或 ②有COURSE_UPDATE且是manager)
     * @param courseId 课程id
     * @return         Msg
     */
    boolean isAuthorizedForCourseUpdate(Integer courseId);


    /**
     * 判断有无权限删除课程信息(即 ①有COURSE_ADMIN_DELETE 或 ②有COURSE_DELETE且是manager)
     * @param courseId 课程id
     * @return         Msg
     */
    boolean isAuthorizedForCourseDelete(Integer courseId);

    /**
     * 获取某个课程科目的课程
     * @param professionId  课程科目id
     * @return              Msg
     */
    Msg listByProfessionId(Page<Course> pageDTO, Integer professionId, String searchStr);

    /**
     * 判断列表中是否有重复值和小于等于 0 的值
     * @param professionIds List
     * @return              Msg
     */
    boolean isValidProfessionIdList(List<Integer> professionIds);

    /**
     * 判断用户是否能否担当course的manager
     * @param userId    用户id
     * @return          boolean
     */
    boolean isAbleToManageCourse(Long userId);

    /**
     * 上传图片，返回结果和icon值(异常抛出交给@Transactional)
     * @param image 图片
     * @param id    id
     * @return      Msg
     */
    Msg upload(MultipartFile image, Integer id) throws Exception;

    /**
     * 获取指定角色用户的course授权情况
     * @param role          指定的用户角色
     * @param searchType    搜索的种类 1->userId ; 2-> user的name
     * @param searchStr     搜索的内容
     * @return              Msg
     */
    Msg getAllUserCourseAllowance(Page<Course> pageDTO,Integer role,Integer searchType,String searchStr);

    /**
     * 获取List<SimpleCourseVO>
     * @return  Msg
     */
    Msg getSimpleCourseVO();

    Msg getCourseConnection(Page<Course> pageDTO,String searchStr);
}

