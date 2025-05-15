package com.ticket.servermono.ticketcontext.grpc;

import java.util.UUID;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.client.inject.GrpcClient;
import occa.OccaDataResponse;
import occa.OccaResquest;
import occa.OccaServicesGrpc.OccaServicesBlockingStub;
import occa.ShowDataResponse;
import occa.ShowRequest;
import occa.ShowResponse;
import occa.ShowServicesGrpc.ShowServicesBlockingStub;

@Service
@Slf4j
@RequiredArgsConstructor
public class OccaGrpcClient {
    
    @GrpcClient("occa-service")
    private OccaServicesBlockingStub occaServiceStub;
    
    @GrpcClient("occa-service")
    private ShowServicesBlockingStub showServiceStub;

    /**
     * Get occa data by occa ID
     * 
     * @param request The request containing occa ID
     * @return Occa data response
     */
    public OccaDataResponse getOccaById(OccaResquest request) {
        try {
            return occaServiceStub.getOccaById(request);
        } catch (Exception e) {
            log.error("Error calling OCCA gRPC service: {}", e.getMessage());
            throw e;
        }
    }
    
    /**
     * Check if a show exists by ID
     * 
     * @param showId The show ID to check
     * @return True if show exists, false otherwise
     */
    public boolean isShowExist(UUID showId) {
        try {
            ShowRequest request = ShowRequest.newBuilder()
                .setShowId(showId.toString())
                .build();
            
            ShowResponse response = showServiceStub.isShowExist(request);
            return response.getIsShowExist();
        } catch (Exception e) {
            log.error("Error checking if show exists: {}", e.getMessage());
            throw e;
        }
    }
    
    /**
     * Get show data by show ID
     * 
     * @param showId The show ID
     * @return Show data response
     */
    public ShowDataResponse getShowById(UUID showId) {
        try {
            ShowRequest request = ShowRequest.newBuilder()
                .setShowId(showId.toString())
                .build();
            
            return showServiceStub.getShowById(request);
        } catch (Exception e) {
            log.error("Error getting show data by ID: {}", e.getMessage());
            throw e;
        }
    }
    
    /**
     * Get occa name by show ID
     * This method combines getShowById and getOccaById to get the occa name
     * 
     * @param showId The show ID
     * @return The occa name or "Khác" if not found
     */
    public String getOccaNameByShowId(UUID showId) {
        try {
            // Get show data to find occa ID
            ShowDataResponse showData = getShowById(showId);
            String occaId = showData.getOccaId();
            
            // Get occa data to get the occa name
            OccaResquest occaRequest = OccaResquest.newBuilder()
                .setOccaId(occaId)
                .build();
            
            OccaDataResponse occaData = getOccaById(occaRequest);
            String occaName = occaData.getTitle();
            
            return occaName != null && !occaName.isEmpty() ? occaName : "Khác";
        } catch (Exception e) {
            log.error("Error getting occa name for show ID: {}", showId, e);
            return "Khác";
        }
    }
}
