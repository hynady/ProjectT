# Stage 1: Build stage
FROM gradle:8.2.1-jdk17-alpine AS builder
WORKDIR /build
COPY . /build
RUN gradle clean generateProto build -x test

# Stage 2: Runtime stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Add dependencies required for grpc/protobuf
RUN apk add --no-cache libc6-compat

COPY --from=builder /build/build/libs/*.jar app.jar

ENV JAVA_OPTS="-Xmx512m -Xms256m"

EXPOSE 8080
EXPOSE 9090

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]