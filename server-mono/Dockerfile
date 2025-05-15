# Stage 1: Build the application
FROM gradle:7.6.1-jdk17 as builder
WORKDIR /app

# Copy gradle files first to leverage Docker layer caching
COPY gradlew ./
COPY gradle ./gradle
COPY build.gradle settings.gradle ./

# Download dependencies (this layer will be cached if dependencies don't change)
RUN chmod +x ./gradlew && ./gradlew dependencies --no-daemon

# Copy source code
COPY src ./src

# Build the application (skip tests to speed up the build process)
RUN ./gradlew assemble --no-daemon -x test

# Stage 2: Create the runtime image
FROM openjdk:17-slim

WORKDIR /app

# Copy the built JAR file from the builder stage
COPY --from=builder /app/build/libs/*.jar app.jar

# Expose the ports for REST API and gRPC
EXPOSE 8080
EXPOSE 9090

# Run the application
ENTRYPOINT ["java", "-jar", "/app/app.jar"]