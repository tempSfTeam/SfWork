package com.tempsfteam.class_tool.util;

import com.tempsfteam.class_tool.bean.Function;
import com.tempsfteam.class_tool.exception.ServiceException;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.HashSet;

/**
 * @author : IMG
 * @create : 2024/7/24
 */
@SuppressWarnings("unused")
public class DTOUtils {

    /**
     * 检查对象是否为空
     *
     * @param t         对象
     * @param functions 包含的属性
     * @param <T>       对象类型
     * @param <R>       属性类型
     */
    @SafeVarargs
    public static <T, R> void checkInclude(T t, Function<T, R>... functions) {
        for (Function<T, R> function : functions) {
            R object = function.apply(t);
            isNull(object);
        }
    }

    /**
     * 检查对象是否为空
     *
     * @param t         对象
     * @param functions 排除的属性
     * @param <T>       对象类型
     * @param <R>       属性类型
     * @throws Exception 参数为空异常
     */
    @SafeVarargs
    public static <T, R> void checkExclude(T t, Function<T, R>... functions) throws Exception {
        Class<?> tClass = t.getClass();
        Method[] methods = tClass.getMethods();
        HashSet<String> excludeMethodSet = new HashSet<>();
        for (Function<T, R> function : functions) {
            String implMethodName = function.getImplMethodName();
            excludeMethodSet.add(implMethodName);
        }
        for (Method method : methods) {
            String methodName = method.getName();
            if (!excludeMethodSet.contains(methodName) && methodName.startsWith("get")) {
                Object object = method.invoke(t);
                isNull(object);
            }
        }
    }

    /**
     * 判断对象是否为空
     *
     * @param object 对象
     */
    private static void isNull(Object object) {
        if (object instanceof String) {
            if (StringUtil.isBlank((String) object)) {
                throw new ServiceException("参数缺失或为空");
            }
        } else {
            if (object == null) {
                throw new ServiceException("参数缺失或为空");
            }
        }
    }

    /**
     * 将 DTO 转换为 DO，根据指定的转换函数进行字段映射。
     *
     * @param dto       DTO 对象
     * @param doClass   DO 类
     * @param functions 指定的转换函数（按需处理的字段）
     * @param <T>       DTO 类型
     * @param <R>       DO 类型
     * @return 转换后的 DO 对象
     * @throws Exception 可能的异常
     */
    @SafeVarargs
    public static <T, R> R convertDtoToDo(T dto, Class<R> doClass, Function<T, ?>... functions) throws Exception {
        if (dto == null || doClass == null || functions == null) {
            throw new RuntimeException("参数不能为空");
        }

        R doObject = doClass.getDeclaredConstructor().newInstance();
        // 遍历指定的函数，并将结果应用到 DO 对象的字段上
        for (Function<T, ?> function : functions) {
            // 获取字段名
            String methodName = function.getImplMethodName();
            String fieldName = Character.toLowerCase(methodName.charAt(3)) + methodName.substring(4);

            try {
                Field doField = doClass.getDeclaredField(fieldName);
                doField.setAccessible(true);
                // 使用指定的 Function
                Object value = function.apply(dto);
                doField.set(doObject, value);
            } catch (NoSuchFieldException e) {
                // 如果DTO中不存在与DO中同名的字段
                throw new RuntimeException("DTO中不存在与DO中同名的字段", e);
            } catch (Exception e) {
                throw new RuntimeException("转换过程中发生异常", e);
            }

        }

        return doObject;
    }

}
