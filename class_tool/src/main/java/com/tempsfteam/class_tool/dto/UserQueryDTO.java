package com.tempsfteam.class_tool.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author ADACHI
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserQueryDTO {
    private Long userId;
    private Integer role;
    private Integer current;
    private Integer size;


}
