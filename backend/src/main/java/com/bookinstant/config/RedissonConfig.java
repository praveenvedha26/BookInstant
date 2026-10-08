package com.bookinstant.config;

import org.redisson.Redisson;
import org.redisson.api.RedissonClient;
import org.redisson.config.Config;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RedissonConfig {

    private static final Logger log = LoggerFactory.getLogger(RedissonConfig.class);

    @Value("${redisson.address:redis://127.0.0.1:6379}")
    private String redisAddress;

    @Value("${redisson.password:}")
    private String password;

    @Value("${redisson.timeout:3000}")
    private int timeout;

    @Bean(destroyMethod = "shutdown")
    public RedissonClient redissonClient() {
        Config config = new Config();
        var singleServerConfig = config.useSingleServer()
                .setAddress(redisAddress)
                .setTimeout(timeout)
                .setConnectionPoolSize(64)
                .setConnectionMinimumIdleSize(10)
                .setRetryAttempts(3)
                .setRetryInterval(1500);

        if (password != null && !password.trim().isEmpty()) {
            singleServerConfig.setPassword(password);
        }

        try {
            log.info("Connecting RedissonClient to Redis at {}", redisAddress);
            return Redisson.create(config);
        } catch (Exception ex) {
            log.warn("Could not connect to Redis at {}: {}. Note: Start Redis via docker-compose up redis for distributed locks across cluster.", 
                    redisAddress, ex.getMessage());
            // Re-attempt or throw if required by caller
            throw ex;
        }
    }
}
