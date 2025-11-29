package com.tempsfteam.class_tool.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * @author hypocodeemia
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
// TODO:等前端接口切换完成，把professionIdsStr和professionIds删除
public class CourseVO {
    private Integer courseId;

    private String name;

    private String icon;

    private String professionIdsStr;

    private List<Integer> professionIds;

    private String description;

    private ArrayList<SimpleExperiment> simpleExperiments;

    private Integer click;

}