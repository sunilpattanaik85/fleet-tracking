package com.driveinsight.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http
			.csrf(csrf -> csrf.ignoringRequestMatchers(
					new AntPathRequestMatcher("/ws/**"),
					new AntPathRequestMatcher("/api/**")
			))
			.authorizeHttpRequests(auth -> auth
				.requestMatchers("/ws/**", "/api/**", "/", "/index.html", "/assets/**").permitAll()
				.anyRequest().permitAll()
			)
			.cors(cors -> {});

		return http.build();
	}
}