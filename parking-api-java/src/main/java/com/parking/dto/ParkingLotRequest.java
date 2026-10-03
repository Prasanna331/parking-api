package com.parking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalTime;

@Data
public class ParkingLotRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Address is required")
    private String address;

    private String city;

    private BigDecimal latitude;

    private BigDecimal longitude;

    @PositiveOrZero(message = "Total spots must be 0 or more")
    private Integer totalSpots = 0;

    private LocalTime openTime;

    private LocalTime closeTime;

    private boolean isActive = true;
}
