package com.tempsfteam.class_tool.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.LinkedHashSet;
import java.util.Set;

/**
 * 根据 application-*.yml 中的配置动态将磁盘目录映射为 HTTP 可访问路径。
 *
 * 读取的配置：
 *  - file.networkPath     (例如 /cloudClassroom/api/file/)
 *  - image.courseIcon     (例如 C:\image\courseIcon\ 或 /usr/local/.../courseIcon/)
 *
 * 现在会同时注册：
 *   1) ${file.networkPath} + "image/**"
 *   2) ${file.networkPath} + "image/courseIcon/**"
 * 以及常见的备用 "/file/image/**" 与 "/file/image/courseIcon/**"
 */
@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    private static final Logger log = LoggerFactory.getLogger(StaticResourceConfig.class);

    // e.g. "/cloudClassroom/api/file/" (from your yml)
    @Value("${file.networkPath:/file/}")
    private String networkPath;

    // e.g. "C:\\image\\courseIcon\\" or "/usr/local/cloud_classroom/file/image/courseIcon/"
    @Value("${image.courseIcon:}")
    private String imageCourseIcon;

    // context path if you use one (may be empty)
    @Value("${server.servlet.context-path:}")
    private String contextPath;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        try {
            if (!StringUtils.hasText(imageCourseIcon)) {
                log.warn("image.courseIcon is empty - StaticResourceConfig will not register handlers.");
                return;
            }

            // Normalize disk path to use forward slashes and ensure trailing slash
            String disk = imageCourseIcon.replace('\\', '/');
            if (!disk.endsWith("/")) disk = disk + "/";

            // resource location prefix for Spring (file: URI)
            String resourceLocation = "file:" + disk;
            log.info("StaticResourceConfig: resourceLocation = {}", resourceLocation);

            // Build candidate URL prefixes that should map to this disk location
            Set<String> urlPrefixes = new LinkedHashSet<>();

            // Normalize networkPath (ensure leading and trailing slash)
            String np = (networkPath == null ? "" : networkPath.trim());
            if (!np.startsWith("/")) np = "/" + np;
            if (!np.endsWith("/")) np = np + "/";

            // prefix -> .../file/image/
            String prefixWithImage = np;
            if (!prefixWithImage.endsWith("image/")) {
                prefixWithImage = prefixWithImage + "image/";
            }
            urlPrefixes.add(normalizePattern(prefixWithImage));

            // prefix -> .../file/image/courseIcon/
            String prefixWithImageCourseIcon = prefixWithImage;
            if (!prefixWithImageCourseIcon.endsWith("courseIcon/")) {
                prefixWithImageCourseIcon = prefixWithImageCourseIcon + "courseIcon/";
            }
            urlPrefixes.add(normalizePattern(prefixWithImageCourseIcon));

            // If contextPath configured and prefix includes it, also register the pattern with contextPath stripped
            String cp = (contextPath == null ? "" : contextPath.trim());
            if (StringUtils.hasText(cp)) {
                // ensure cp starts with /
                if (!cp.startsWith("/")) cp = "/" + cp;
                // strip contextPath from candidates if present
                for (String candidate : new String[]{prefixWithImage, prefixWithImageCourseIcon}) {
                    String stripped = candidate;
                    if (stripped.startsWith(cp)) {
                        String withoutContext = stripped.substring(cp.length());
                        if (!withoutContext.startsWith("/")) withoutContext = "/" + withoutContext;
                        urlPrefixes.add(normalizePattern(withoutContext));
                    }
                }
            }

            // Also add common fallbacks without context: /file/image/ and /file/image/courseIcon/
            urlPrefixes.add("/file/image/");
            urlPrefixes.add("/file/image/courseIcon/");

            // Register handlers for each candidate pattern (append **)
            for (String p : urlPrefixes) {
                String pattern = p;
                if (!pattern.endsWith("/")) pattern = pattern + "/";
                pattern = pattern + "**";
                log.info("StaticResourceConfig: registering resource handler pattern '{}' -> {}", pattern, resourceLocation);
                registry.addResourceHandler(pattern)
                        .addResourceLocations(resourceLocation)
                        .setCachePeriod(3600);
            }
        } catch (Exception ex) {
            log.error("StaticResourceConfig initialization failed", ex);
        }
    }

    /**
     * Ensure pattern begins with "/" and does not contain duplicate slashes.
     */
    private String normalizePattern(String p) {
        if (p == null) return "/";
        String s = p.replaceAll("/+", "/");
        if (!s.startsWith("/")) s = "/" + s;
        if (!s.endsWith("/")) s = s + "/";
        return s;
    }
}
