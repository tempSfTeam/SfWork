package com.tempsfteam.class_tool.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author hypocodeemia
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SortDTO {
    private Integer targetId;

    private Integer newSort;
}
