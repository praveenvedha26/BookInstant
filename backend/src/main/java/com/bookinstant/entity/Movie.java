package com.bookinstant.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "movies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "poster_url", length = 500)
    private String posterUrl;

    @Column(name = "backdrop_url", length = 500)
    private String backdropUrl;

    @Column(precision = 3, scale = 1)
    private BigDecimal rating;

    @Column(nullable = false, length = 100)
    private String genre;

    @Column(name = "duration_mins", nullable = false)
    private Integer durationMins;

    @Column(name = "age_rating", length = 10, nullable = false)
    private String ageRating; // "13+", "15+", "18+"

    @Column(length = 20, nullable = false)
    private String format; // "IMAX", "2D", "3D"

    @Column(name = "is_upcoming")
    private Boolean isUpcoming;

    @Column(name = "is_pre_book")
    private Boolean isPreBook;

    @Column(name = "release_date")
    private LocalDate releaseDate;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (rating == null) {
            rating = new BigDecimal("8.5");
        }
        if (isUpcoming == null) {
            isUpcoming = false;
        }
        if (isPreBook == null) {
            isPreBook = false;
        }
        if (ageRating == null) {
            ageRating = "13+";
        }
        if (format == null) {
            format = "2D";
        }
    }
}
