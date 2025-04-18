package com.ticket.servermono.occacontext.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "occa_tracking_stats")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OccaTrackingStats {
    @Id
    private UUID occaId;
    
    @ElementCollection
    @CollectionTable(
        name = "occa_tracking_sources", 
        joinColumns = @JoinColumn(name = "occa_id")
    )
    @MapKeyColumn(name = "source")
    @Column(name = "count")
    private Map<String, Integer> sources;
    
    private int totalCount;
    
    private LocalDateTime lastUpdated;
    
    @PrePersist
    @PreUpdate
    public void updateTimestamp() {
        lastUpdated = LocalDateTime.now();
    }
}
