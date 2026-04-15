package com.monparcimmo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MonParcImmoApplication {
    public static void main(String[] args) {
        SpringApplication.run(MonParcImmoApplication.class, args);
    }
}
