package br.com.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GerarCortesResponseDTO {
    private boolean success;
    private String message;
    private List<CorteImagemDTO> cortes;
}


