package com.parking.dto;

import com.parking.model.ParkingLot;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class ParkingLotResponse {

    private UUID id;
    private String name;
    private String address;
    private String city;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private int totalSpots;
    private LocalTime openTime;
    private LocalTime closeTime;
    private boolean isActive;
    private UUID createdBy;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public static ParkingLotResponse from(ParkingLot lot) {
        ParkingLotResponse r = new ParkingLotResponse();
        r.id          = lot.getId();
        r.name        = lot.getName();
        r.address     = lot.getAddress();
        r.city        = lot.getCity();
        r.latitude    = lot.getLatitude();
        r.longitude   = lot.getLongitude();
        r.totalSpots  = lot.getTotalSpots();
        r.openTime    = lot.getOpenTime();
        r.closeTime   = lot.getCloseTime();
        r.isActive    = lot.isActive();
        r.createdBy   = lot.getCreatedBy() != null ? lot.getCreatedBy().getId() : null;
        r.createdAt   = lot.getCreatedAt();
        r.updatedAt   = lot.getUpdatedAt();
        return r;
    }
}
