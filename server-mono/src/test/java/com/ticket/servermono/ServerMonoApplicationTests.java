package com.ticket.servermono;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.modulith.core.ApplicationModules;
import org.springframework.modulith.docs.Documenter;

@SpringBootTest
class ServerMonoApplicationTests {

    @Test
    void contextLoads() {
    }

    @Test
    public void verifyModules() {
        ApplicationModules modules = ApplicationModules.of(ServerMonoApplication.class);
        modules.verify();
    }

    @Test
    public void createDocumentation() {
        ApplicationModules modules = ApplicationModules.of(ServerMonoApplication.class);
        new Documenter(modules)
                .writeModulesAsPlantUml()
                .writeIndividualModulesAsPlantUml();
    }
}