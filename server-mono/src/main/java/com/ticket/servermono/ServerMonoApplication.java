package com.ticket.servermono;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.modulith.Modulithic;

@Modulithic(
        systemName = "Ticket Modulith Server"
)
@SpringBootApplication
public class ServerMonoApplication {

    public static void main(String[] args) {
        SpringApplication.run(ServerMonoApplication.class, args);
    }

}
