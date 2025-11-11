package com.budgetwise.gateway.config;

import com.budgetwise.gateway.filter.AuthenticationFilter;
import com.budgetwise.gateway.filter.RateLimitingFilter;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.time.Duration;
import java.util.Arrays;

@Configuration
public class GatewayConfig {

    private final AuthenticationFilter authenticationFilter;
    private final RateLimitingFilter rateLimitingFilter;

    public GatewayConfig(AuthenticationFilter authenticationFilter, 
                        RateLimitingFilter rateLimitingFilter) {
        this.authenticationFilter = authenticationFilter;
        this.rateLimitingFilter = rateLimitingFilter;
    }

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                // Main Backend Service Routes
                .route("budgetwise-backend", r -> r
                        .path("/api/v1/auth/**", "/api/v1/users/**", "/api/v1/transactions/**", 
                              "/api/v1/budgets/**", "/api/v1/goals/**", "/api/v1/analytics/**")
                        .filters(f -> f
                                .filter(authenticationFilter.apply(new AuthenticationFilter.Config()))
                                .filter(rateLimitingFilter.apply(new RateLimitingFilter.Config()))
                                .circuitBreaker(config -> config
                                        .setName("budgetwise-backend-cb")
                                        .setFallbackUri("forward:/fallback/budgetwise-backend"))
                                .retry(config -> config
                                        .setRetries(3)
                                        .setBackoff(Duration.ofMillis(100), Duration.ofMillis(1000), 2, false)))
                        .uri("lb://budgetwise-backend"))

                // AI Service Routes
                .route("ai-service", r -> r
                        .path("/api/v1/ai/**")
                        .filters(f -> f
                                .filter(authenticationFilter.apply(new AuthenticationFilter.Config()))
                                .filter(rateLimitingFilter.apply(new RateLimitingFilter.Config()))
                                .circuitBreaker(config -> config
                                        .setName("ai-service-cb")
                                        .setFallbackUri("forward:/fallback/ai-service"))
                                .stripPrefix(1))
                        .uri("lb://ai-service"))

                // Community Service Routes
                .route("community-service", r -> r
                        .path("/api/v1/community/**")
                        .filters(f -> f
                                .filter(authenticationFilter.apply(new AuthenticationFilter.Config()))
                                .filter(rateLimitingFilter.apply(new RateLimitingFilter.Config()))
                                .circuitBreaker(config -> config
                                        .setName("community-service-cb")
                                        .setFallbackUri("forward:/fallback/community-service"))
                                .stripPrefix(1))
                        .uri("lb://community-service"))

                // Investment Service Routes
                .route("investment-service", r -> r
                        .path("/api/v1/investments/**", "/api/v1/market-data/**")
                        .filters(f -> f
                                .filter(authenticationFilter.apply(new AuthenticationFilter.Config()))
                                .filter(rateLimitingFilter.apply(new RateLimitingFilter.Config()))
                                .circuitBreaker(config -> config
                                        .setName("investment-service-cb")
                                        .setFallbackUri("forward:/fallback/investment-service")))
                        .uri("lb://budgetwise-backend"))

                // Planning Service Routes
                .route("planning-service", r -> r
                        .path("/api/v1/planning/**", "/api/v1/retirement/**", "/api/v1/debt/**", "/api/v1/tax/**")
                        .filters(f -> f
                                .filter(authenticationFilter.apply(new AuthenticationFilter.Config()))
                                .filter(rateLimitingFilter.apply(new RateLimitingFilter.Config()))
                                .circuitBreaker(config -> config
                                        .setName("planning-service-cb")
                                        .setFallbackUri("forward:/fallback/planning-service")))
                        .uri("lb://budgetwise-backend"))

                // Bills Service Routes
                .route("bills-service", r -> r
                        .path("/api/v1/bills/**", "/api/v1/notifications/**")
                        .filters(f -> f
                                .filter(authenticationFilter.apply(new AuthenticationFilter.Config()))
                                .filter(rateLimitingFilter.apply(new RateLimitingFilter.Config()))
                                .circuitBreaker(config -> config
                                        .setName("bills-service-cb")
                                        .setFallbackUri("forward:/fallback/bills-service")))
                        .uri("lb://budgetwise-backend"))

                // Currency Service Routes
                .route("currency-service", r -> r
                        .path("/api/v1/currencies/**", "/api/v1/exchange-rates/**")
                        .filters(f -> f
                                .filter(authenticationFilter.apply(new AuthenticationFilter.Config()))
                                .filter(rateLimitingFilter.apply(new RateLimitingFilter.Config()))
                                .circuitBreaker(config -> config
                                        .setName("currency-service-cb")
                                        .setFallbackUri("forward:/fallback/currency-service")))
                        .uri("lb://budgetwise-backend"))

                // Banking Service Routes
                .route("banking-service", r -> r
                        .path("/api/v1/banking/**", "/api/v1/bank-accounts/**")
                        .filters(f -> f
                                .filter(authenticationFilter.apply(new AuthenticationFilter.Config()))
                                .filter(rateLimitingFilter.apply(new RateLimitingFilter.Config()))
                                .circuitBreaker(config -> config
                                        .setName("banking-service-cb")
                                        .setFallbackUri("forward:/fallback/banking-service")))
                        .uri("lb://budgetwise-backend"))

                // Health Check Routes (No Auth Required)
                .route("health-check", r -> r
                        .path("/actuator/**")
                        .filters(f -> f
                                .filter(rateLimitingFilter.apply(new RateLimitingFilter.Config())))
                        .uri("lb://budgetwise-backend"))

                .build();
    }

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration corsConfig = new CorsConfiguration();
        corsConfig.setAllowedOriginPatterns(Arrays.asList("*"));
        corsConfig.setMaxAge(3600L);
        corsConfig.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        corsConfig.setAllowedHeaders(Arrays.asList("*"));
        corsConfig.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);

        return new CorsWebFilter(source);
    }
}