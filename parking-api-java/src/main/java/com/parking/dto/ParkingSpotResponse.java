package com.parking.dto;

import com.parking.model.ParkingSpot;
import com.parking.model.ParkingSpot.SpotStatus;
import com.parking.model.ParkingSpot.SpotType;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class ParkingSpotResponse {

    private UUID id;
    private UUID lotId;
    private String lotName;
    private String spotNumber;
    private SpotType spotType;
    private SpotStatus status;
    private String sensorId;
    private OffsetDateTime lastUpdated;
    private OffsetDateTime createdAt;

    public static ParkingSpotResponse from(ParkingSpot spot) {
        ParkingSpotResponse r = new ParkingSpotResponse();
        r.id          = spot.getId();
        r.lotId       = spot.getLot().getId();
        r.lotName     = spot.getLot().getName();
        r.spotNumber  = spot.getSpotNumber();
        r.spotType    = spot.getSpotType();
        r.status      = spot.getStatus();
        r.sensorId    = spot.getSensorId();
        r.lastUpdated = spot.getLastUpdated();
        r.createdAt   = spot.getCreatedAt();
        return r;
    }
}
