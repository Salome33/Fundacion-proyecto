package com.humanscratch.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

public final class DateParseUtil {

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final DateTimeFormatter DMY = DateTimeFormatter.ofPattern("d/M/uuuu");

    private DateParseUtil() {
    }

    public static LocalDate parseDate(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException("Fecha vacía");
        }
        String value = raw.trim();
        try {
            if (value.contains("/")) {
                return LocalDate.parse(value, DMY);
            }
            return LocalDate.parse(value, ISO);
        } catch (DateTimeParseException ex) {
            throw new IllegalArgumentException("Fecha inválida: " + raw);
        }
    }

    public static String formatDisplay(LocalDate date) {
        return date.format(DMY);
    }
}
