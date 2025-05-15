package com.ticket.servermono.occacontext.infrastructure.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ticket.servermono.occacontext.domain.enums.SaleStatus;
import com.ticket.servermono.occacontext.entities.Show;

public interface ShowRepository extends JpaRepository<Show, UUID> {
    List<Show> findByOccaId(UUID occaId);
    List<Show> findByOccaIdAndSaleStatusIn(UUID occaId, List<SaleStatus> statuses);
    List<Show> findByCreatedBy(UUID userId);
    
    /**
     * Find shows with auto-update status enabled and sale status not equal to the specified status
     * Used by the scheduler to find shows that need status updates
     */
    List<Show> findByAutoUpdateStatusTrueAndSaleStatusNot(SaleStatus saleStatus);
}
