package com.ticket.servermono.occacontext.adapters.dtos.DetailData;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LocationDataResponse {

    private String location;
    private String address;

}
