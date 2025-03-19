package vttp.batch5.groupb.project.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;

@RestController
@RequestMapping("/api/metrics")
public class MetricsController {

    @Autowired
    private MeterRegistry meterRegistry;
    
    @Autowired
    private Counter taskCreatedCounter;
    
    @Autowired
    private Counter taskCompletedCounter;
    
    @Autowired
    private Counter userLoginCounter;
    
    @GetMapping("/summary")
    public ResponseEntity<?> getMetricsSummary() {
        double tasksCreated = taskCreatedCounter.count();
        double tasksCompleted = taskCompletedCounter.count();
        double userLogins = userLoginCounter.count();
        
        return ResponseEntity.ok(
            new MetricsSummary(tasksCreated, tasksCompleted, userLogins)
        );
    }
    
    // Inner class for metrics summary
    public static class MetricsSummary {
        private double tasksCreated;
        private double tasksCompleted;
        private double userLogins;
        
        public MetricsSummary(double tasksCreated, double tasksCompleted, double userLogins) {
            this.tasksCreated = tasksCreated;
            this.tasksCompleted = tasksCompleted;
            this.userLogins = userLogins;
        }
        
        public double getTasksCreated() {
            return tasksCreated;
        }
        
        public double getTasksCompleted() {
            return tasksCompleted;
        }
        
        public double getUserLogins() {
            return userLogins;
        }
    }
} 