package com.humanscratch.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.*;

public final class FormMapUtil {

    private FormMapUtil() {
    }

    @SuppressWarnings("unchecked")
    public static Map<String, Object> asMap(Object value) {
        if (value instanceof Map<?, ?> map) {
            return (Map<String, Object>) map;
        }
        return Map.of();
    }

    @SuppressWarnings("unchecked")
    public static List<Map<String, Object>> asListOfMaps(Object value) {
        if (!(value instanceof List<?> list)) {
            return List.of();
        }
        List<Map<String, Object>> out = new ArrayList<>();
        for (Object item : list) {
            if (item instanceof Map<?, ?> map) {
                out.add((Map<String, Object>) map);
            }
        }
        return out;
    }

    public static String str(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof String s) {
            String trimmed = s.trim();
            return trimmed.isEmpty() ? null : trimmed;
        }
        return String.valueOf(value);
    }

    public static LocalDate parseDate(Object value) {
        String raw = str(value);
        if (raw == null) {
            return null;
        }
        try {
            if (raw.contains("/")) {
                return DateParseUtil.parseDate(raw);
            }
            return LocalDate.parse(raw);
        } catch (DateTimeParseException | IllegalArgumentException ex) {
            return null;
        }
    }

    public static BigDecimal decimal(Object value) {
        String raw = str(value);
        if (raw == null) {
            return null;
        }
        try {
            return new BigDecimal(raw.replace(',', '.'));
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    public static Integer integer(Object value) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        String raw = str(value);
        if (raw == null) {
            return null;
        }
        try {
            return Integer.parseInt(raw);
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    public static boolean hasText(Object value) {
        return str(value) != null;
    }
}
