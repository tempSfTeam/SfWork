package com.tempsfteam.class_tool.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.tempsfteam.class_tool.bean.Msg;
import com.tempsfteam.class_tool.dto.CourseDTO;
import com.tempsfteam.class_tool.entity.Course;
import com.tempsfteam.class_tool.mapper.CourseMapper;
import com.tempsfteam.class_tool.service.CourseService;
import com.tempsfteam.class_tool.util.RedisUtil;
import com.tempsfteam.class_tool.vo.PopularCourseVO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

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

    private final String redisKeyStr = "CourseClick";


    @Override
    @Transactional
    public Msg addCourse(String name, String description, String icon, Integer managerId) {
        Course course = new Course(name,description,icon,managerId);
        // 1.存储进入mysql
        boolean isSaved = this.save(course);
        // 2.判断是否存储成功
        if (isSaved) {
            // 2.a 成功
            try {
                // 3.存储进入redis
                redisUtil.addClick(redisKeyStr,course.getCourseId());
            } catch (Exception e) {
                log.error("Redis 的课程的浏览记录添加失败", e);
                // 手动抛出异常，触发事务回滚（交给ExceptionController不知道行不行）
                throw new RuntimeException("Redis 的课程的浏览记录添加失败");
            }
            return Msg.success("添加课程成功", course.getCourseId(), null);
        } else {
            // 2.b 失败
            return Msg.fail("添加课程失败");
        }
    }

    @Override
    @Transactional
    public Msg deleteCourse(Integer courseId) {
        // 1.mysql删除
        boolean isRemoved = this.removeById(courseId);
        // 2.判断mysql是否删除成功
        if(isRemoved){
            // 2.a 成功
            try {
                // 3.redis删除
                redisUtil.deleteSortSet(redisKeyStr,courseId);
            } catch (Exception e) {
                log.error("Redis 的课程浏览次数记录删除失败", e);
                // 手动抛出异常，触发事务回滚（交给ExceptionController不知道行不行）
                throw new RuntimeException("Redis 的课程浏览次数记录删除失败");
            }
        }else {
            // 2.b 失败
            return Msg.fail("删除课程失败");
        }
        return  Msg.success();
    }

    @Override
    public void plusCourseClick(Integer courseId) {
        redisUtil.plusClick(redisKeyStr,courseId);
    }


    @Override
    public Msg updateCourseInfo(CourseDTO courseDTO) {
        return this.updateById(new Course(courseDTO)) ? Msg.success()
                : Msg.fail("更改课程信息失败");
    }

    @Override
    public Msg listAllCourse() {
        return Msg.success("以下为全部的课程",this.list());
    }

    @Override
    public Msg listCourseByRole() {
        return null;
    }

    @Override
    public Msg getOne(Integer courseId) {
        return Msg.success("以下为课程详细信息",this.getById(courseId));
    }

    @Override
    public Msg listPopularCourse(Integer number) {
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
        List<PopularCourseVO> popularCourseVoS = new ArrayList<>();
        // 处理成热门课程的VO
        for (Course course : courses) {
            Double score = topDataWithScores.get(course.getCourseId());
            if (score!= null) {
                // 转换
                popularCourseVoS.add(new PopularCourseVO(course,score));
            }
        }

        return Msg.success("以下为热门课程", popularCourseVoS);
    }


}

