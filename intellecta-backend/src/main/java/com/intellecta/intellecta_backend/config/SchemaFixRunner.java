package com.intellecta.intellecta_backend.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * One-time schema fix: the video_lectures table was originally created with a
 * NOT NULL course_id column that no longer exists in the VideoLecture entity.
 * Hibernate's ddl-auto=update never drops or alters existing columns, so the
 * column stays NOT NULL in the DB, causing INSERT failures.
 *
 * This runner makes course_id nullable on every startup (ALTER TABLE is
 * idempotent for nullability changes on SQL Server).
 */
@Component
public class SchemaFixRunner implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    public SchemaFixRunner(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        try {
            // Only alter if the column still exists and is NOT NULL
            Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS " +
                "WHERE TABLE_NAME = 'video_lectures' " +
                "AND COLUMN_NAME = 'course_id' " +
                "AND IS_NULLABLE = 'NO'",
                Integer.class
            );

            if (count != null && count > 0) {
                // Drop any FK constraints on the column first
                jdbcTemplate.execute(
                    "DECLARE @sql NVARCHAR(MAX) = ''; " +
                    "SELECT @sql += 'ALTER TABLE video_lectures DROP CONSTRAINT ' + QUOTENAME(name) + '; ' " +
                    "FROM sys.foreign_keys WHERE parent_object_id = OBJECT_ID('video_lectures') " +
                    "AND name LIKE '%course%'; " +
                    "EXEC(@sql);"
                );
                // Now make the column nullable
                jdbcTemplate.execute(
                    "ALTER TABLE video_lectures ALTER COLUMN course_id BIGINT NULL"
                );
                System.out.println("[SchemaFixRunner] Made video_lectures.course_id nullable.");
            }
        } catch (Exception e) {
            // Column may not exist at all (fresh DB) — safe to ignore
            System.out.println("[SchemaFixRunner] Skipped (column may not exist): " + e.getMessage());
        }
    }
}
