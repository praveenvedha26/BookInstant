package com.bookinstant.repository;

import com.bookinstant.entity.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {
    List<Movie> findByGenreIgnoreCase(String genre);
    List<Movie> findByIsUpcomingTrue();
    List<Movie> findByIsPreBookTrue();
    List<Movie> findByTitleContainingIgnoreCase(String query);
}
