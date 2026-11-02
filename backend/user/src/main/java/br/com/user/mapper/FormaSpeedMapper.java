package br.com.user.mapper;

import br.com.user.dto.FormaSpeedDTO;
import br.com.user.entity.FormaSpeed;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface FormaSpeedMapper {

    FormaSpeed toEntity(FormaSpeedDTO dto);

    FormaSpeedDTO toDto(FormaSpeed entity);
}
