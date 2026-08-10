package com.intellecta.intellecta_backend.model;

import java.lang.reflect.Method;
import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Bug 1.1.1 — {@code loggedAt} must be settable (so the seeder can place
 * distractions inside seeded session windows) while still defaulting to
 * {@code now} when nothing is provided, via the {@code @PrePersist} fallback.
 */
class DistractionEntryTests {

    @Test
    void prePersistFallbackStampsNowWhenLoggedAtIsNull() throws Exception {
        DistractionEntry entry = DistractionEntry.builder()
                .reason("Test distraction")
                .build();
        assertNull(entry.getLoggedAt());

        invokePrePersist(entry);

        LocalDateTime stamped = entry.getLoggedAt();
        assertNotNull(stamped, "@PrePersist fallback must stamp loggedAt when null");
        assertTrue(stamped.isAfter(LocalDateTime.now().minusMinutes(1)),
                "fallback must use ~now, got " + stamped);
        assertTrue(stamped.isBefore(LocalDateTime.now().plusMinutes(1)),
                "fallback must use ~now, got " + stamped);
    }

    @Test
    void prePersistFallbackDoesNotOverrideExplicitLoggedAt() throws Exception {
        LocalDateTime explicit = LocalDateTime.of(2025, 3, 15, 9, 30, 0);
        DistractionEntry entry = DistractionEntry.builder()
                .reason("Seeded distraction")
                .loggedAt(explicit)
                .build();

        invokePrePersist(entry);

        assertEquals(explicit, entry.getLoggedAt(),
                "explicitly set loggedAt must be preserved by the fallback");
    }

    @Test
    void loggedAtIsSettableThroughDefaultSetter() {
        LocalDateTime insideSession = LocalDateTime.of(2025, 3, 15, 10, 5, 0);
        DistractionEntry entry = new DistractionEntry();
        entry.setLoggedAt(insideSession);

        assertEquals(insideSession, entry.getLoggedAt());
    }

    private void invokePrePersist(DistractionEntry entry) throws Exception {
        Method method = DistractionEntry.class.getDeclaredMethod("ensureLoggedAt");
        method.setAccessible(true);
        method.invoke(entry);
    }
}