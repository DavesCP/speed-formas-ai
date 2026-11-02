package br.com.user.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum Role {

    ADMIN(1,"Admin"),
    USER(2, "User");

    private final int id;
    private final String label;

}
