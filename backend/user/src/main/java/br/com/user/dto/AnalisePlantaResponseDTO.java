package br.com.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalisePlantaResponseDTO {
    private boolean success;
    private String projectId;
    private String status;
    private String message;
    private PlantaDTO plantaData;
}


