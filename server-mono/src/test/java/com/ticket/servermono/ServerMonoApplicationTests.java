package com.ticket.servermono;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.modulith.core.ApplicationModules;


@SpringBootTest
class ServerMonoApplicationTests {

    @Test
    void contextLoads() {
    }

    //Test modulith structure
    @Test
    void testModulithStructure() {
        var modules = ApplicationModules.of(ServerMonoApplication.class);
        modules.verify();
        modules.forEach(System.out::println);
    }
}