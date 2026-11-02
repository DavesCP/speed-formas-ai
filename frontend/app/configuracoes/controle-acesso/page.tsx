"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Loader2, Eye, EyeOff, AlertCircle, Check, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { usersService, type User, type CreateUserData } from "@/lib/services/users-service"
import { 
  validateCPF, 
  validateEmail, 
  validateUsername, 
  validatePassword, 
  validateName, 
  validateAddress,
  type PasswordStrength 
} from "@/lib/validators"

interface FieldError {
  message: string
}

interface FormErrors {
  name?: FieldError
  cpf?: FieldError
  username?: FieldError
  password?: FieldError
  email?: FieldError
  address?: FieldError
}

interface TouchedFields {
  name: boolean
  cpf: boolean
  username: boolean
  password: boolean
  email: boolean
  address: boolean
}

const initialTouched: TouchedFields = {
  name: false,
  cpf: false,
  username: false,
  password: false,
  email: false,
  address: false,
}

export default function ControleAcessoPage() {
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState<TouchedFields>(initialTouched)
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState<CreateUserData>({
    name: "",
    cpf: "",
    address: "",
    email: "",
    username: "",
    password: "",
    role: "USER",
  })

  // Validações usando os validadores
  const getErrors = (): FormErrors => {
    const errors: FormErrors = {}

    const nameValidation = validateName(formData.name)
    if (!nameValidation.valid) errors.name = { message: nameValidation.message! }

    const cpfValidation = validateCPF(formData.cpf)
    if (!cpfValidation.valid) errors.cpf = { message: cpfValidation.message! }

    const usernameValidation = validateUsername(formData.username)
    if (!usernameValidation.valid) errors.username = { message: usernameValidation.message! }

    const passwordValidation = validatePassword(formData.password, !editingUser)
    if (!passwordValidation.valid) errors.password = { message: passwordValidation.message! }

    const emailValidation = validateEmail(formData.email)
    if (!emailValidation.valid) errors.email = { message: emailValidation.message! }

    const addressValidation = validateAddress(formData.address)
    if (!addressValidation.valid) errors.address = { message: addressValidation.message! }

    return errors
  }

  const errors = getErrors()

  const isFormValid = Object.keys(errors).length === 0

  const handleBlur = (field: keyof TouchedFields) => {
    setTouched({ ...touched, [field]: true })
  }

  // Atualiza a força da senha quando ela muda
  useEffect(() => {
    if (formData.password) {
      const validation = validatePassword(formData.password, !editingUser)
      setPasswordStrength(validation.strength || null)
    } else {
      setPasswordStrength(null)
    }
  }, [formData.password, editingUser])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      const usersData = await usersService.getUsers()
      setUsers(usersData)
    } catch (error) {
      console.error("Erro ao carregar usuários:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar usuários do servidor",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.cpf.includes(searchTerm),
  )

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        name: user.name,
        cpf: user.cpf,
        address: user.address,
        email: user.email,
        username: user.username,
        password: "",
        role: user.role,
      })
    } else {
      setEditingUser(null)
      setFormData({
        name: "",
        cpf: "",
        address: "",
        email: "",
        username: "",
        password: "",
        role: "USER",
      })
    }
    setTouched(initialTouched)
    setShowPassword(false)
    setPasswordStrength(null)
    setIsDialogOpen(true)
  }

  const handleSaveUser = async () => {
    // Marca todos os campos como touched
    setTouched({
      name: true,
      cpf: true,
      username: true,
      password: true,
      email: true,
      address: true,
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
      const cpfClean = formData.cpf.replace(/\D/g, "")
      const dataToSend = {
        ...formData,
        cpf: cpfClean,
      }

      if (editingUser) {
        if (!dataToSend.password) {
          delete (dataToSend as any).password
        }
        const updated = await usersService.updateUser(editingUser.id, dataToSend)
        setUsers(users.map((user) => (user.id === editingUser.id ? updated : user)))
        toast({
          title: "Sucesso",
          description: "Usuário atualizado com sucesso",
        })
      } else {
        const newUser = await usersService.createUser(dataToSend)
        setUsers([...users, newUser])
        toast({
          title: "Sucesso",
          description: "Usuário criado com sucesso",
        })
      }
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Erro ao salvar usuário:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao salvar usuário",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteUser = async () => {
    if (userToDelete) {
      try {
        await usersService.deleteUser(userToDelete.id)
        setUsers(users.filter((user) => user.id !== userToDelete.id))
        toast({
          title: "Sucesso",
          description: "Usuário excluído com sucesso",
        })
        setIsDeleteDialogOpen(false)
        setUserToDelete(null)
      } catch (error) {
        console.error("Erro ao deletar usuário:", error)
        toast({
          title: "Erro",
          description: "Erro ao deletar usuário",
          variant: "destructive",
        })
      }
    }
  }

  const formatCPF = (cpf: string) => {
    const clean = cpf.replace(/\D/g, "")
    if (clean.length <= 3) return clean
    if (clean.length <= 6) return `${clean.slice(0, 3)}.${clean.slice(3)}`
    if (clean.length <= 9) return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6)}`
    return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9, 11)}`
  }

  const handleCPFChange = (value: string) => {
    const clean = value.replace(/\D/g, "").slice(0, 11)
    setFormData({ ...formData, cpf: clean })
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
    if (!passwordStrength || !formData.password) return null

    return (
      <div className="mt-2 space-y-2">
        {/* Barra de força */}
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

        {/* Requisitos */}
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

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-500">Carregando usuários...</span>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: "#1f2539" }}>
              Controle de Acesso
            </h1>
            <p className="text-gray-600 mt-1">Gerencie usuários e permissões do sistema</p>
          </div>
          <Button
            onClick={() => handleOpenDialog()}
            className="font-semibold"
            style={{ backgroundColor: "#d03034", color: "#ffffff" }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Usuário
          </Button>
        </div>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle style={{ color: "#1f2539" }}>Usuários do Sistema</CardTitle>
            <CardDescription>Lista completa de usuários cadastrados ({users.length} usuários)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome, email, usuário ou CPF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        Nenhum usuário encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-gray-50">
                        <TableCell className="font-mono text-sm">{user.id}</TableCell>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell className="font-mono text-sm">{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell className="font-mono">{formatCPF(user.cpf)}</TableCell>
                        <TableCell>
                          <Badge
                            style={{
                              backgroundColor: user.role === "ADMIN" ? "#d03034" : "#3b82f6",
                              color: "#ffffff",
                            }}
                          >
                            {user.role === "ADMIN" ? "Administrador" : "Usuário"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDialog(user)}
                              className="hover:bg-gray-100"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setUserToDelete(user)
                                setIsDeleteDialogOpen(true)
                              }}
                              className="hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Dialog para Criar/Editar Usuário */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>{editingUser ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
              <DialogDescription>
                {editingUser ? "Atualize as informações do usuário" : "Preencha os dados para criar um novo usuário"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 px-2 max-h-[55vh] overflow-y-auto -mx-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  placeholder="Digite o nome completo"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  onBlur={() => handleBlur("name")}
                  className={getInputClassName("name")}
                />
                {renderFieldError("name")}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  value={formatCPF(formData.cpf)}
                  onChange={(e) => handleCPFChange(e.target.value)}
                  onBlur={() => handleBlur("cpf")}
                  maxLength={14}
                  className={getInputClassName("cpf")}
                />
                {renderFieldError("cpf")}
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Usuário (Login) *</Label>
                <Input
                  id="username"
                  placeholder="usuario.login"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s/g, '') })}
                  onBlur={() => handleBlur("username")}
                  className={getInputClassName("username")}
                />
                {renderFieldError("username")}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  Senha {editingUser ? "(deixe vazio para manter)" : "*"}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={editingUser ? "••••••••" : "Digite a senha"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    onBlur={() => handleBlur("password")}
                    className={`pr-10 ${getInputClassName("password")}`}
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
                {renderFieldError("password")}
                {renderPasswordStrength()}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  onBlur={() => handleBlur("email")}
                  className={getInputClassName("email")}
                />
                {renderFieldError("email")}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço *</Label>
                <Input
                  id="address"
                  placeholder="Rua, número, cidade, estado"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  onBlur={() => handleBlur("address")}
                  className={getInputClassName("address")}
                />
                {renderFieldError("address")}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Perfil de Acesso *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: "ADMIN" | "USER") => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">Usuário</SelectItem>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveUser} 
                style={{ backgroundColor: "#d03034", color: "#ffffff" }}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  editingUser ? "Salvar Alterações" : "Criar Usuário"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Confirmação de Exclusão */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir o usuário <strong>{userToDelete?.name}</strong>? Esta ação não pode ser
                desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleDeleteUser} style={{ backgroundColor: "#d03034", color: "#ffffff" }}>
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
