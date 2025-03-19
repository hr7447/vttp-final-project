package vttp.batch5.groupb.project.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuoteDto {
    
    private String id;
    
    private String content;
    
    private String author;
} 