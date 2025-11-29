package com.tempsfteam.class_tool.bean;

import java.io.Serializable;
import java.lang.invoke.SerializedLambda;
import java.lang.reflect.Method;

/**
 * @author : IMG
 * @create : 2024/7/24
 */
@FunctionalInterface
@SuppressWarnings("unused")
public interface FileUploadFunction<T, R> extends Serializable {
    /**
     * 用于可抛出异常的方法引用
     * @param t
     * @return
     * @throws Exception
     */
    R apply(T t) throws Exception;

    /**
     * 获取 SerializedLambda
     * @return SerializedLambda
     * @throws Exception 异常
     */
    default SerializedLambda getSerializedLambda() throws Exception{
        Method write = this.getClass().getDeclaredMethod("writeReplace");
        write.setAccessible(true);
        return (SerializedLambda) write.invoke(this);
    }

    /**
     * 获取实现类
     * @return 实现类
     */
    default String getImplClass(){
        try {
            return getSerializedLambda().getImplClass();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    /**
     * 获取实现方法名称
     * @return 实现方法名称
     */
    default String getImplMethodName() {
        try {
            return getSerializedLambda().getImplMethodName();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}