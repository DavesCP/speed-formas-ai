# UserRole API

API RESTful para gerenciamento de usuários com Spring Boot 3 e PostgreSQL.

## 📋 Descrição

Sistema de cadastro de usuários com autenticação baseada em perfis (roles). A aplicação oferece um CRUD completo com suporte a versionamento otimista para controle de concorrência.

## 🚀 Tecnologias

- **Java 21**
- **Spring Boot 3.5.7**
- **Spring Data JPA**
- **PostgreSQL**
- **Lombok**
- **Swagger/OpenAPI 3** (Documentação)
- **Maven**

## 📦 Estrutura do Projeto

```
src/
├── main/
│   ├── java/br/com/user/
│   │   ├── config/           # Configurações (OpenAPI)
│   │   ├── controller/       # Controllers REST
│   │   ├── dto/              # Data Transfer Objects
│   │   ├── entity/           # Entidades JPA
│   │   ├── enums/            # Enumerações (Role)
│   │   ├── repository/       # Repositórios JPA
│   │   ├── service/          # Lógica de negócio
│   │   └── UserApplication.java
│   └── resources/
│       └── application.yaml  # Configurações da aplicação
└── test/                     # Testes unitários
```

## 🔧 Pré-requisitos

- Java 21
- PostgreSQL 12+
- Maven 3.8+

## ⚙️ Configuração

### Banco de Dados

1. Crie um banco de dados PostgreSQL:
```sql
CREATE DATABASE postgres;
```

2. Configure as variáveis de ambiente (opcional):
```bash
export POSTGRES_SERVICE_HOST=localhost
export POSTGRES_SERVICE_PORT=5432
export POSTGRES_DATABASE=postgres
export POSTGRES_USERNAME=postgres
export POSTGRES_PASSWORD=postgres
```

Ou edite o arquivo `src/main/resources/application.yaml`.

### Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd user
```

2. Compile o projeto:
```bash
./mvnw clean install
```

3. Execute a aplicação:
```bash
./mvnw spring-boot:run
```

A aplicação estará disponível em: `http://localhost:8085`

## 📚 Documentação da API

Acesse a documentação Swagger UI:
```
http://localhost:8085/swagger-ui.html
```

OpenAPI Docs (JSON):
```
http://localhost:8085/api-docs
```

## 🔌 Endpoints

### Criar Usuário
```http
POST /api/users
Content-Type: application/json

{
  "name": "João Silva",
  "cpf": "12345678900",
  "address": "Rua Principal, 123, São Paulo, SP",
  "email": "joao.silva@email.com",
  "role": "USER"
}
```

### Listar Todos os Usuários
```http
GET /api/users
```

### Buscar Usuário por ID
```http
GET /api/users/{id}
```

### Atualizar Usuário
```http
PUT /api/users/{id}
Content-Type: application/json

{
  "name": "João Silva Santos",
  "cpf": "12345678900",
  "address": "Rua Secundária, 456, São Paulo, SP",
  "email": "joao.santos@email.com",
  "role": "ADMIN"
}
```

### Deletar Usuário
```http
DELETE /api/users/{id}
```

## 👥 Modelo de Dados

### Entidade UserRole

| Campo   | Tipo   | Descrição                    | Restrições          |
|---------|--------|------------------------------|---------------------|
| id      | Long   | Identificador único          | Auto incremento     |
| version | Long   | Controle de concorrência     | Gerenciado pelo JPA |
| name    | String | Nome completo do usuário     | Obrigatório         |
| cpf     | String | CPF (11 dígitos)             | Único, Obrigatório  |
| address | String | Endereço completo            | Obrigatório         |
| email   | String | Email do usuário             | Único, Obrigatório  |
| role    | Enum   | Perfil (ADMIN ou USER)       | Obrigatório         |

### Roles Disponíveis

- **ADMIN**: Administrador do sistema
- **USER**: Usuário comum

## 🛡️ Recursos de Segurança

- **Versionamento Otimista**: Implementado com `@Version` para evitar conflitos em atualizações concorrentes
- **Validação de Unicidade**: CPF e Email são únicos no sistema
- **Pool de Conexões**: HikariCP configurado para otimizar performance

## ⚠️ Tratamento de Erros Conhecidos

### StaleObjectStateException
Ocorre quando há tentativa de atualização concorrente. Solução implementada:
- Campo `version` gerenciado automaticamente pelo Hibernate
- Validação de entidade destacada no service

### DataIntegrityViolationException
Prevenido através de:
- Validação de CPF e Email duplicados antes do save
- Inicialização correta de `id` e `version` como `null` em novas entidades

## 🧪 Testes

Execute os testes:
```bash
./mvnw test
```

## 📝 Licença

Este projeto é de uso educacional/demonstrativo.

## 👨‍💻 Autor

Desenvolvido com Spring Boot 3 e Java 21.

---

**Porta da Aplicação**: 8085  
**Context Path**: /  
**Formato de Resposta**: JSON

