package com.tempsfteam.class_tool.util;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * @author : IMG
 * @create : 2024/7/17
 */
@Component
public class RedisUtil {

    @Resource
    private RedisTemplate<String, Object> redisTemplate;

    /**
     *  放入缓存
     * @param key key
     * @param value value
     */
    public void set(String key, Object value){
        redisTemplate.opsForValue().set(key, value);
    }

    /**
     * 放入缓存并设置过期时间
     * @param key key
     * @param value value
     * @param expireTime 过期时间
     */
    public void set(String key, Object value, long expireTime){
        redisTemplate.opsForValue().set(key, value, expireTime, TimeUnit.DAYS);
    }

    /**
     * 将值放入哈希表中
     * @param key 哈希表的键
     * @param field 哈希表中的字段
     * @param value 要存储的值
     */
    public void hset(String key, String field, Object value) {
        // 使用 RedisTemplate 的 opsForHash() 方法将值放入哈希表中
        redisTemplate.opsForHash().put(key, field, value);
        // 设置有效时间
        redisTemplate.expire(key, 1, TimeUnit.HOURS);
    }

    /**
     * 将值放入哈希表中并设置有效时间
     * @param key 哈希表的键
     * @param field 哈希表中的字段
     * @param value 要存储的值
     * @param expireTime 有效时间
     * @param unit 时间单位
     */
    public void hset(String key, String field, Object value, long expireTime, TimeUnit unit) {
        // 使用 RedisTemplate 的 opsForHash() 方法将值放入哈希表中
        redisTemplate.opsForHash().put(key, field, value);
        // 设置有效时间
        redisTemplate.expire(key, expireTime, unit);
    }

    /**
     * 读取缓存
     * @param key key
     * @return value
     */
    public Object get(String key){
        return key == null ? null : redisTemplate.opsForValue().get(key);
    }

    /**
     * 从哈希结构中读取值
     * @param key key
     * @param field field
     * @return value
     */
    public Object hget(String key, String field) {
        return key == null ? null : redisTemplate.opsForHash().get(key, field);
    }


    /**
     * 获取指定分数范围内的元素
     *
     * @param key   键
     * @param min   最小分数
     * @param max   最大分数
     * @return      指定分数范围内的元素集合
     */
    public Set<String> zrangeByScore(String key, double min, double max) {
        // 获取 ZSetOperations 对象，用于操作 Sorted Set
        ZSetOperations<String, Object> zSetOps = redisTemplate.opsForZSet();
        // 获取指定分数范围内的元素
        return (Set<String>) (Set<?>) zSetOps.rangeByScore(key, min, max);
    }


    public void zremByKey(String key){
        redisTemplate.opsForZSet().removeRange(key, 0, -1);
    }

    /**
     * 删除缓存
     * @param key key
     */
    public void delete(String key){
        redisTemplate.delete(key);
    }

    /**
     * zSet添加元素
     * @param key key
     * @param value value
     * @param score score
     */
    public void zAdd(String key, Object value, double score){
        redisTemplate.opsForZSet().add(key, value, score);
    }

    /**
     * 获取ZSet中的元素
     * @param key ZSet的key
     * @return ZSet中的元素
     */
    public Set<Object> getZSet(String key){
        return redisTemplate.opsForZSet().rangeByScore(key, 0, System.currentTimeMillis() / 1000.0, 0, 100);
    }

    /**
     * 删除ZSet中的元素
     * @param key ZSet的key
     * @param value 要删除的元素
     * @return 是否删除成功
     */
    public Boolean removeZSet(String key, Object value){
        return redisTemplate.opsForZSet().remove(key, value) == 1;
    }

    /**
     * 在Map中放入值
     * @param mapKey map的键
     * @param key map中的键
     * @param value map中的值
     */
    public void putMap(String mapKey, String key, Object value){
        redisTemplate.opsForHash().put(mapKey, key, value);
    }

    /**
     * 从Map中获取值
     * @param mapKey map的键
     * @param key map中的键
     * @return map中的值
     */
    public Object getMap(String mapKey, String key){
        return redisTemplate.opsForHash().get(mapKey, key);
    }

    /**
     * 从Map中删除键值对
     * @param mapKey map的键
     * @param key map中的键
     */
    public void removeMapEntryByKey(String mapKey, String key){
        redisTemplate.opsForHash().delete(mapKey, key);
    }

    /**
     * map中是否存在key
     * @param mapKey map的键
     * @param key map中的键
     * @return 是否存在
     */
    @Deprecated
    public Boolean isMapKeyExist(String mapKey ,Object key){
        return redisTemplate.opsForHash().get(key.toString(), mapKey) != null;
    }

    /**
     * 删除ZSet
     * @param key ZSet的key
     */
    public void deleteZSet(String key){
        redisTemplate.delete(key);
    }



    /**
     * 将指定的值和分数添加到以给定键标识的 Redis 有序集合中
     * @param key   有序集合在 Redis 中的键
     * @param value 要添加到有序集合中的值，通常是id等标识
     * @param score 与值关联的分数
     */
    public void addSortSet(String key,Integer value,double score) {
        ZSetOperations<String, Object> zSetOps = redisTemplate.opsForZSet();
        zSetOps.add(key, value, score);
    }


    // 更新有序集合
    public void updateSortSet(String key,Integer value, double newScore) {
        ZSetOperations<String, Object> zSetOps = redisTemplate.opsForZSet();
        zSetOps.add(key, value, newScore);
    }

    /**
     * 从指定键对应的 Redis 有序集合中删除指定的元素
     * @param key   有序集合在 Redis 中的键
     * @param value 要从有序集合中删除的元素的值，通常是id等标识
     */
    public void deleteSortSet(String key,Integer value) {
        ZSetOperations<String, Object> zSetOps = redisTemplate.opsForZSet();
        zSetOps.remove(key, value);
    }

    public Double getScoreFromSortedSet(String key, Object member) {
        ZSetOperations<String, Object> zSetOps = redisTemplate.opsForZSet();
        return zSetOps.score(key, member);
    }

    /**
     * 创建浏览次数记录
     * @param key   sort set 的键，用于区分不同的有序集合
     * @param id    主键id等
     */
    public void addClick(String key,Integer id) {
        ZSetOperations<String, Object> zSetOps = redisTemplate.opsForZSet();
        Double score = zSetOps.score(key, id);
        if (score == null) {
            score = 1.0;
            zSetOps.add(key, id, score);
        }
    }

    /**
     * 增加浏览记录(+1)
     * @param key   sort set 的键，用于区分不同的有序集合
     * @param id    主键id等
     */
    public void plusClick(String key,Integer id) {

        ZSetOperations<String, Object> zSetOps = redisTemplate.opsForZSet();
        Double score = zSetOps.score(key, id);
        if (score != null) {
            score += 1;
            zSetOps.add(key, id, score);
        }
    }


    /**
     * 获取指定 Redis 有序集合中指定数量的成员及其分数。
     * @param key   Redis 有序集合的键。
     * @param limit 要获取的成员数量。
     * @return 包含成员及其对应分数的 Map，如果没有找到任何成员则返回 null。
     */
    public Map<Object, Double> getTopMembersAndScores(String key, int limit) {
        ZSetOperations<String, Object> zSetOps = redisTemplate.opsForZSet();
        // 获取有序集合中指定范围内的成员及其分数的集合，按照分数从高到低排序。
        Set<ZSetOperations.TypedTuple<Object>> tuples = zSetOps.reverseRangeWithScores(key, 0, limit - 1);
        if (tuples == null) {
            return null;
        }
        // 将成员及其分数的集合转换为 Map，使用成员作为键，分数作为值。
        // 如果分数为 null，则使用默认值 0.0。
        return tuples.stream().collect(Collectors.toMap(ZSetOperations.TypedTuple::getValue, tuple -> tuple.getScore()!= null? tuple.getScore() : 0.0));
    }

}

