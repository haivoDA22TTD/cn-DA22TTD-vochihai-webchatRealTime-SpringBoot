
FROM maven:3.9.9-eclipse-temurin-17-alpine AS builder

# Tạo thư mục làm việc
WORKDIR /app

# Copy file pom
COPY pom.xml .
COPY src ./src

# Build JAR (bỏ qua test)
RUN mvn clean package -DskipTests


FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy JAR từ stage trước
COPY --from=builder /app/target/backend-0.0.1-SNAPSHOT.jar app.jar

# Tạo thư mục uploads cho avatar và messages
RUN mkdir -p /app/uploads/avatars /app/uploads/messages

RUN addgroup -S spring && adduser -S spring -G spring && \
    chown -R spring:spring /app/uploads
USER spring:spring

# Chạy ứng dụng
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]