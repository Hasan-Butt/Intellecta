package com.intellecta.intellecta_backend.repository;

import com.intellecta.intellecta_backend.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {

    // All docs for a user newest first
    List<Document> findByUserIdOrderByUploadDateDesc(Long userId);

    // Filter by subject
    List<Document> findByUserIdAndSubjectOrderByUploadDateDesc(Long userId, String subject);

    // Search by filename or tag
    @Query("SELECT d FROM Document d WHERE d.user.id = :userId AND (" +
           "LOWER(d.fileName) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(d.tags) LIKE LOWER(CONCAT('%', :q, '%')))")
    List<Document> searchByNameOrTag(@Param("userId") Long userId, @Param("q") String q);

    // Search within a subject
    @Query("SELECT d FROM Document d WHERE d.user.id = :userId AND d.subject = :subject AND (" +
           "LOWER(d.fileName) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(d.tags) LIKE LOWER(CONCAT('%', :q, '%')))")
    List<Document> searchByNameOrTagInSubject(
        @Param("userId") Long userId,
        @Param("subject") String subject,
        @Param("q") String q);

    long countByUserId(Long userId);
}