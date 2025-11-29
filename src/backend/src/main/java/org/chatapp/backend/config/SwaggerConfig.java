package org.chatapp.backend.config;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;

@Configuration
public class SwaggerConfig {
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Ứng dụng web chat real time sử dụng Angular và Spring Boot")
                        .description("Ứng dụng cho phép nhắn tin theo thời gian thực từ chat với một người và với nhóm.")
                        .version("1.0")
                        .contact(new Contact()
                                .name("Web chat real time")
                                .email("110122068@st.tvu.edu.vn")
                                .url("https://github.com/haivoDA22TTD/cn-DA22TTD-vochihai-chat-app-real-time-Spring-Boot"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT"))
                );
    }
}
