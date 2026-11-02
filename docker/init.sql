-- =============================================
-- SPEED FORMAS - Script de Inicialização do Banco
-- =============================================

-- Tabela de Usuários (com username e password para login)
CREATE TABLE IF NOT EXISTS "users" (
    "id" BIGSERIAL PRIMARY KEY,
    "version" BIGINT DEFAULT 0,
    "name" VARCHAR(255) NOT NULL,
    "cpf" VARCHAR(11) NOT NULL UNIQUE,
    "address" VARCHAR(500) NOT NULL,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "username" VARCHAR(100) NOT NULL UNIQUE,
    "password" VARCHAR(255) NOT NULL,
    "role" VARCHAR(50) NOT NULL CHECK ("role" IN ('ADMIN', 'USER'))
);

-- Tabela de Projetos
CREATE TABLE IF NOT EXISTS "projetos" (
    "id" BIGSERIAL PRIMARY KEY,
    "version" BIGINT DEFAULT 0,
    "nome" VARCHAR(255) NOT NULL,
    "cliente" VARCHAR(255) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'planning',
    "progresso" INTEGER NOT NULL DEFAULT 0,
    "data_inicio" DATE NOT NULL,
    "data_fim" DATE,
    "orcamento" DECIMAL(15, 2),
    "descricao" VARCHAR(1000),
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,
    "user_id" BIGINT,
    CONSTRAINT "fk_projetos_user" FOREIGN KEY ("user_id") 
        REFERENCES "users" ("id") ON DELETE SET NULL
);

-- Tabela de Equipe do Projeto
CREATE TABLE IF NOT EXISTS "projeto_equipe" (
    "projeto_id" BIGINT NOT NULL,
    "membro" VARCHAR(255) NOT NULL,
    CONSTRAINT "fk_equipe_projeto" FOREIGN KEY ("projeto_id") 
        REFERENCES "projetos" ("id") ON DELETE CASCADE
);

-- Tabela de Gerações de IA
CREATE TABLE IF NOT EXISTS "geracoes_ia" (
    "id" BIGSERIAL PRIMARY KEY,
    "version" BIGINT DEFAULT 0,
    "nome" VARCHAR(255) NOT NULL,
    "planta_estrutural_base64" TEXT,
    "planta_eletrica_base64" TEXT,
    "dados_extraidos" TEXT,
    "dados_validados" TEXT,
    "imagens_cortes" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'AGUARDANDO_ANALISE',
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,
    "projeto_id" BIGINT NOT NULL,
    CONSTRAINT "fk_geracoes_projeto" FOREIGN KEY ("projeto_id") 
        REFERENCES "projetos" ("id") ON DELETE CASCADE
);

-- Tabela de Formas Speed
CREATE TABLE IF NOT EXISTS "forma_speed" (
    "id" BIGSERIAL PRIMARY KEY,
    "version" BIGINT DEFAULT 0,
    "largura" DECIMAL(10, 2) NOT NULL,
    "altura" DECIMAL(10, 2) NOT NULL
);

-- Tabela de Plantas
CREATE TABLE IF NOT EXISTS "plantas" (
    "id" BIGSERIAL PRIMARY KEY,
    "version" BIGINT DEFAULT 0,
    "nome" VARCHAR(255) NOT NULL,
    "unidade_medida" VARCHAR(50) NOT NULL
);

-- Tabela de Cômodos
CREATE TABLE IF NOT EXISTS "comodos" (
    "id" BIGSERIAL PRIMARY KEY,
    "version" BIGINT DEFAULT 0,
    "nome_comodo" VARCHAR(255) NOT NULL,
    "planta_id" BIGINT NOT NULL,
    CONSTRAINT "fk_comodos_planta" FOREIGN KEY ("planta_id") 
        REFERENCES "plantas" ("id") ON DELETE CASCADE
);

-- Tabela de Paredes
CREATE TABLE IF NOT EXISTS "paredes" (
    "id" BIGSERIAL PRIMARY KEY,
    "version" BIGINT DEFAULT 0,
    "identificacao_parede" VARCHAR(100) NOT NULL,
    "altura" INTEGER NOT NULL,
    "largura" INTEGER NOT NULL,
    "comprimento" INTEGER NOT NULL,
    "quantidade_lp" INTEGER NOT NULL,
    "comodo_id" BIGINT NOT NULL,
    CONSTRAINT "fk_paredes_comodo" FOREIGN KEY ("comodo_id") 
        REFERENCES "comodos" ("id") ON DELETE CASCADE
);

-- Tabela de Elementos Internos
CREATE TABLE IF NOT EXISTS "elementos_internos" (
    "id" BIGSERIAL PRIMARY KEY,
    "version" BIGINT DEFAULT 0,
    "tipo" VARCHAR(50) NOT NULL CHECK ("tipo" IN ('Parede', 'Viga')),
    "identificacao" VARCHAR(100) NOT NULL,
    "largura" INTEGER,
    "altura" INTEGER,
    "comprimento" INTEGER,
    "quantidade_lp" INTEGER,
    "parede_id" BIGINT NOT NULL,
    CONSTRAINT "fk_elementos_parede" FOREIGN KEY ("parede_id") 
        REFERENCES "paredes" ("id") ON DELETE CASCADE
);

-- Índices para otimização
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users" ("email");
CREATE INDEX IF NOT EXISTS "idx_users_cpf" ON "users" ("cpf");
CREATE INDEX IF NOT EXISTS "idx_users_username" ON "users" ("username");
CREATE INDEX IF NOT EXISTS "idx_projetos_status" ON "projetos" ("status");
CREATE INDEX IF NOT EXISTS "idx_projetos_user" ON "projetos" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_projetos_created" ON "projetos" ("created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_geracoes_projeto" ON "geracoes_ia" ("projeto_id");
CREATE INDEX IF NOT EXISTS "idx_comodos_planta" ON "comodos" ("planta_id");
CREATE INDEX IF NOT EXISTS "idx_paredes_comodo" ON "paredes" ("comodo_id");
CREATE INDEX IF NOT EXISTS "idx_elementos_parede" ON "elementos_internos" ("parede_id");

-- =============================================
-- DADOS INICIAIS
-- =============================================

-- Usuário admin padrão (username: admin, senha: admin123)
INSERT INTO "users" ("name", "cpf", "address", "email", "username", "password", "role")
VALUES ('Administrador', '00000000000', 'Sistema', 'admin@speedformas.com', 'admin', 'admin123', 'ADMIN')
ON CONFLICT ("cpf") DO NOTHING;

-- Algumas Formas Speed padrão
INSERT INTO "forma_speed" ("largura", "altura") VALUES 
    (1.10, 2.30),
    (0.55, 2.30),
    (1.10, 1.15),
    (0.55, 1.15)
ON CONFLICT DO NOTHING;

-- Log de sucesso
DO $$
BEGIN
    RAISE NOTICE '=============================================';
    RAISE NOTICE 'SPEED FORMAS - Banco inicializado com sucesso!';
    RAISE NOTICE 'Usuario admin: admin / admin123';
    RAISE NOTICE '=============================================';
END $$;
