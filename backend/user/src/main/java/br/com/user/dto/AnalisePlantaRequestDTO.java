package br.com.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalisePlantaRequestDTO {
    private String projectName;
    private String projectDescription;
    private String architecturalFileBase64;
    private String structuralFileBase64;
    private String electricalFileBase64;
}


