package com.intellecta.intellecta_backend.service;

import com.intellecta.intellecta_backend.model.Notification;
import com.intellecta.intellecta_backend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    public Notification sendNotification(String title, String message, String type, String link, Long userId) {
        Notification notification = Notification.builder()
                .title(title)
                .message(message)
                .type(type)
                .link(link)
                .userId(userId)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
        return notificationRepository.save(notification);
    }

    @Override
    public List<Notification> getNotificationsForUser(Long userId) {
        return notificationRepository.findNotificationsForUser(userId);
    }

    @Override
    public long getUnreadCount(Long userId) {
        return notificationRepository.countUnreadForUser(userId);
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> list = notificationRepository.findNotificationsForUser(userId);
        for (Notification n : list) {
            n.setRead(true);
        }
        notificationRepository.saveAll(list);
    }
}
