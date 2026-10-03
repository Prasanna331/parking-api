package com.parking.repository;

import com.parking.model.ParkingLot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ParkingLotRepository extends JpaRepository<ParkingLot, UUID> {
}
