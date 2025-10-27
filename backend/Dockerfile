# Build stage
FROM maven:3.9.11-eclipse-temurin-21-alpine AS build

WORKDIR /app

COPY src src

COPY pom.xml .

RUN mvn package -DskipTests

# Package stage
FROM openjdk:21-jdk-slim AS production

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java","-jar","app.jar"]