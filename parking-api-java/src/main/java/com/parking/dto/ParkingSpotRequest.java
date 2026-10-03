package com.parking.dto;

import com.parking.model.ParkingSpot.SpotStatus;
import com.parking.model.ParkingSpot.SpotType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class ParkingSpotRequest {

    @NotNull(message = "Lot ID is required")
    private UUID lotId;

    @NotBlank(message = "Spot number is required")
    private String spotNumber;

    private SpotType spotType = SpotType.standard;

    private SpotStatus status = SpotStatus.available;

    private String sensorId;
}
