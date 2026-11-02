package br.com.user.mapper;

import br.com.user.dto.ParedeDTO;
import br.com.user.entity.Parede;
import org.mapstruct.*;

@Mapper(componentModel = "spring", uses = {ElementoInternoMapper.class})
public interface ParedeMapper {

    Parede toEntity(ParedeDTO dto);

    ParedeDTO toDto(Parede entity);

    @AfterMapping
    default void linkElementos(@MappingTarget Parede parede) {
        if (parede.getElementosInternos() != null) {
            parede.getElementosInternos()
                    .forEach(e -> e.setParede(parede));
        }
    }
}
