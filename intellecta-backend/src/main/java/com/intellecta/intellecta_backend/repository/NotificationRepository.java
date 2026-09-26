package com.intellecta.intellecta_backend.repository;

import com.intellecta.intellecta_backend.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @Query("SELECT n FROM Notification n WHERE n.userId IS NULL OR n.userId = :userId ORDER BY n.createdAt DESC")
    List<Notification> findNotificationsForUser(@Param("userId") Long userId);

    @Query("SELECT COUNT(n) FROM Notification n WHERE (n.userId IS NULL OR n.userId = :userId) AND n.isRead = false")
    long countUnreadForUser(@Param("userId") Long userId);
}
