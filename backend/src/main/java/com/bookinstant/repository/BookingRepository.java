package com.bookinstant.repository;

import com.bookinstant.entity.Booking;
import com.bookinstant.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<Booking> findByQrCodeToken(String qrCodeToken);

    @Query("SELECT bs.seat.id FROM BookingSeat bs WHERE bs.booking.showtime.id = :showtimeId AND bs.booking.status = :status")
    List<Long> findBookedSeatIdsByShowtimeIdAndStatus(@Param("showtimeId") Long showtimeId, @Param("status") BookingStatus status);
}
