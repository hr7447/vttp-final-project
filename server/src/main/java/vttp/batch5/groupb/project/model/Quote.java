package vttp.batch5.groupb.project.model;

import java.io.Serializable;

import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@RedisHash("quotes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Quote implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    @Id
    private String id;
    
    private String content;
    
    private String author;
    
    private long timestamp;
} 