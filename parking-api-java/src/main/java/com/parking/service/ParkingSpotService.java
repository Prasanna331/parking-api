package com.parking.service;

import com.parking.dto.ParkingSpotRequest;
import com.parking.dto.ParkingSpotResponse;
import com.parking.exception.ResourceNotFoundException;
import com.parking.model.ParkingLot;
import com.parking.model.ParkingSpot;
import com.parking.model.ParkingSpot.SpotStatus;
import com.parking.repository.ParkingLotRepository;
import com.parking.repository.ParkingSpotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ParkingSpotService {

    private final ParkingSpotRepository spotRepository;
    private final ParkingLotRepository lotRepository;
    private final SpotEventPublisher eventPublisher;

    public List<ParkingSpotResponse> getAll(UUID lotId, SpotStatus status) {
        List<ParkingSpot> spots;
        if (lotId != null && status != null) {
            spots = spotRepository.findByLotIdAndStatus(lotId, status);
        } else if (lotId != null) {
            spots = spotRepository.findByLotId(lotId);
        } else {
            spots = spotRepository.findAll();
        }
        return spots.stream().map(ParkingSpotResponse::from).toList();
    }

    public ParkingSpotResponse getById(UUID id) {
        return ParkingSpotResponse.from(findOrThrow(id));
    }

    public ParkingSpotResponse create(ParkingSpotRequest req) {
        ParkingLot lot = lotRepository.findById(req.getLotId())
                .orElseThrow(() -> new ResourceNotFoundException("Parking lot not found: " + req.getLotId()));

        ParkingSpot spot = ParkingSpot.builder()
                .lot(lot)
                .spotNumber(req.getSpotNumber())
                .spotType(req.getSpotType())
                .status(req.getStatus())
                .sensorId(req.getSensorId())
                .build();

        ParkingSpotResponse response = ParkingSpotResponse.from(spotRepository.save(spot));
        syncTotalSpots(lot);
        return response;
    }

    public ParkingSpotResponse update(UUID id, ParkingSpotRequest req) {
        ParkingSpot spot = findOrThrow(id);
        ParkingLot oldLot = spot.getLot();

        // Allow lot reassignment if lotId changed
        boolean lotChanged = !oldLot.getId().equals(req.getLotId());
        if (lotChanged) {
            ParkingLot newLot = lotRepository.findById(req.getLotId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parking lot not found: " + req.getLotId()));
            spot.setLot(newLot);
        }

        spot.setSpotNumber(req.getSpotNumber());
        spot.setSpotType(req.getSpotType());
        spot.setStatus(req.getStatus());
        spot.setSensorId(req.getSensorId());

        ParkingSpotResponse response = ParkingSpotResponse.from(spotRepository.save(spot));
        if (lotChanged) {
            syncTotalSpots(oldLot);
            syncTotalSpots(spot.getLot());
        }
        return response;
    }

    public ParkingSpotResponse updateStatus(UUID id, SpotStatus newStatus) {
        ParkingSpot spot = findOrThrow(id);
        spot.setStatus(newStatus);
        ParkingSpotResponse response = ParkingSpotResponse.from(spotRepository.save(spot));
        eventPublisher.publishSpotUpdate(response);
        return response;
    }

    public void delete(UUID id) {
        ParkingSpot spot = findOrThrow(id);
        ParkingLot lot = spot.getLot();
        spotRepository.deleteById(id);
        syncTotalSpots(lot);
    }

    private void syncTotalSpots(ParkingLot lot) {
        lot.setTotalSpots(spotRepository.countByLotId(lot.getId()));
        lotRepository.save(lot);
    }

    private ParkingSpot findOrThrow(UUID id) {
        return spotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parking spot not found: " + id));
    }
}
