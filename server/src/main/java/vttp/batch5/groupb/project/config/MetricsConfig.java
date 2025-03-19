package vttp.batch5.groupb.project.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;

@Configuration
public class MetricsConfig {

    @Bean
    public Counter taskCreatedCounter(MeterRegistry registry) {
        return Counter.builder("app.tasks.created")
                .description("Number of tasks created")
                .register(registry);
    }
    
    @Bean
    public Counter taskCompletedCounter(MeterRegistry registry) {
        return Counter.builder("app.tasks.completed")
                .description("Number of tasks completed")
                .register(registry);
    }
    
    @Bean
    public Counter userLoginCounter(MeterRegistry registry) {
        return Counter.builder("app.users.login")
                .description("Number of user logins")
                .register(registry);
    }
} 