package com.ticket.servermono.occacontext.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;

import java.util.UUID;

@Entity
@Table(name = "personal_tracking_stats", indexes = {
    @Index(name = "idx_pt_typeId", columnList = "typeId"),
    @Index(name = "idx_pt_userId", columnList = "userId"),
    @Index(name = "idx_pt_count", columnList = "count"),
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PersonalTrackingStats {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @Enumerated(EnumType.STRING)
    private TrackingType type;
    
    private UUID typeId; // categoryId, locationId, or occaId
    
    private UUID userId;
    
    private int count;
    
    public enum TrackingType {
        CATEGORY,
        LOCATION,
        OCCA
    }
}
