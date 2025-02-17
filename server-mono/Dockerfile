FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Add dependencies required for grpc/protobuf
RUN apk add --no-cache libc6-compat

COPY build/libs/*.jar app.jar

# Add these lines for better container health
ENV JAVA_OPTS="-Xmx512m -Xms256m"

EXPOSE 8080
EXPOSE 9090

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]