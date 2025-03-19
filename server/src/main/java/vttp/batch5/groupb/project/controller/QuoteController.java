package vttp.batch5.groupb.project.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import reactor.core.publisher.Mono;
import vttp.batch5.groupb.project.dto.QuoteDto;
import vttp.batch5.groupb.project.service.QuoteService;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/quotes")
public class QuoteController {
    
    @Autowired
    private QuoteService quoteService;
    
    @GetMapping("/random")
    public Mono<ResponseEntity<QuoteDto>> getRandomQuote(@RequestParam(required = false) Boolean refresh) {
        if (Boolean.TRUE.equals(refresh)) {
            return quoteService.getRandomQuoteForceRefresh()
                    .map(ResponseEntity::ok);
        }
        return quoteService.getRandomQuote()
                .map(ResponseEntity::ok);
    }
} 