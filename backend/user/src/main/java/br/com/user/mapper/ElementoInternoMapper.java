package br.com.user.mapper;

import br.com.user.dto.ElementoInternoDTO;
import br.com.user.entity.ElementoInterno;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ElementoInternoMapper {

    ElementoInterno toEntity(ElementoInternoDTO dto);

    ElementoInternoDTO toDto(ElementoInterno entity);
}
