// models-umd.js - lightweight UMD-like models/DTO helpers for browser usage
// Updated to reflect latest backend commit (UserQueryDTO, Permission, PermissionInfo, User, UserVO)
// Place under: class_tool/src/main/resources/static/src/services/models-umd.js
(function () {
    // Ensure global namespace
    window.Models = window.Models || {};

    // Helper: copy known fields from plain object
    function pick(obj, keys) {
        const out = {};
        keys.forEach(k => {
            if (obj && Object.prototype.hasOwnProperty.call(obj, k)) out[k] = obj[k];
        });
        return out;
    }

    // Helper: safe parse date
    function parseDate(v) {
        if (!v) return null;
        const d = new Date(v);
        return isNaN(d.getTime()) ? null : d;
    }

    //
    // UserQueryDTO
    // A simple DTO used when requesting paged user lists / filters
    //
    function UserQueryDTO(data) {
        data = data || {};
        // Common pagination/filter fields (extend as backend specifies)
        this.page = data.page !== undefined ? Number(data.page) : (data.current || 1);
        this.size = data.size !== undefined ? Number(data.size) : (data.pageSize || 20);
        this.name = data.name || data.username || '';
        this.role = (data.role !== undefined) ? data.role : (data.userRole || null);
        this.schoolId = data.schoolId !== undefined ? data.schoolId : (data.orgId || null);
        this.status = data.status !== undefined ? data.status : null; // active/disabled etc.
        // preserve any extra fields
        this._raw = data;
    }
    UserQueryDTO.prototype.toPlain = function () {
        return {
            page: this.page,
            size: this.size,
            name: this.name,
            role: this.role,
            schoolId: this.schoolId,
            status: this.status
        };
    };

    //
    // Permission
    // Represents a single permission/resource (menu/operation)
    //
    function Permission(data) {
        data = data || {};
        this.id = data.id !== undefined ? data.id : (data.permissionId || null);
        this.code = data.code || data.permissionCode || data.permCode || null;
        this.name = data.name || data.permissionName || data.title || null;
        this.desc = data.desc || data.description || data.remark || null;
        this.parentId = data.parentId !== undefined ? data.parentId : (data.parent_id || null);
        this.type = data.type !== undefined ? data.type : (data.permissionType || null);
        this.sort = data.sort !== undefined ? data.sort : (data.orderNum || null);
        // preserve raw
        this._raw = data;
    }
    Permission.prototype.toPlain = function () {
        return {
            id: this.id,
            code: this.code,
            name: this.name,
            desc: this.desc,
            parentId: this.parentId,
            type: this.type,
            sort: this.sort
        };
    };

    //
    // PermissionInfo (new entity)
    // Additional meta info about a permission (backend added this recently)
    //
    function PermissionInfo(data) {
        data = data || {};
        this.id = data.id !== undefined ? data.id : null;
        this.permission = data.permission ? new Permission(data.permission) :
            (data.permissionId || data.permission_code ? new Permission(data) : null);
        this.extra = data.extra !== undefined ? data.extra : (data.meta || null);
        this.createdAt = parseDate(data.createdAt || data.createTime || data.created_at);
        this.updatedAt = parseDate(data.updatedAt || data.updateTime || data.updated_at);
        this._raw = data;
    }
    PermissionInfo.prototype.toPlain = function () {
        return {
            id: this.id,
            permission: this.permission ? this.permission.toPlain() : null,
            extra: this.extra,
            createdAt: this.createdAt ? this.createdAt.toISOString() : null,
            updatedAt: this.updatedAt ? this.updatedAt.toISOString() : null
        };
    };

    //
    // User (entity)
    //
    function User(data) {
        data = data || {};
        this.id = data.id !== undefined ? data.id : (data.userId || null);
        this.username = data.username || data.name || data.loginName || '';
        this.realName = data.realName || data.nickName || data.name || '';
        this.email = data.email || data.mail || null;
        this.mobile = data.mobile || data.phone || data.tel || null;
        this.avatar = data.avatar || data.headImg || data.avatarUrl || null;
        // userRole may be numeric or string; preserve original and attempt normalization later
        this.userRole = (data.userRole !== undefined) ? data.userRole : (data.role || null);
        this.roleCode = (data.roleCode !== undefined) ? Number(data.roleCode) : null;
        this.roleName = data.roleName || data.roleLabel || null;
        this.enabled = (data.enabled !== undefined) ? Boolean(data.enabled) : (data.status !== undefined ? data.status === 1 : true);
        this.permissions = Array.isArray(data.permissions) ? data.permissions.map(p => new Permission(p)) : [];
        this._raw = data;

        // If normalizeUserRole helper exists globally, use it to fill roleCode/roleName
        try {
            if ((this.roleCode === null || this.roleName === null) && window.normalizeUserRole) {
                const temp = { userRole: this.userRole };
                window.normalizeUserRole(temp);
                if (temp.roleCode !== undefined) this.roleCode = temp.roleCode;
                if (temp.roleName !== undefined) this.roleName = temp.roleName;
            }
        } catch (e) {}
    }
    User.prototype.toPlain = function () {
        return {
            id: this.id,
            username: this.username,
            realName: this.realName,
            email: this.email,
            mobile: this.mobile,
            avatar: this.avatar,
            userRole: this.userRole,
            roleCode: this.roleCode,
            roleName: this.roleName,
            enabled: this.enabled,
            permissions: this.permissions.map(p => (p && typeof p.toPlain === 'function') ? p.toPlain() : p)
        };
    };

    //
    // UserVO (view object)
    //
    function UserVO(data) {
        data = data || {};
        this.id = data.id !== undefined ? data.id : (data.userId || null);
        this.username = data.username || data.name || '';
        this.realName = data.realName || data.nickName || '';
        this.avatar = data.avatar || data.headImg || null;
        this.userRole = (data.userRole !== undefined) ? data.userRole : (data.role || null);
        this.roleCode = data.roleCode !== undefined ? Number(data.roleCode) : null;
        this.roleName = data.roleName || data.roleLabel || null;
        this.email = data.email || null;
        this.mobile = data.mobile || null;
        this.permissions = Array.isArray(data.permissions) ? data.permissions.map(pi => new PermissionInfo(pi)) : [];
        this.createdAt = parseDate(data.createdAt || data.createTime || data.created_at);
        this._raw = data;

        // normalize role if helper available
        try {
            if ((this.roleCode === null || this.roleName === null) && window.normalizeUserRole) {
                const tmp = { userRole: this.userRole };
                window.normalizeUserRole(tmp);
                if (tmp.roleCode !== undefined) this.roleCode = tmp.roleCode;
                if (tmp.roleName !== undefined) this.roleName = tmp.roleName;
            }
        } catch (e) {}
    }
    UserVO.prototype.toPlain = function () {
        return {
            id: this.id,
            username: this.username,
            realName: this.realName,
            avatar: this.avatar,
            userRole: this.userRole,
            roleCode: this.roleCode,
            roleName: this.roleName,
            email: this.email,
            mobile: this.mobile,
            permissions: this.permissions.map(p => (p && typeof p.toPlain === 'function') ? p.toPlain() : p),
            createdAt: this.createdAt ? this.createdAt.toISOString() : null
        };
    };

    // Export constructors
    window.Models.UserQueryDTO = UserQueryDTO;
    window.Models.Permission = Permission;
    window.Models.PermissionInfo = PermissionInfo;
    window.Models.User = User;
    window.Models.UserVO = UserVO;

    // convenience factory helpers
    window.Models.fromPlain = function (type, plain) {
        if (!type || !plain) return null;
        switch (type) {
            case 'User': return new User(plain);
            case 'UserVO': return new UserVO(plain);
            case 'UserQueryDTO': return new UserQueryDTO(plain);
            case 'Permission': return new Permission(plain);
            case 'PermissionInfo': return new PermissionInfo(plain);
            default: return plain;
        }
    };

    // keep a list of model names for introspection
    window.Models._names = ['UserQueryDTO','Permission','PermissionInfo','User','UserVO'];
})();