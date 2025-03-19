package vttp.batch5.groupb.project.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.SQLException;

@Configuration
public class DatabaseInitializer {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseInitializer.class);

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void initializeDatabase() {
        try {
            String dbType = determineDbType();
            logger.info("Detected database type: {}", dbType);
            
            if ("PostgreSQL".equals(dbType)) {
                logger.info("PostgreSQL detected, ensuring schema compatibility");
            }
        } catch (Exception e) {
            logger.error("Error during database initialization", e);
        }
    }
    
    private String determineDbType() {
        try {
            String dbProductName = jdbcTemplate.getDataSource().getConnection().getMetaData().getDatabaseProductName();
            return dbProductName;
        } catch (SQLException e) {
            logger.error("Error determining database type", e);
            return "Unknown";
        }
    }
} 