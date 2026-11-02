"use client"

import { useState, useEffect } from "react"
import { Bell, User, Settings, LogOut, Eye, EyeOff, Loader2, AlertCircle, Check, X } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { config } from "@/lib/config"
import { 
  validateName, 
  validateEmail, 
  validateUsername, 
  validatePassword,
  type PasswordStrength 
} from "@/lib/validators"

interface FieldError {
  message: string
}

interface FormErrors {
  name?: FieldError
  email?: FieldError
  username?: FieldError
  currentPassword?: FieldError
  newPassword?: FieldError
  confirmPassword?: FieldError
}

interface TouchedFields {
  name: boolean
  email: boolean
  username: boolean
  currentPassword: boolean
  newPassword: boolean
  confirmPassword: boolean
}

const initialTouched: TouchedFields = {
  name: false,
  email: false,
  username: false,
  currentPassword: false,
  newPassword: false,
  confirmPassword: false,
}

export function Header() {
  const { user, logout, updateUser } = useAuth()
  const { toast } = useToast()
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [touched, setTouched] = useState<TouchedFields>(initialTouched)
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength | null>(null)
  
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    username: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Atualiza força da senha
  useEffect(() => {
    if (profileForm.newPassword) {
      const validation = validatePassword(profileForm.newPassword, false)
      setPasswordStrength(validation.strength || null)
    } else {
      setPasswordStrength(null)
    }
  }, [profileForm.newPassword])

  // Validações usando os validadores
  const getErrors = (): FormErrors => {
    const errors: FormErrors = {}

    const nameValidation = validateName(profileForm.name)
    if (!nameValidation.valid) errors.name = { message: nameValidation.message! }

    const emailValidation = validateEmail(profileForm.email)
    if (!emailValidation.valid) errors.email = { message: emailValidation.message! }

    const usernameValidation = validateUsername(profileForm.username)
    if (!usernameValidation.valid) errors.username = { message: usernameValidation.message! }

    // Valida senha atual só se está tentando alterar
    if (profileForm.newPassword && !profileForm.currentPassword) {
      errors.currentPassword = { message: "Digite a senha atual para alterar" }
    }

    // Valida nova senha
    if (profileForm.newPassword) {
      const passwordValidation = validatePassword(profileForm.newPassword, false)
      if (!passwordValidation.valid) errors.newPassword = { message: passwordValidation.message! }
    }

    // Valida confirmação
    if (profileForm.newPassword && !profileForm.confirmPassword) {
      errors.confirmPassword = { message: "Confirme a nova senha" }
    } else if (profileForm.confirmPassword && profileForm.confirmPassword !== profileForm.newPassword) {
      errors.confirmPassword = { message: "As senhas não coincidem" }
    }

    return errors
  }

  const errors = getErrors()

  const isFormValid = Object.keys(errors).length === 0

  const handleBlur = (field: keyof TouchedFields) => {
    setTouched({ ...touched, [field]: true })
  }

  const getInputClassName = (field: keyof FormErrors) => {
    const hasError = touched[field] && errors[field]
    return hasError ? "!border-red-500 focus:!border-red-500 focus:!ring-red-500" : ""
  }

  const renderFieldError = (field: keyof FormErrors) => {
    if (touched[field] && errors[field]) {
      return (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {errors[field]?.message}
        </p>
      )
    }
    return null
  }

  const renderPasswordStrength = () => {
    if (!passwordStrength || !profileForm.newPassword) return null

    return (
      <div className="mt-2 space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full transition-all duration-300"
              style={{ 
                width: `${(passwordStrength.score / 4) * 100}%`,
                backgroundColor: passwordStrength.color 
              }}
            />
          </div>
          <span className="text-xs font-medium" style={{ color: passwordStrength.color }}>
            {passwordStrength.label}
          </span>
        </div>
        <div className="text-xs space-y-1">
          <div className={`flex items-center gap-1 ${passwordStrength.requirements.minLength ? 'text-green-600' : 'text-gray-400'}`}>
            {passwordStrength.requirements.minLength ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
            Mínimo 6 caracteres
          </div>
          <div className={`flex items-center gap-1 ${passwordStrength.requirements.hasLetter ? 'text-green-600' : 'text-gray-400'}`}>
            {passwordStrength.requirements.hasLetter ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
            Pelo menos uma letra
          </div>
          <div className={`flex items-center gap-1 ${passwordStrength.requirements.hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
            {passwordStrength.requirements.hasNumber ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
            Pelo menos um número
          </div>
        </div>
      </div>
    )
  }

  const handleOpenProfile = () => {
    if (user) {
      setProfileForm({
        name: user.name,
        email: user.email,
        username: user.username,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    }
    setTouched(initialTouched)
    setShowPassword(false)
    setShowNewPassword(false)
    setPasswordStrength(null)
    setIsProfileDialogOpen(true)
  }

  const handleSaveProfile = async () => {
    // Marca campos obrigatórios como touched
    setTouched({
      name: true,
      email: true,
      username: true,
      currentPassword: !!profileForm.newPassword,
      newPassword: touched.newPassword,
      confirmPassword: !!profileForm.newPassword,
    })

    if (!isFormValid) {
      toast({
        title: "Erro de Validação",
        description: "Corrija os campos destacados antes de continuar",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      const updateData: any = {
        name: profileForm.name,
        email: profileForm.email,
        username: profileForm.username,
      }

      if (profileForm.newPassword && profileForm.currentPassword) {
        const loginResponse = await fetch(`${config.apiUrl}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: user?.username,
            password: profileForm.currentPassword,
          }),
        })

        if (!loginResponse.ok) {
          setTouched({ ...touched, currentPassword: true })
          toast({
            title: "Erro",
            description: "Senha atual incorreta",
            variant: "destructive",
          })
          setIsSaving(false)
          return
        }

        updateData.password = profileForm.newPassword
      }

      const response = await fetch(`${config.apiUrl}/users/${user?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Erro ao atualizar perfil")
      }

      const updatedUser = await response.json()

      updateUser({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        username: updatedUser.username,
        role: updatedUser.role,
      })

      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!",
      })

      setIsProfileDialogOpen(false)
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao atualizar perfil",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b backdrop-blur-sm bg-white/80" style={{ borderColor: "#e5e7eb" }}>
        <div className="flex items-center justify-between h-16 px-6 lg:px-8">
          <div className="flex items-center gap-2 lg:ml-0 ml-12">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-10-27%20at%2011.52.58-Photoroom-VTnlYo4ialp8n3AOPdMUQr3TGrUkgq.png"
              alt="Speedforma Logo"
              className="h-8 w-auto object-contain"
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="icon" className="relative hover:bg-gray-100">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full" style={{ backgroundColor: "#d03034" }} />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 sm:gap-3 hover:bg-gray-100">
                  <div
                    className="h-8 w-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#d03034" }}
                  >
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-sm font-medium" style={{ color: "#1f2539" }}>
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.role === "ADMIN" ? "Administrador" : "Usuário"}
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user?.name}</span>
                    <span className="text-xs text-gray-500 font-normal">@{user?.username}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleOpenProfile} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Meu Perfil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Meu Perfil</DialogTitle>
            <DialogDescription>
              Atualize suas informações pessoais e senha
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4 px-2 max-h-[55vh] overflow-y-auto -mx-2">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-700">Dados Pessoais</h4>
              
              <div className="space-y-2">
                <Label htmlFor="profile-name">Nome Completo *</Label>
                <Input
                  id="profile-name"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  onBlur={() => handleBlur("name")}
                  placeholder="Seu nome completo"
                  className={getInputClassName("name")}
                />
                {renderFieldError("name")}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="profile-username">Usuário *</Label>
                  <Input
                    id="profile-username"
                    value={profileForm.username}
                    onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value.toLowerCase().replace(/\s/g, '') })}
                    onBlur={() => handleBlur("username")}
                    placeholder="seu.usuario"
                    className={getInputClassName("username")}
                  />
                  {renderFieldError("username")}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-email">Email *</Label>
                  <Input
                    id="profile-email"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    onBlur={() => handleBlur("email")}
                    placeholder="seu@email.com"
                    className={getInputClassName("email")}
                  />
                  {renderFieldError("email")}
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h4 className="text-sm font-semibold text-gray-700">Alterar Senha</h4>
              <p className="text-xs text-gray-500">Deixe em branco para manter a senha atual</p>

              <div className="space-y-2">
                <Label htmlFor="current-password">Senha Atual</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showPassword ? "text" : "password"}
                    value={profileForm.currentPassword}
                    onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                    onBlur={() => handleBlur("currentPassword")}
                    placeholder="Digite sua senha atual"
                    className={`pr-10 ${getInputClassName("currentPassword")}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {renderFieldError("currentPassword")}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nova Senha</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      value={profileForm.newPassword}
                      onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                      onBlur={() => handleBlur("newPassword")}
                      placeholder="Nova senha"
                      className={`pr-10 ${getInputClassName("newPassword")}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {renderFieldError("newPassword")}
                  {renderPasswordStrength()}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Senha</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={profileForm.confirmPassword}
                    onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                    onBlur={() => handleBlur("confirmPassword")}
                    placeholder="Confirme a nova senha"
                    className={getInputClassName("confirmPassword")}
                  />
                  {renderFieldError("confirmPassword")}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProfileDialogOpen(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveProfile}
              style={{ backgroundColor: "#d03034", color: "#ffffff" }}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
