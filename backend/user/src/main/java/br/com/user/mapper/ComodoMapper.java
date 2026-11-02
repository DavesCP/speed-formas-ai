package br.com.user.mapper;

import br.com.user.dto.ComodoDTO;
import br.com.user.entity.Comodo;
import org.mapstruct.*;

@Mapper(componentModel = "spring", uses = {ParedeMapper.class})
public interface ComodoMapper {

    Comodo toEntity(ComodoDTO dto);

    ComodoDTO toDto(Comodo entity);

    @AfterMapping
    default void linkParedes(@MappingTarget Comodo comodo) {
        if (comodo.getParedes() != null) {
            comodo.getParedes().forEach(p -> p.setComodo(comodo));
        }
    }
}
