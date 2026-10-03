package com.parking.service;

import com.parking.dto.ParkingSpotResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SpotEventPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Broadcasts a spot update to all clients subscribed to /topic/spots/{lotId}
     */
    public void publishSpotUpdate(ParkingSpotResponse spot) {
        messagingTemplate.convertAndSend(
                "/topic/spots/" + spot.getLotId(),
                spot
        );
    }
}
