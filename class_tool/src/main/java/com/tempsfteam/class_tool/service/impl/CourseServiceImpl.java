package com.tempsfteam.class_tool.service.impl;

import cn.dev33.satoken.exception.NotLoginException;
import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.tempsfteam.class_tool.bean.Msg;
import com.tempsfteam.class_tool.bean.UserData;
import com.tempsfteam.class_tool.constant.role.Role;
import com.tempsfteam.class_tool.dto.CourseDTO;
import com.tempsfteam.class_tool.entity.Course;
import com.tempsfteam.class_tool.entity.CourseToProfession;
import com.tempsfteam.class_tool.mapper.CourseMapper;
import com.tempsfteam.class_tool.service.CourseService;
import com.tempsfteam.class_tool.service.CourseToProfessionService;
import com.tempsfteam.class_tool.service.UserService;
import com.tempsfteam.class_tool.service.UserToCourseService;
import com.tempsfteam.class_tool.util.FileUtil;
import com.tempsfteam.class_tool.util.RedisUtil;
import com.tempsfteam.class_tool.vo.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.Resource;
import java.io.File;
import java.util.*;
import java.util.stream.Collectors;

import static com.tempsfteam.class_tool.constant.PermissionConst.*;

/**
 * @author hypocodeemia
 * @description 针对表【course】的数据库操作Service实现
 * @createDate 2024-09-10 14:42:23
 */
@Service
public class CourseServiceImpl extends ServiceImpl<CourseMapper, Course>
        implements CourseService {
    @Resource
    RedisUtil redisUtil;
    @Resource
    CourseToProfessionService courseToProfessionService;
    @Resource
    UserService userService;
    @Resource
    UserToCourseService userToCourseService;

    @Value("${image.pre}")
    private String pre;

    @Value("${image.courseIcon}")
    private String courseIconFolder;

    private final String redisKeyStr = "CourseClick";


    @Override
    @Transactional
    public Msg addCourse(String name, String description, Long managerId, List<Integer> professionIds, MultipartFile image) {
        // 0.判断传递参数的规范性
        if (!isValidProfessionIdList(professionIds)) {
            // 如果professionIds规范性存在问题(没有检测是否真正存在)
            return Msg.notLegal("请确保传递的课程科目的规范性，且没有重复");
        }
        if( managerId<=0 || !isAbleToManageCourse(managerId)){
            // 如果参数的managerId指向的用户不存在或者不是课程管理员
            return Msg.notLegal("请选取权限足够的用户来负责课程");
        }

        Course course = new Course(name,description,pre + "courseIcon" + "/" +"default.jpg",managerId);
        // 1.存储进入mysql
        boolean isSaved = this.save(course);
        // 2.判断是否存储成功
        if (isSaved) {
            // 2.a 成功

            // 3.存储进入redis
            try {
                redisUtil.addClick(redisKeyStr,course.getCourseId());
            } catch (Exception e) {
                log.error("Redis 的课程的浏览记录添加失败", e);
                // 手动抛出异常，触发事务回滚（交给ExceptionController）
                throw new RuntimeException("Redis 的课程的浏览记录添加失败");
            }

            // 4.存储课程和课程科目中间表
            List<CourseToProfession> courseToProfessionList = new ArrayList<>();
            for (Integer professionId : professionIds) {
                CourseToProfession courseToProfession = new CourseToProfession(course.getCourseId(), professionId);
                courseToProfessionList.add(courseToProfession);
            }
            courseToProfessionService.saveBatch(courseToProfessionList);

            // 5.上传图片
            Msg uploadMsg;
            try {
                uploadMsg =  upload(image, course.getCourseId());
            } catch (Exception e) {
                log.error("图片上传失败", e);
                // 手动抛出异常，触发事务回滚（交给ExceptionController）
                throw new RuntimeException("图片上传失败");
            }
            // 设置icon
            course.setIcon((String) uploadMsg.getData());

            // 6.更新icon
            this.updateById(course);

            return Msg.success("添加课程成功", course.getCourseId(), null);
        } else {
            // 2.b 失败
            return Msg.fail("添加课程失败");
        }
    }

    @Override
    @Transactional
    public Msg deleteCourse(Integer courseId) {
        // 确保确实有权限删除(①有COURSE_ADMIN_DELETE 或 ②有COURSE_DELETE且是manager)
        if(!isAuthorizedForCourseDelete(courseId)){
            // 如果权限不够
            return Msg.notPermitted("虽具备删除课程的权限，但并非本课程的管理人也非超管");
        }

        // 1.mysql删除
        boolean isRemoved = this.removeById(courseId);
        // 2.判断mysql是否删除成功
        if(isRemoved){
            // 3.a 成功
            try {
                // ?.删除课程和课程科目中间表中的数据（成功与否的判断留给@Transactional）
                courseToProfessionService.deleteByCourseId(courseId);
                // ?.删除用户和课程中间表中的数据（成功与否的判断留给@Transactional）
                userToCourseService.deleteUserToCourseByCourseId(courseId);
                // 3.redis删除
                redisUtil.deleteSortSet(redisKeyStr,courseId);

            } catch (Exception e) {
                log.error("Redis 的课程浏览次数记录删除失败", e);
                // 手动抛出异常，触发事务回滚（交给ExceptionController不知道行不行）
                throw new RuntimeException("Redis 的课程浏览次数记录删除失败");
            }
        }else {
            // 3.b 失败
            return Msg.fail("删除课程失败");
        }
        return  Msg.success();

    }

    @Override
    public void plusCourseClick(Integer courseId) {
        redisUtil.plusClick(redisKeyStr,courseId);
    }


    @Override
    public Msg updateCourseInfo(CourseDTO courseDTO,MultipartFile image) {
        // 1.确保 ①有COURSE_ADMIN_UPDATE 或 ②有COURSE_UPDATE且是manager
        if(!isAuthorizedForCourseUpdate(courseDTO.getCourseId())){
            return Msg.notPermitted("虽具备更新课程的权限，但并非本课程的管理人也非超管");
        }

        // 2.判断图片要不要改
        // 先获取原本的icon
        Course byId = this.getById(courseDTO.getCourseId());
        if(byId==null){
            return Msg.fail("目标课程不存在");
        }

        if(FileUtil.checkNothing(image)){
            // 如果不打算改图片，那就保持原来的
            courseDTO.setIcon(byId.getIcon());
        }else {
            // 如果打算改，那就上传然后改
            try {
                Msg uploadMsg = upload(image, courseDTO.getCourseId());
                courseDTO.setIcon((String) uploadMsg.getData());
            } catch (Exception e) {
                log.error("图片上传失败", e);
                // 手动抛出异常，触发事务回滚（交给ExceptionController）
                throw new RuntimeException("图片上传失败");
            }
        }

        // 3.改课程信息
        boolean result;

        //  先鉴权(①有COURSE_ADMIN_UPDATE,允许改所有 ②只有COURSE_UPDATE,能改manager_id字段外的 ③两个权限都没有，拒绝)
        if(StpUtil.hasPermission(COURSE_ADMIN_UPDATE)){
            result = this.updateById(new Course(courseDTO));
        }else if(StpUtil.hasPermission(COURSE_UPDATE)){
            int affectedRows = this.getBaseMapper().updateCourseExceptManagerId(courseDTO);
            result = affectedRows>0;
        }else {
            return Msg.fail("权限不足");
        }

        return result ? Msg.success(courseDTO.getIcon())
                : Msg.fail("更改没有产生影响");
    }

    @Override
    public Msg listAllCourse() {
        return Msg.success("以下为全部的课程",this.list());
    }

    // TODO:等前端替换完毕，把这边删掉
    @Override
    public Msg listCourseByRole() {
        // 获取用户信息
        UserData userData = (UserData) StpUtil.getSession().get("userData");
        Long userId = userData.getUserId();
        Integer role = userData.getRole();
        // 创建Msg的data
        List<CourseVO> courseVOListByUserId;
        // 创建Msg的message
        String message;
        switch (role){
            // 学生
            case 0:
                courseVOListByUserId = this.getBaseMapper().getCourseVOListByUserId(userId);
                message = "身份:学生,下面是你加入的课程";
                break;
            // 教师
            case 1:
                courseVOListByUserId = this.getBaseMapper().getCourseVOListByUserId(userId);
                message = "身份:教师,下面是你参与的课程";
                break;
            // 课程管理员
            case 2:
                courseVOListByUserId = this.getBaseMapper().getCourseListByManagerId(userId);
                message = "身份:课程管理员,下面是你管理的课程";
                break;
            // 超管
            case 3:
                courseVOListByUserId = this.getBaseMapper().getAllCourseVOList();
                message = "身份:超级管理员,下面是全部课程";
                break;
            default:
                return Msg.fail("未知权限");
        }
        // 获取Key为CourseClick的Sorted Set结构的全部数据(从本地缓存拿)
        Map<Object, Double> sortedSetWithScores = (Map<Object, Double>) redisUtil.getValueFromCache(redisKeyStr);

        // 遍历获取到的Course
        for (CourseVO courseVO : courseVOListByUserId) {
            // 1.设置点击数
            courseVO.setClick(sortedSetWithScores.get(courseVO.getCourseId()).intValue());
            // 2.把逗号隔开的字符串变成List<Integer>
            String professionIdsStr = courseVO.getProfessionIdsStr();
            if(professionIdsStr!=null){
                String[] split = professionIdsStr.split(",");
                List<Integer> integerList = Arrays.asList(split).stream()
                        .map(Integer::parseInt)
                        .collect(Collectors.toList());
                courseVO.setProfessionIds(integerList);
            }
        }

        return Msg.success(message,courseVOListByUserId);
    }

    @Override
    public Msg getOne(Integer courseId) {
        // 1.判断有无权限
        if(!isAuthorizedForCourseDetails(courseId)){
            return Msg.notPermitted("您没有权限进行此操作");
        }
        // 2.有的话就获取
        CourseVO courseBaseInfo = this.getBaseMapper().getCourseVOBaseInfoById(courseId);
        if (courseBaseInfo!= null) {
            List<SimpleExperiment> simpleExperiments = this.getBaseMapper().getSimpleExperimentsById(courseId);
            courseBaseInfo.setSimpleExperiments(new ArrayList<>(simpleExperiments));
        }
        // 3.添加浏览数
        this.plusCourseClick(courseId);
        // 4.返回结果
        return Msg.success("以下为课程详细信息",courseBaseInfo);
    }

    @Override
    public Msg listPopularCourse(Integer number) {
        // 携带浏览数的Course集合
        List<PopularCourseVO> popularCourseVoS = new ArrayList<>();
        UserData userData;
        // ①判断是否需要根据偏好呈现热门课程(目前只有教师需要)
        try {
            userData = (UserData) StpUtil.getSession().get("userData");
        }catch (NotLoginException e){
            userData = null;
        }

        // ②情况(1):如果有携带token(登录了) 而且 是教师(需要根据"偏好"去呈现热门课程) 而且 有至少一个课程的权限
        if(userData != null && Objects.equals(userData.getRole(), Role.TEACHER)){
            // 1.获取当前教师有权限的课程对应的学习对象
            List<Integer> courseTypePreference = this.getBaseMapper().getCourseTypePreference(userData.getUserId());
            // !! 可能courseTypePreference没有东西，如果这个教师没有任何权限的话，那就按情况 (2)进行
            if(!courseTypePreference.isEmpty()){
                // 2.通过这些学习对象去mysql获取完整的Course信息(没有浏览数)
                List<Course> coursesByCourseTypeIds = this.getBaseMapper().getCoursesByCourseTypeIds(courseTypePreference);
                // 3.获取缓存的全部的课程浏览数记录(从redis拿到的)
                Map<Object, Double> sortedSetWithScores = (Map<Object, Double>) redisUtil.getValueFromCache(redisKeyStr);
                // 处理成热门课程的VO
                for (Course course : coursesByCourseTypeIds) {
                    Double score = sortedSetWithScores.get(course.getCourseId());
                    if (score!= null) {
                        // 转换
                        popularCourseVoS.add(new PopularCourseVO(course,score));
                    }
                }
                // 4.取浏览量最高的number个
                // 先排序
                List<PopularCourseVO> sortedCourses = popularCourseVoS.stream()
                        .sorted((c1, c2) -> Integer.compare(c2.getClick(), c1.getClick()))
                        .collect(Collectors.toList());

                // 判断，要是要的数量比全部的数量少，那就取需要的数量
                if(sortedCourses.size()>number){
                    sortedCourses = sortedCourses.subList(0, number);
                }

                // 4.返回结果(接取number个浏览数最高的)
                return Msg.success("以下为热门课程", sortedCourses);
            }
        }

        // ②情况(2):如果 没有携带token 或者说 不是教师 或者说 是老师但是没有任何权限(老样子，啥都呈现)
        // 使用新方法获取热门课程 ID 和分数的映射
        Map<Object, Double> topDataWithScores = redisUtil.getTopMembersAndScores(redisKeyStr, number);

        // 将热门课程 ID 提取出来并存入列表
        List<Integer> courseIdList = new ArrayList<>();
        for (Object obj : topDataWithScores.keySet()) {
            if (obj instanceof Integer) {
                courseIdList.add((Integer) obj);
            }
        }

        // 获取课程具体信息
        List<Course> courses = this.listByIds(courseIdList);

        // 处理成热门课程的VO
        for (Course course : courses) {
            Double score = topDataWithScores.get(course.getCourseId());
            if (score!= null) {
                // 转换
                popularCourseVoS.add(new PopularCourseVO(course,score));
            }
        }
        // 返回结果
        return Msg.success("以下为热门课程", popularCourseVoS);

    }

    @Override
    public boolean isAuthorizedForCourseDetails(Integer courseId) {
        UserData userData = (UserData) StpUtil.getSession().get("userData");
        Long userId = userData.getUserId();
        int rows;
        if(StpUtil.hasPermission(COURSE_ADMIN_QUERY)){
            // 有COURSE_ADMIN_QUERY:不管user_to_course里面怎么样都放行
            return true;
        }else if(StpUtil.hasPermission(COURSE_COURSE_MANAGER_QUERY)){
            // 只有COURSE_COURSE_MANAGER_QUERY:需要是manager才放行
            rows = this.getBaseMapper().checkIsCourseManager(userId,courseId);
            return rows>0;
        }else {
            // 两权限都没有，那就查user_to_course
            rows = this.getBaseMapper().checkUserToCourseExists(userId, courseId);
            return rows>0;
        }

    }

    @Override
    public boolean isAuthorizedForCourseUpdate(Integer courseId) {
        UserData userData = (UserData) StpUtil.getSession().get("userData");
        Long userId = userData.getUserId();
        if(StpUtil.hasPermission(COURSE_ADMIN_UPDATE)){
            // 有COURSE_ADMIN_UPDATE:无论是不是manager都放行
            return true;
        }else if(StpUtil.hasPermission(COURSE_UPDATE)){
            // 只有COURSE_UPDATE:需要是manager才放行
            int rows = this.getBaseMapper().checkIsCourseManager(userId,courseId);
            return rows>0;
        }else {
            // 两权限都没有，不放行
            return false;
        }

    }

    @Override
    public boolean isAuthorizedForCourseDelete(Integer courseId) {
        UserData userData = (UserData) StpUtil.getSession().get("userData");
        Long userId = userData.getUserId();
        if(StpUtil.hasPermission(COURSE_ADMIN_DELETE)){
            // 有COURSE_ADMIN_DELETE:无论是不是manager都放行
            return true;
        }else if(StpUtil.hasPermission(COURSE_DELETE)){
            // 只有COURSE_DELETE:需要是manager才放行
            int rows = this.getBaseMapper().checkIsCourseManager(userId,courseId);
            return rows>0;
        }else {
            // 两权限都没有，不授权
            return false;
        }

    }

    // TODO:过阵子把这边改写优化（晚上赶工的，估摸着有地方改）
    @Override
    public Msg listByProfessionId(Page<Course> pageDTO, Integer professionId, String searchStr){
        // 获取用户信息
        UserData userData = (UserData) StpUtil.getSession().get("userData");
        Long userId = userData.getUserId();
        // 创建Msg的data
        Page<CourseVO> courseVOListByUserId;
        // 创建Msg的message
        String message;

        if(StpUtil.hasPermission(COURSE_ADMIN_QUERY)){
            // 如果有COURSE_ADMIN_QUERY,给全部
            courseVOListByUserId = this.getBaseMapper().getAllCourseVOListByProfessionId(pageDTO,professionId,searchStr);
            message = "权限:COURSE_ADMIN_QUERY,下面是目标课程科目下全部课程";
        }else if(StpUtil.hasPermission(COURSE_COURSE_MANAGER_QUERY)){
            // 如果只有COURSE_COURSE_MANAGER_QUERY,给manager是自己的课程
            courseVOListByUserId = this.getBaseMapper().getCourseListByManagerIdAndProfessionId(pageDTO,userId,professionId,searchStr);
            message = "权限:COURSE_COURSE_MANAGER_QUERY,下面是目标课程科目下你管理的课程";
        }else {
            // 如果两种权限都没有，那就按照user_to_course去呈现
            courseVOListByUserId = this.getBaseMapper().getCourseVOListByUserIdAndProfessionId(pageDTO,userId,professionId,searchStr);
            message = "下面是目标课程科目下被授权的课程";
        }

        // 获取Key为CourseClick的Sorted Set结构的全部数据(从本地缓存拿)
        Map<Object, Double> sortedSetWithScores = (Map<Object, Double>) redisUtil.getValueFromCache(redisKeyStr);

        // 遍历获取到的Course
        for (CourseVO courseVO : courseVOListByUserId.getRecords()) {
            // 设置点击数
            if(courseVO!=null){
                courseVO.setClick(sortedSetWithScores.get(courseVO.getCourseId()).intValue());
            }
        }

        return Msg.success(message,courseVOListByUserId);
    }

    @Override
    public boolean isValidProfessionIdList(List<Integer> professionIds) {
        Set<Integer> uniqueSet = new HashSet<>();
        for (Integer id : professionIds) {
            if (id <= 0) {
                return false;
            }
            if (!uniqueSet.add(id)) {
                return false;
            }
        }
        return true;
    }

    @Override
    public boolean isAbleToManageCourse(Long userId) {
        Integer rows = this.getBaseMapper().checkIsAbleToManageCourse(userId);
        return rows>0;
    }

    @Override
    public Msg upload(MultipartFile image, Integer id) throws Exception{
        if (image == null) {
            return Msg.fail("参数 image 异常");
        }

        String path = courseIconFolder;
        String typeStr = "courseIcon";

        File file = new File(path);
        if (!file.exists()) {
            file.mkdirs();
        }

        String ext = image.getOriginalFilename().substring(image.getOriginalFilename().lastIndexOf("."));
        String fileName = id + ext;
        String filePath = path + fileName;
        File tempFile = FileUtil.multipartFileToFile(image, filePath);
        // 检查文件是否为图片
        if (!FileUtil.checkImg(tempFile)) {
            FileUtil.deleteTempFile(tempFile);
            return Msg.fail("非图片文件!");
        }
        return Msg.success("上传成功", pre + typeStr + "/" + fileName);
    }

    @Override
    public Msg getAllUserCourseAllowance(Page<Course> pageDTO,Integer role,Integer searchType,String searchStr) {
        // 先判断要的是哪些user，获取userIds
        Page<Long> userIdsByCondition = this.getBaseMapper().getUserIdsByCondition(pageDTO, role, searchType, searchStr);
        // 根据userIds去获取CourseAllowanceVOList
        List<CourseAllowanceVO> userCourseAllowance = this.getBaseMapper().getUserCourseAllowance(userIdsByCondition.getRecords());

        // 组装
        Page<CourseAllowanceVO> courseAllowanceVOPage = new Page<>();
        courseAllowanceVOPage.setCurrent(userIdsByCondition.getCurrent());
        courseAllowanceVOPage.setSize(userIdsByCondition.getSize());
        courseAllowanceVOPage.setPages(userIdsByCondition.getPages());
        courseAllowanceVOPage.setTotal(userIdsByCondition.getTotal());
        courseAllowanceVOPage.setRecords(userCourseAllowance);

        return Msg.success("以下是 (学生/教师) 用户的课程授权情况",courseAllowanceVOPage);
    }

    @Override
    public Msg getSimpleCourseVO() {
        List<SimpleCourseVO> simpleCourseVO = this.getBaseMapper().getSimpleCourseVO();
        return Msg.success("以下是全部课程的极简信息",simpleCourseVO);
    }

    @Override
    public Msg getCourseConnection(Page<Course> pageDTO,String searchStr) {
        // 先判断要的是哪些course，获取courseIds
        Page<Integer> courseIdsByCondition = this.getBaseMapper().getCourseIdsByCondition(pageDTO, searchStr);
        // 根据courseIds去获取CourseConnectionVOList
        List<CourseConnectionVO> courseConnection = this.getBaseMapper().getCourseConnection(courseIdsByCondition.getRecords());

        // 组装
        Page<CourseConnectionVO> CourseConnectionVOPage = new Page<>();
        CourseConnectionVOPage.setCurrent(courseIdsByCondition.getCurrent());
        CourseConnectionVOPage.setSize(courseIdsByCondition.getSize());
        CourseConnectionVOPage.setPages(courseIdsByCondition.getPages());
        CourseConnectionVOPage.setTotal(courseIdsByCondition.getTotal());
        CourseConnectionVOPage.setRecords(courseConnection);

        return Msg.success("以下是课程与课程科目的关联情况",CourseConnectionVOPage);
    }


}

