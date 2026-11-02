package br.com.user.mapper;

import br.com.user.dto.PlantaDTO;
import br.com.user.entity.Planta;
import org.mapstruct.*;

@Mapper(componentModel = "spring", uses = {ComodoMapper.class})
public interface PlantaMapper {

    Planta toEntity(PlantaDTO dto);

    PlantaDTO toDto(Planta entity);

    @AfterMapping
    default void linkComodos(@MappingTarget Planta planta) {
        if (planta.getComodos() != null) {
            planta.getComodos().forEach(c -> c.setPlanta(planta));
        }
    }
}
