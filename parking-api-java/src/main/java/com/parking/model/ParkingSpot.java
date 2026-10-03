package com.parking.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "parking_spots")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ParkingSpot {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lot_id", nullable = false)
    private ParkingLot lot;

    @Column(name = "spot_number", nullable = false, length = 20)
    private String spotNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "spot_type", nullable = false, length = 20)
    private SpotType spotType = SpotType.standard;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SpotStatus status = SpotStatus.available;

    @Column(name = "sensor_id", length = 100)
    private String sensorId;

    @Column(name = "last_updated")
    private OffsetDateTime lastUpdated;

    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist protected void onCreate() { createdAt = lastUpdated = OffsetDateTime.now(); }
    @PreUpdate  protected void onUpdate() { lastUpdated = OffsetDateTime.now(); }

    public enum SpotType { standard, handicapped, ev_charging, reserved, motorcycle }
    public enum SpotStatus { available, occupied, reserved, maintenance }
}
