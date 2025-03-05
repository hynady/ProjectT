package com.ticket.servermono.authcontext.infrastructure.grpc;

import com.ticket.servermono.authcontext.usecases.EndUserServices;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;
import user.UserExistsRequest;
import user.UserExistsResponse;
import user.UserServiceGrpc;

import java.util.UUID;

@Slf4j
@GrpcService
@RequiredArgsConstructor
public class UserGrpcService extends UserServiceGrpc.UserServiceImplBase {
    
    private final EndUserServices endUserServices;
    
    @Override
    public void checkUserExists(UserExistsRequest request, StreamObserver<UserExistsResponse> responseObserver) {
        try {
            String userIdStr = request.getUserId();
            log.info("Received user existence check request for user ID: {}", userIdStr);
            
            UUID userId = UUID.fromString(userIdStr);
            boolean exists = endUserServices.isUserExist(userId);
            
            log.info("User {} exists: {}", userIdStr, exists);
            
            UserExistsResponse response = UserExistsResponse.newBuilder()
                .setExists(exists)
                .build();
                
            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (IllegalArgumentException e) {
            log.error("Invalid UUID format: {}", request.getUserId(), e);
            
            // Trả về false nếu UUID không hợp lệ
            UserExistsResponse response = UserExistsResponse.newBuilder()
                .setExists(false)
                .build();
                
            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error("Error checking if user exists: {}", e.getMessage(), e);
            responseObserver.onError(e);
        }
    }
}