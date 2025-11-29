package com.tempsfteam.class_tool.vo;

import com.tempsfteam.class_tool.constant.role.IdentityEnum;
import com.tempsfteam.class_tool.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserVO {
    private String name;
    private String avatar;
    private String phone;
    private String email;
    private String userRole;
    private Integer schoolId;
    private Integer classId;

    /**
     * 将 User 转换为 UserVO 的静态方法
     * @param user
     * @return
     */
    public static UserVO convertToUserVO(User user) {
        return new UserVO(
                user.getName(),
                user.getAvatar(),
                user.getPhone(),
                user.getEmail(),
                IdentityEnum.fromValue(user.getRole()).getUserRoleString(),
                user.getSchoolId(),
                user.getClassId()
        );
    }
}

