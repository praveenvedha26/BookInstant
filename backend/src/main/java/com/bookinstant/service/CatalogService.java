package com.bookinstant.service;

import com.bookinstant.entity.*;
import com.bookinstant.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CatalogService {

    private final MovieRepository movieRepository;
    private final TheatreRepository theatreRepository;
    private final ScreenRepository screenRepository;
    private final ShowtimeRepository showtimeRepository;

    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }

    public Optional<Movie> getMovieById(Long id) {
        return movieRepository.findById(id);
    }

    public List<Movie> getUpcomingMovies() {
        return movieRepository.findByIsUpcomingTrue();
    }

    public List<Movie> getPreBookMovies() {
        return movieRepository.findByIsPreBookTrue();
    }

    public List<Movie> getMoviesByGenre(String genre) {
        return movieRepository.findByGenreIgnoreCase(genre);
    }

    public List<Movie> searchMovies(String query) {
        return movieRepository.findByTitleContainingIgnoreCase(query);
    }

    @Transactional
    public Movie saveMovie(Movie movie) {
        return movieRepository.save(movie);
    }

    public List<Theatre> getAllTheatres() {
        return theatreRepository.findAll();
    }

    public List<Theatre> getTheatresByCity(String city) {
        return theatreRepository.findByCityIgnoreCase(city);
    }

    public List<Showtime> getShowtimesByMovie(Long movieId) {
        return showtimeRepository.findByMovieId(movieId);
    }

    @Transactional
    public Theatre saveTheatre(Theatre theatre) {
        return theatreRepository.save(theatre);
    }

    @Transactional
    public Screen saveScreen(Screen screen) {
        return screenRepository.save(screen);
    }

    @Transactional
    public Showtime saveShowtime(Showtime showtime) {
        return showtimeRepository.save(showtime);
    }
}
