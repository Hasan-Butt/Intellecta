package com.intellecta.intellecta_backend.repository;

import com.intellecta.intellecta_backend.model.Notes;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface NotesRepository extends JpaRepository<Notes, Long> {

    List<Notes> findByUserIdOrderByIsPinnedDescCreatedAtDesc(Long userId);

    List<Notes> findByUserIdAndFlaggedForReviewTrue(Long userId);

    @Query("SELECT n FROM Notes n WHERE n.user.id = :userId AND (" +
           "LOWER(n.title) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(n.content) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(n.tags) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(n.category) LIKE LOWER(CONCAT('%', :q, '%')))")
    List<Notes> searchByKeyword(@Param("userId") Long userId, @Param("q") String q);

    @Query("SELECT n FROM Notes n WHERE n.user.id = :userId AND " +
           "LOWER(n.tags) LIKE LOWER(CONCAT('%', :tag, '%')) AND (" +
           "LOWER(n.title) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(n.content) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(n.category) LIKE LOWER(CONCAT('%', :q, '%')))")
    List<Notes> searchByKeywordAndTag(
        @Param("userId") Long userId,
        @Param("q") String q,
        @Param("tag") String tag);

    @Query("SELECT n FROM Notes n WHERE n.user.id = :userId AND " +
           "LOWER(n.tags) LIKE LOWER(CONCAT('%', :tag, '%'))")
    List<Notes> findByTag(@Param("userId") Long userId, @Param("tag") String tag);
}