package vttp.batch5.groupb.project.service;

import java.time.Duration;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import reactor.core.publisher.Mono;
import vttp.batch5.groupb.project.dto.QuoteDto;
import vttp.batch5.groupb.project.model.Quote;
import vttp.batch5.groupb.project.repository.QuoteRepository;

@Service
public class QuoteService {
    
    @Autowired
    private QuoteRepository quoteRepository;
    
    @Autowired
    private WebClient.Builder webClientBuilder;
    
    @Value("${quote.api.url}")
    private String quoteApiUrl;
    
    @Value("${quote.api.key}")
    private String apiKey;
    
    public Mono<QuoteDto> getRandomQuote() {
        Optional<Quote> cachedQuote = getCachedQuote();
        
        if (cachedQuote.isPresent()) {
            Quote quote = cachedQuote.get();
            if (System.currentTimeMillis() - quote.getTimestamp() < 300000) {
                return Mono.just(convertToDto(quote));
            }
        }
        
        return fetchQuoteFromApi()
                .map(this::cacheQuote)
                .map(this::convertToDto);
    }
    
    public Mono<QuoteDto> getRandomQuoteForceRefresh() {
        return fetchQuoteFromApi()
                .map(this::cacheQuote)
                .map(this::convertToDto);
    }
    
    private Optional<Quote> getCachedQuote() {
        Iterable<Quote> quotes = quoteRepository.findAll();
        return quotes.iterator().hasNext() ? Optional.of(quotes.iterator().next()) : Optional.empty();
    }
    
    private Mono<Quote> fetchQuoteFromApi() {
        return webClientBuilder.build()
                .get()
                .uri(quoteApiUrl)
                .header("X-Api-Key", apiKey)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .retrieve()
                .bodyToMono(QuoteApiResponse[].class)
                .map(responses -> {
                    if (responses.length > 0) {
                        QuoteApiResponse response = responses[0];
                        Quote quote = new Quote();
                        quote.setId(UUID.randomUUID().toString());
                        quote.setContent(response.getQuote());
                        quote.setAuthor(response.getAuthor());
                        quote.setTimestamp(System.currentTimeMillis());
                        return quote;
                    } else {
                        throw new RuntimeException("No quotes returned from API");
                    }
                })
                .onErrorResume(e -> {
                    Quote fallbackQuote = new Quote();
                    fallbackQuote.setId(UUID.randomUUID().toString());
                    fallbackQuote.setContent("The best way to predict the future is to create it.");
                    fallbackQuote.setAuthor("Abraham Lincoln");
                    fallbackQuote.setTimestamp(System.currentTimeMillis());
                    return Mono.just(fallbackQuote);
                });
    }
    
    private Quote cacheQuote(Quote quote) {
        quoteRepository.deleteAll();
        return quoteRepository.save(quote);
    }
    
    private QuoteDto convertToDto(Quote quote) {
        QuoteDto dto = new QuoteDto();
        dto.setId(quote.getId());
        dto.setContent(quote.getContent());
        dto.setAuthor(quote.getAuthor());
        return dto;
    }
    
    private static class QuoteApiResponse {
        private String quote;
        private String author;
        private String category;
        
        public String getQuote() {
            return quote;
        }
        
        public void setQuote(String quote) {
            this.quote = quote;
        }
        
        public String getAuthor() {
            return author;
        }
        
        public void setAuthor(String author) {
            this.author = author;
        }
        
        public String getCategory() {
            return category;
        }
        
        public void setCategory(String category) {
            this.category = category;
        }
    }
} 