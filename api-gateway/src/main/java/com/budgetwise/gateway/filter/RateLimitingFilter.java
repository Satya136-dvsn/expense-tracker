package com.budgetwise.gateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.time.Duration;

@Component
public class RateLimitingFilter extends AbstractGatewayFilterFactory<RateLimitingFilter.Config> {

    private final ReactiveRedisTemplate<String, String> redisTemplate;

    // Rate limiting configuration
    private static final int MAX_REQUESTS_PER_MINUTE = 100;
    private static final int MAX_REQUESTS_PER_HOUR = 1000;
    private static final Duration MINUTE_WINDOW = Duration.ofMinutes(1);
    private static final Duration HOUR_WINDOW = Duration.ofHours(1);

    public RateLimitingFilter(ReactiveRedisTemplate<String, String> redisTemplate) {
        super(Config.class);
        this.redisTemplate = redisTemplate;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            String clientId = getClientId(request);
            String path = request.getURI().getPath();

            // Create rate limiting keys
            String minuteKey = String.format("rate_limit:minute:%s", clientId);
            String hourKey = String.format("rate_limit:hour:%s", clientId);

            return checkRateLimit(minuteKey, MAX_REQUESTS_PER_MINUTE, MINUTE_WINDOW)
                    .flatMap(minuteAllowed -> {
                        if (!minuteAllowed) {
                            return onRateLimitExceeded(exchange, "Rate limit exceeded: too many requests per minute");
                        }
                        
                        return checkRateLimit(hourKey, MAX_REQUESTS_PER_HOUR, HOUR_WINDOW)
                                .flatMap(hourAllowed -> {
                                    if (!hourAllowed) {
                                        return onRateLimitExceeded(exchange, "Rate limit exceeded: too many requests per hour");
                                    }
                                    
                                    // Add rate limit headers to response
                                    return chain.filter(exchange).then(Mono.fromRunnable(() -> {
                                        addRateLimitHeaders(exchange, minuteKey, hourKey);
                                    }));
                                });
                    });
        };
    }

    private String getClientId(ServerHttpRequest request) {
        // Try to get user ID from headers (set by authentication filter)
        String userId = request.getHeaders().getFirst("X-User-Id");
        if (userId != null) {
            return "user:" + userId;
        }

        // Fall back to IP address for unauthenticated requests
        String clientIp = getClientIpAddress(request);
        return "ip:" + clientIp;
    }

    private String getClientIpAddress(ServerHttpRequest request) {
        String xForwardedFor = request.getHeaders().getFirst("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeaders().getFirst("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        return request.getRemoteAddress() != null ? 
                request.getRemoteAddress().getAddress().getHostAddress() : "unknown";
    }

    private Mono<Boolean> checkRateLimit(String key, int maxRequests, Duration window) {
        return redisTemplate.opsForValue()
                .increment(key)
                .flatMap(count -> {
                    if (count == 1) {
                        // First request, set expiration
                        return redisTemplate.expire(key, window)
                                .thenReturn(true);
                    } else if (count <= maxRequests) {
                        return Mono.just(true);
                    } else {
                        return Mono.just(false);
                    }
                })
                .onErrorReturn(true); // Allow request if Redis is unavailable
    }

    private void addRateLimitHeaders(ServerWebExchange exchange, String minuteKey, String hourKey) {
        ServerHttpResponse response = exchange.getResponse();
        
        // Get current counts (fire and forget)
        redisTemplate.opsForValue().get(minuteKey)
                .defaultIfEmpty("0")
                .subscribe(minuteCount -> {
                    response.getHeaders().add("X-RateLimit-Minute-Limit", String.valueOf(MAX_REQUESTS_PER_MINUTE));
                    response.getHeaders().add("X-RateLimit-Minute-Remaining", 
                            String.valueOf(Math.max(0, MAX_REQUESTS_PER_MINUTE - Integer.parseInt(minuteCount))));
                });

        redisTemplate.opsForValue().get(hourKey)
                .defaultIfEmpty("0")
                .subscribe(hourCount -> {
                    response.getHeaders().add("X-RateLimit-Hour-Limit", String.valueOf(MAX_REQUESTS_PER_HOUR));
                    response.getHeaders().add("X-RateLimit-Hour-Remaining", 
                            String.valueOf(Math.max(0, MAX_REQUESTS_PER_HOUR - Integer.parseInt(hourCount))));
                });
    }

    private Mono<Void> onRateLimitExceeded(ServerWebExchange exchange, String message) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
        response.getHeaders().add(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);
        response.getHeaders().add("Retry-After", "60"); // Suggest retry after 60 seconds

        String errorResponse = String.format(
                "{\"error\": \"%s\", \"status\": 429, \"timestamp\": \"%s\", \"retryAfter\": 60}",
                message, java.time.Instant.now().toString()
        );

        DataBuffer buffer = response.bufferFactory().wrap(errorResponse.getBytes(StandardCharsets.UTF_8));
        return response.writeWith(Mono.just(buffer));
    }

    public static class Config {
        // Configuration properties can be added here
        private int maxRequestsPerMinute = MAX_REQUESTS_PER_MINUTE;
        private int maxRequestsPerHour = MAX_REQUESTS_PER_HOUR;

        public int getMaxRequestsPerMinute() {
            return maxRequestsPerMinute;
        }

        public void setMaxRequestsPerMinute(int maxRequestsPerMinute) {
            this.maxRequestsPerMinute = maxRequestsPerMinute;
        }

        public int getMaxRequestsPerHour() {
            return maxRequestsPerHour;
        }

        public void setMaxRequestsPerHour(int maxRequestsPerHour) {
            this.maxRequestsPerHour = maxRequestsPerHour;
        }
    }
}