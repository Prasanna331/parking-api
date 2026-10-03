package com.parking.controller;

import com.parking.dto.ParkingSpotRequest;
import com.parking.dto.ParkingSpotResponse;
import com.parking.model.ParkingSpot.SpotStatus;
import com.parking.service.ParkingSpotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/spots")
@RequiredArgsConstructor
public class ParkingSpotController {

    private final ParkingSpotService service;

    // GET /api/spots?lotId=&status= — all authenticated users
    @GetMapping
    public ResponseEntity<List<ParkingSpotResponse>> getAll(
            @RequestParam(required = false) UUID lotId,
            @RequestParam(required = false) SpotStatus status) {
        return ResponseEntity.ok(service.getAll(lotId, status));
    }

    // GET /api/spots/{id} — all authenticated users
    @GetMapping("/{id}")
    public ResponseEntity<ParkingSpotResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    // POST /api/spots — admin only
    @PostMapping
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<ParkingSpotResponse> create(@Valid @RequestBody ParkingSpotRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req));
    }

    // PUT /api/spots/{id} — admin or operator
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('admin') or hasRole('operator')")
    public ResponseEntity<ParkingSpotResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody ParkingSpotRequest req) {
        return ResponseEntity.ok(service.update(id, req));
    }

    // PATCH /api/spots/{id}/status — admin or operator (quick status change only)
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('admin') or hasRole('operator')")
    public ResponseEntity<ParkingSpotResponse> updateStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        SpotStatus newStatus = SpotStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(service.updateStatus(id, newStatus));
    }

    // DELETE /api/spots/{id} — admin only
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
