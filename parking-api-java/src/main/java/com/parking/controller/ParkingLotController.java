package com.parking.controller;

import com.parking.dto.ParkingLotRequest;
import com.parking.dto.ParkingLotResponse;
import com.parking.model.User;
import com.parking.service.ParkingLotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/lots")
@RequiredArgsConstructor
public class ParkingLotController {

    private final ParkingLotService service;

    // GET /api/lots — all authenticated users
    @GetMapping
    public ResponseEntity<List<ParkingLotResponse>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    // GET /api/lots/{id} — all authenticated users
    @GetMapping("/{id}")
    public ResponseEntity<ParkingLotResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    // POST /api/lots — admin only
    @PostMapping
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<ParkingLotResponse> create(
            @Valid @RequestBody ParkingLotRequest req,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req, currentUser));
    }

    // PUT /api/lots/{id} — admin only
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<ParkingLotResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody ParkingLotRequest req) {
        return ResponseEntity.ok(service.update(id, req));
    }

    // DELETE /api/lots/{id} — admin only
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
