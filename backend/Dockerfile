# ---- Build stage ----
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copie du pom.xml et téléchargement des dépendances (cache layer)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copie du code source et build
COPY src ./src
RUN mvn clean package -DskipTests -B

# ---- Run stage ----
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copie du jar compilé
COPY --from=build /app/target/*.jar app.jar

# Port exposé (Railway détecte automatiquement $PORT)
EXPOSE 8080

# Démarrage avec profil prod
ENTRYPOINT ["java", \
  "-Dspring.profiles.active=prod", \
  "-Dserver.port=${PORT:-8080}", \
  "-jar", "app.jar"]
