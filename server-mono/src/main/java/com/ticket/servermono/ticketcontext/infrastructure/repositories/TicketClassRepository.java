package com.ticket.servermono.ticketcontext.infrastructure.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ticket.servermono.ticketcontext.entities.TicketClass;

import jakarta.persistence.LockModeType;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TicketClassRepository extends JpaRepository<TicketClass, UUID> {
    List<TicketClass> findByShowId(UUID showId);
    
    long countByShowId(UUID showId);
    
    void deleteAllByShowId(UUID showId);

    Optional<TicketClass> findByShowIdAndName(UUID showId, String name);
    
    // Thêm phương thức sử dụng Pessimistic Lock cho một TicketClass
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT tc FROM TicketClass tc WHERE tc.id = :id")
    Optional<TicketClass> findByIdWithPessimisticLock(@Param("id") UUID id);
    
    // Thêm phương thức sử dụng Pessimistic Lock cho nhiều TicketClass
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT tc FROM TicketClass tc WHERE tc.id IN :ids")
    List<TicketClass> findAllByIdWithPessimisticLock(@Param("ids") Collection<UUID> ids);
}