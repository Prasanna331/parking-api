package com.parking.service;

import com.parking.dto.ParkingLotRequest;
import com.parking.dto.ParkingLotResponse;
import com.parking.exception.ResourceNotFoundException;
import com.parking.model.ParkingLot;
import com.parking.model.User;
import com.parking.repository.ParkingLotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ParkingLotService {

    private final ParkingLotRepository repository;

    public List<ParkingLotResponse> getAll() {
        return repository.findAll().stream()
                .map(ParkingLotResponse::from)
                .toList();
    }

    public ParkingLotResponse getById(UUID id) {
        return ParkingLotResponse.from(findOrThrow(id));
    }

    public ParkingLotResponse create(ParkingLotRequest req, User currentUser) {
        ParkingLot lot = ParkingLot.builder()
                .name(req.getName())
                .address(req.getAddress())
                .city(req.getCity())
                .latitude(req.getLatitude())
                .longitude(req.getLongitude())
                .totalSpots(req.getTotalSpots())
                .openTime(req.getOpenTime())
                .closeTime(req.getCloseTime())
                .isActive(req.isActive())
                .createdBy(currentUser)
                .build();
        return ParkingLotResponse.from(repository.save(lot));
    }

    public ParkingLotResponse update(UUID id, ParkingLotRequest req) {
        ParkingLot lot = findOrThrow(id);
        lot.setName(req.getName());
        lot.setAddress(req.getAddress());
        lot.setCity(req.getCity());
        lot.setLatitude(req.getLatitude());
        lot.setLongitude(req.getLongitude());
        lot.setTotalSpots(req.getTotalSpots());
        lot.setOpenTime(req.getOpenTime());
        lot.setCloseTime(req.getCloseTime());
        lot.setActive(req.isActive());
        return ParkingLotResponse.from(repository.save(lot));
    }

    public void delete(UUID id) {
        findOrThrow(id);
        repository.deleteById(id);
    }

    private ParkingLot findOrThrow(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parking lot not found: " + id));
    }
}
