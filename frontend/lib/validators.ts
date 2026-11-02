/**
 * Validadores de campos de formulário
 */

// =============================================
// VALIDADOR DE CPF
// =============================================

/**
 * Valida se um CPF é válido usando o algoritmo de dígitos verificadores
 */
export function validateCPF(cpf: string): { valid: boolean; message?: string } {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, "")

  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) {
    return { valid: false, message: "O CPF deve ter 11 dígitos" }
  }

  // Verifica se todos os dígitos são iguais (CPFs inválidos conhecidos)
  if (/^(\d)\1{10}$/.test(cleanCPF)) {
    return { valid: false, message: "CPF inválido" }
  }

  // Calcula o primeiro dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i)
  }
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleanCPF.charAt(9))) {
    return { valid: false, message: "CPF inválido" }
  }

  // Calcula o segundo dígito verificador
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleanCPF.charAt(10))) {
    return { valid: false, message: "CPF inválido" }
  }

  return { valid: true }
}

// =============================================
// VALIDADOR DE EMAIL
// =============================================

/**
 * Valida se um email é válido
 */
export function validateEmail(email: string): { valid: boolean; message?: string } {
  if (!email || !email.trim()) {
    return { valid: false, message: "O email é obrigatório" }
  }

  const trimmedEmail = email.trim().toLowerCase()

  // Regex mais completa para validação de email
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

  if (!emailRegex.test(trimmedEmail)) {
    return { valid: false, message: "Digite um email válido" }
  }

  // Verifica se tem domínio válido (pelo menos um ponto após @)
  const parts = trimmedEmail.split("@")
  if (parts.length !== 2) {
    return { valid: false, message: "Digite um email válido" }
  }

  const domain = parts[1]
  if (!domain.includes(".")) {
    return { valid: false, message: "O email deve ter um domínio válido (ex: @email.com)" }
  }

  // Verifica extensão mínima do domínio
  const domainParts = domain.split(".")
  const extension = domainParts[domainParts.length - 1]
  if (extension.length < 2) {
    return { valid: false, message: "O email deve ter uma extensão válida" }
  }

  return { valid: true }
}

// =============================================
// VALIDADOR DE USUÁRIO (USERNAME)
// =============================================

/**
 * Valida se um username é válido
 */
export function validateUsername(username: string): { valid: boolean; message?: string } {
  if (!username || !username.trim()) {
    return { valid: false, message: "O usuário é obrigatório" }
  }

  const trimmedUsername = username.trim()

  // Mínimo 3 caracteres
  if (trimmedUsername.length < 3) {
    return { valid: false, message: "O usuário deve ter pelo menos 3 caracteres" }
  }

  // Máximo 30 caracteres
  if (trimmedUsername.length > 30) {
    return { valid: false, message: "O usuário deve ter no máximo 30 caracteres" }
  }

  // Apenas letras minúsculas, números, ponto e underscore
  if (!/^[a-z0-9._]+$/.test(trimmedUsername)) {
    return { valid: false, message: "Use apenas letras minúsculas, números, . e _" }
  }

  // Não pode começar com número, ponto ou underscore
  if (/^[0-9._]/.test(trimmedUsername)) {
    return { valid: false, message: "O usuário deve começar com uma letra" }
  }

  // Não pode terminar com ponto ou underscore
  if (/[._]$/.test(trimmedUsername)) {
    return { valid: false, message: "O usuário não pode terminar com . ou _" }
  }

  // Não pode ter dois pontos ou underscores seguidos
  if (/[._]{2,}/.test(trimmedUsername)) {
    return { valid: false, message: "O usuário não pode ter . ou _ consecutivos" }
  }

  return { valid: true }
}

// =============================================
// VALIDADOR DE SENHA
// =============================================

export interface PasswordStrength {
  score: number // 0-4
  label: string
  color: string
  requirements: {
    minLength: boolean
    hasLetter: boolean
    hasNumber: boolean
    hasSpecial: boolean
    hasUppercase: boolean
  }
}

/**
 * Valida força da senha e retorna requisitos
 */
export function validatePassword(password: string, isRequired: boolean = true): { 
  valid: boolean
  message?: string
  strength?: PasswordStrength 
} {
  // Se não é obrigatória e está vazia, é válida
  if (!isRequired && (!password || password.length === 0)) {
    return { valid: true }
  }

  if (!password) {
    return { valid: false, message: "A senha é obrigatória" }
  }

  const requirements = {
    minLength: password.length >= 6,
    hasLetter: /[a-zA-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
  }

  // Calcula score
  let score = 0
  if (requirements.minLength) score++
  if (requirements.hasLetter) score++
  if (requirements.hasNumber) score++
  if (requirements.hasSpecial) score++
  if (requirements.hasUppercase && password.length >= 8) score++

  // Define label e cor
  let label = "Muito fraca"
  let color = "#dc2626" // red
  if (score >= 4) {
    label = "Forte"
    color = "#16a34a" // green
  } else if (score >= 3) {
    label = "Média"
    color = "#ca8a04" // yellow
  } else if (score >= 2) {
    label = "Fraca"
    color = "#ea580c" // orange
  }

  const strength: PasswordStrength = {
    score,
    label,
    color,
    requirements,
  }

  // Validação mínima: pelo menos 6 caracteres com letra e número
  if (!requirements.minLength) {
    return { 
      valid: false, 
      message: "A senha deve ter pelo menos 6 caracteres",
      strength 
    }
  }

  if (!requirements.hasLetter) {
    return { 
      valid: false, 
      message: "A senha deve conter pelo menos uma letra",
      strength 
    }
  }

  if (!requirements.hasNumber) {
    return { 
      valid: false, 
      message: "A senha deve conter pelo menos um número",
      strength 
    }
  }

  return { valid: true, strength }
}

// =============================================
// VALIDADOR DE NOME
// =============================================

/**
 * Valida nome completo
 */
export function validateName(name: string): { valid: boolean; message?: string } {
  if (!name || !name.trim()) {
    return { valid: false, message: "O nome é obrigatório" }
  }

  const trimmedName = name.trim()

  if (trimmedName.length < 3) {
    return { valid: false, message: "O nome deve ter pelo menos 3 caracteres" }
  }

  if (trimmedName.length > 100) {
    return { valid: false, message: "O nome deve ter no máximo 100 caracteres" }
  }

  // Verifica se contém apenas letras, espaços e acentos
  if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(trimmedName)) {
    return { valid: false, message: "O nome deve conter apenas letras" }
  }

  return { valid: true }
}

// =============================================
// VALIDADOR DE ENDEREÇO
// =============================================

/**
 * Valida endereço
 */
export function validateAddress(address: string): { valid: boolean; message?: string } {
  if (!address || !address.trim()) {
    return { valid: false, message: "O endereço é obrigatório" }
  }

  const trimmedAddress = address.trim()

  if (trimmedAddress.length < 10) {
    return { valid: false, message: "Digite um endereço completo (mínimo 10 caracteres)" }
  }

  if (trimmedAddress.length > 200) {
    return { valid: false, message: "O endereço deve ter no máximo 200 caracteres" }
  }

  return { valid: true }
}


