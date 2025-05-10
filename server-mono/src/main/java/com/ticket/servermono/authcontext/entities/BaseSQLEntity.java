package com.ticket.servermono.authcontext.entities;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseSQLEntity {
    @Id
    @UuidGenerator
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Version
    @Column(name = "version")
    private Long version;    
    
    @Column(name = "created_by", updatable = false)
    private UUID createdBy;

    @Column(name = "updated_by")
    private UUID updatedBy;

    @PrePersist
    protected void onCreate() {
        // Lấy userId từ security context hoặc sử dụng ID mặc định nếu không có người dùng đăng nhập
        createdBy = com.ticket.servermono.common.utils.SecurityUtils.getCurrentUserId();
        updatedBy = createdBy;
    }

    @PreUpdate
    protected void onUpdate() {
        // Lấy userId từ security context hoặc sử dụng ID mặc định nếu không có người dùng đăng nhập
        updatedBy = com.ticket.servermono.common.utils.SecurityUtils.getCurrentUserId();
    }
}