package com.ticket.servermono.ticketcontext.infrastructure.grpc;

import com.ticket.servermono.ticketcontext.adapters.dtos.ShowAuthCodeResponse;
import com.ticket.servermono.ticketcontext.usecases.ShowAuthCodeServices;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;
import occa.ShowAuthCodeRequest;
import occa.ShowAuthCodeGrpcResponse;
import occa.ShowAuthCodeServiceGrpc.ShowAuthCodeServiceImplBase;

import java.util.UUID;

@Slf4j
@GrpcService
@RequiredArgsConstructor
public class ShowAuthCodeGrpcService extends ShowAuthCodeServiceImplBase {

    private final ShowAuthCodeServices showAuthCodeServices;

    @Override
    public void getAuthCode(ShowAuthCodeRequest request, StreamObserver<ShowAuthCodeGrpcResponse> responseObserver) {
        try {
            String showId = request.getShowId();
            
            if (showId == null || showId.isEmpty()) {
                responseObserver.onError(
                    Status.INVALID_ARGUMENT
                        .withDescription("Show ID cannot be null or empty")
                        .asRuntimeException());
                return;
            }

            UUID showUuid = UUID.fromString(showId);
            ShowAuthCodeResponse response = showAuthCodeServices.getAuthCodeDirect(showUuid);

            ShowAuthCodeGrpcResponse grpcResponse = ShowAuthCodeGrpcResponse.newBuilder()
                .setAuthCode(response.getAuthCode())
                .setExpiresAt(response.getExpiresAt().toString())
                .build();

            responseObserver.onNext(grpcResponse);
            responseObserver.onCompleted();
        } catch (IllegalArgumentException e) {
            log.error("Invalid UUID format for show ID: {}", e.getMessage());
            responseObserver.onError(
                Status.INVALID_ARGUMENT
                    .withDescription("Invalid UUID format for show ID")
                    .asRuntimeException());
        } catch (Exception e) {
            log.error("Error getting auth code for show: {}", e.getMessage(), e);
            responseObserver.onError(
                Status.INTERNAL
                    .withDescription("Error getting auth code")
                    .asRuntimeException());
        }
    }

    @Override
    public void refreshAuthCode(ShowAuthCodeRequest request, StreamObserver<ShowAuthCodeGrpcResponse> responseObserver) {
        try {
            String showId = request.getShowId();
            
            if (showId == null || showId.isEmpty()) {
                responseObserver.onError(
                    Status.INVALID_ARGUMENT
                        .withDescription("Show ID cannot be null or empty")
                        .asRuntimeException());
                return;
            }

            UUID showUuid = UUID.fromString(showId);
            ShowAuthCodeResponse response = showAuthCodeServices.refreshAuthCodeDirect(showUuid);

            ShowAuthCodeGrpcResponse grpcResponse = ShowAuthCodeGrpcResponse.newBuilder()
                .setAuthCode(response.getAuthCode())
                .setExpiresAt(response.getExpiresAt().toString())
                .build();

            responseObserver.onNext(grpcResponse);
            responseObserver.onCompleted();
        } catch (IllegalArgumentException e) {
            log.error("Invalid UUID format for show ID: {}", e.getMessage());
            responseObserver.onError(
                Status.INVALID_ARGUMENT
                    .withDescription("Invalid UUID format for show ID")
                    .asRuntimeException());
        } catch (Exception e) {
            log.error("Error refreshing auth code for show: {}", e.getMessage(), e);
            responseObserver.onError(
                Status.INTERNAL
                    .withDescription("Error refreshing auth code")
                    .asRuntimeException());
        }
    }
}
