package com.intellecta.intellecta_backend.service;

import com.intellecta.intellecta_backend.model.Notification;
import java.util.List;

public interface NotificationService {
    Notification sendNotification(String title, String message, String type, String link, Long userId);
    List<Notification> getNotificationsForUser(Long userId);
    long getUnreadCount(Long userId);
    void markAsRead(Long notificationId);
    void markAllAsRead(Long userId);
}
