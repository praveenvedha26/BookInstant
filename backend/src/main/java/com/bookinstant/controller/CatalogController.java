package com.bookinstant.controller;

import com.bookinstant.entity.*;
import com.bookinstant.repository.BookingRepository;
import com.bookinstant.service.CatalogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CatalogController {

    private final CatalogService catalogService;
    private final BookingRepository bookingRepository;

    @GetMapping("/movies")
    public ResponseEntity<List<Movie>> getMovies(
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) Boolean upcoming,
            @RequestParam(required = false) Boolean preBook,
            @RequestParam(required = false) String search
    ) {
        if (search != null && !search.trim().isEmpty()) {
            return ResponseEntity.ok(catalogService.searchMovies(search));
        }
        if (Boolean.TRUE.equals(upcoming)) {
            return ResponseEntity.ok(catalogService.getUpcomingMovies());
        }
        if (Boolean.TRUE.equals(preBook)) {
            return ResponseEntity.ok(catalogService.getPreBookMovies());
        }
        if (genre != null && !genre.trim().isEmpty() && !genre.equalsIgnoreCase("All")) {
            return ResponseEntity.ok(catalogService.getMoviesByGenre(genre));
        }
        return ResponseEntity.ok(catalogService.getAllMovies());
    }

    @GetMapping("/movies/{id}")
    public ResponseEntity<Movie> getMovieById(@PathVariable Long id) {
        return catalogService.getMovieById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/theatres")
    public ResponseEntity<List<Theatre>> getTheatres(@RequestParam(required = false) String city) {
        if (city != null && !city.trim().isEmpty() && !city.equalsIgnoreCase("All")) {
            return ResponseEntity.ok(catalogService.getTheatresByCity(city));
        }
        return ResponseEntity.ok(catalogService.getAllTheatres());
    }

    @GetMapping("/showtimes/movie/{movieId}")
    public ResponseEntity<List<Showtime>> getShowtimesByMovie(@PathVariable Long movieId) {
        return ResponseEntity.ok(catalogService.getShowtimesByMovie(movieId));
    }

    @GetMapping("/bookings/user/{userId}")
    public ResponseEntity<List<Booking>> getUserBookings(@PathVariable Long userId) {
        return ResponseEntity.ok(bookingRepository.findByUserIdOrderByCreatedAtDesc(userId));
    }
}
