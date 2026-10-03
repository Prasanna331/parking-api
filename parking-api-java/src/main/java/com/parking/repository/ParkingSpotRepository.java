package com.parking.repository;

import com.parking.model.ParkingSpot;
import com.parking.model.ParkingSpot.SpotStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ParkingSpotRepository extends JpaRepository<ParkingSpot, UUID> {
    List<ParkingSpot> findByLotId(UUID lotId);
    List<ParkingSpot> findByLotIdAndStatus(UUID lotId, SpotStatus status);
    int countByLotId(UUID lotId);
}
