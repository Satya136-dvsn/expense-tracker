package com.budgettracker.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Service
public class AlphaVantageService {
    
    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    
    @Value("${alphavantage.api.key:demo}")
    private String apiKey;
    
    @Value("${alphavantage.api.url:https://www.alphavantage.co/query}")
    private String apiUrl;
    
    public AlphaVantageService() {
        this.webClient = WebClient.builder()
                .baseUrl("https://www.alphavantage.co")
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(1024 * 1024))
                .build();
        this.objectMapper = new ObjectMapper();
    }
    
    @Cacheable(value = "stockPrices", key = "#symbol", unless = "#result == null")
    public BigDecimal getCurrentPrice(String symbol) {
        try {
            String response = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/query")
                            .queryParam("function", "GLOBAL_QUOTE")
                            .queryParam("symbol", symbol)
                            .queryParam("apikey", apiKey)
                            .build())
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(10))
                    .block();
            
            return parseCurrentPrice(response);
        } catch (WebClientResponseException e) {
            throw new RuntimeException("Failed to fetch price for symbol: " + symbol + ". Error: " + e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException("Error fetching price for symbol: " + symbol + ". Error: " + e.getMessage());
        }
    }
    
    @Cacheable(value = "stockQuotes", key = "#symbol", unless = "#result == null")
    public Map<String, Object> getQuote(String symbol) {
        try {
            String response = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/query")
                            .queryParam("function", "GLOBAL_QUOTE")
                            .queryParam("symbol", symbol)
                            .queryParam("apikey", apiKey)
                            .build())
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(10))
                    .block();
            
            return parseQuote(response);
        } catch (WebClientResponseException e) {
            throw new RuntimeException("Failed to fetch quote for symbol: " + symbol + ". Error: " + e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException("Error fetching quote for symbol: " + symbol + ". Error: " + e.getMessage());
        }
    }
    
    @Cacheable(value = "stockSearch", key = "#keywords", unless = "#result == null")
    public Map<String, Object> searchSymbol(String keywords) {
        try {
            String response = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/query")
                            .queryParam("function", "SYMBOL_SEARCH")
                            .queryParam("keywords", keywords)
                            .queryParam("apikey", apiKey)
                            .build())
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(10))
                    .block();
            
            return parseSearchResults(response);
        } catch (WebClientResponseException e) {
            throw new RuntimeException("Failed to search for symbol: " + keywords + ". Error: " + e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException("Error searching for symbol: " + keywords + ". Error: " + e.getMessage());
        }
    }
    
    private BigDecimal parseCurrentPrice(String response) {
        try {
            JsonNode root = objectMapper.readTree(response);
            
            // Check for API error messages
            if (root.has("Error Message")) {
                throw new RuntimeException("API Error: " + root.get("Error Message").asText());
            }
            
            if (root.has("Note")) {
                throw new RuntimeException("API Rate Limit: " + root.get("Note").asText());
            }
            
            JsonNode globalQuote = root.get("Global Quote");
            if (globalQuote == null) {
                throw new RuntimeException("Invalid response format from Alpha Vantage API");
            }
            
            JsonNode priceNode = globalQuote.get("05. price");
            if (priceNode == null) {
                throw new RuntimeException("Price not found in API response");
            }
            
            return new BigDecimal(priceNode.asText());
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse price from API response: " + e.getMessage());
        }
    }
    
    private Map<String, Object> parseQuote(String response) {
        try {
            JsonNode root = objectMapper.readTree(response);
            
            // Check for API error messages
            if (root.has("Error Message")) {
                throw new RuntimeException("API Error: " + root.get("Error Message").asText());
            }
            
            if (root.has("Note")) {
                throw new RuntimeException("API Rate Limit: " + root.get("Note").asText());
            }
            
            JsonNode globalQuote = root.get("Global Quote");
            if (globalQuote == null) {
                throw new RuntimeException("Invalid response format from Alpha Vantage API");
            }
            
            Map<String, Object> quote = new HashMap<>();
            quote.put("symbol", globalQuote.get("01. symbol").asText());
            quote.put("open", new BigDecimal(globalQuote.get("02. open").asText()));
            quote.put("high", new BigDecimal(globalQuote.get("03. high").asText()));
            quote.put("low", new BigDecimal(globalQuote.get("04. low").asText()));
            quote.put("price", new BigDecimal(globalQuote.get("05. price").asText()));
            quote.put("volume", Long.parseLong(globalQuote.get("06. volume").asText()));
            quote.put("latestTradingDay", globalQuote.get("07. latest trading day").asText());
            quote.put("previousClose", new BigDecimal(globalQuote.get("08. previous close").asText()));
            quote.put("change", new BigDecimal(globalQuote.get("09. change").asText()));
            quote.put("changePercent", globalQuote.get("10. change percent").asText());
            
            return quote;
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse quote from API response: " + e.getMessage());
        }
    }
    
    private Map<String, Object> parseSearchResults(String response) {
        try {
            JsonNode root = objectMapper.readTree(response);
            
            // Check for API error messages
            if (root.has("Error Message")) {
                throw new RuntimeException("API Error: " + root.get("Error Message").asText());
            }
            
            if (root.has("Note")) {
                throw new RuntimeException("API Rate Limit: " + root.get("Note").asText());
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("bestMatches", root.get("bestMatches"));
            
            return result;
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse search results from API response: " + e.getMessage());
        }
    }
}