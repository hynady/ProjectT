FROM openjdk:17
ARG JAR_FILE=build/libs/*.jar
COPY ${JAR_FILE} app.jar

EXPOSE 8080
EXPOSE 9090
ENTRYPOINT ["java","-jar","/app.jar"]