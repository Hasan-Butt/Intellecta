package com.intellecta.intellecta_backend.util;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.intellecta.intellecta_backend.dto.ResourceLinkDto;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.ArrayList;
import java.util.List;

/**
 * JPA converter that serialises List<ResourceLinkDto> to/from a JSON string
 * stored in a NVARCHAR(MAX) column. Runs automatically for any entity field
 * annotated with @Convert(converter = ResourceLinkConverter.class).
 */
@Converter
public class ResourceLinkConverter implements AttributeConverter<List<ResourceLinkDto>, String> {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(List<ResourceLinkDto> attribute) {
        if (attribute == null || attribute.isEmpty()) return null;
        try {
            return MAPPER.writeValueAsString(attribute);
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public List<ResourceLinkDto> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) return new ArrayList<>();
        try {
            return MAPPER.readValue(dbData, new TypeReference<List<ResourceLinkDto>>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }
}
