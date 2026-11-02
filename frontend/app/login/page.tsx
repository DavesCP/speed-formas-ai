"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2, User, Lock } from 'lucide-react'
import { validateUsername, validatePassword } from "@/lib/validators"

interface FieldError {
  message: string
}

interface FormErrors {
  username?: FieldError
  password?: FieldError
}

interface TouchedFields {
  username: boolean
  password: boolean
}

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [touched, setTouched] = useState<TouchedFields>({ username: false, password: false })
  const { login } = useAuth()
  const router = useRouter()

  // Validações usando os validadores
  const getErrors = (): FormErrors => {
    const usernameValidation = validateUsername(username)
    const passwordValidation = validatePassword(password, true)

    return {
      username: !usernameValidation.valid ? { message: usernameValidation.message! } : undefined,
      password: !passwordValidation.valid ? { message: passwordValidation.message! } : undefined,
    }
  }

  const errors = getErrors()

  const handleBlur = (field: keyof TouchedFields) => {
    setTouched({ ...touched, [field]: true })
  }

  const isFormValid = !errors.username && !errors.password

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Marca todos os campos como touched
    setTouched({ username: true, password: true })
    
    if (!isFormValid) {
      return
    }

    setError("")
    setIsLoading(true)

    const success = await login(username, password)

    if (success) {
      router.push("/dashboard")
    } else {
      setError("Usuário ou senha inválidos")
      setIsLoading(false)
    }
  }

  const getInputClassName = (field: keyof FormErrors) => {
    const hasError = touched[field] && errors[field]
    return `pl-10 border-gray-600 ${hasError ? "!border-red-500 focus:!border-red-500 focus:!ring-red-500" : ""}`
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#1f2539" }}>
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-10-27%20at%2011.52.58-Photoroom-VTnlYo4ialp8n3AOPdMUQr3TGrUkgq.png"
            alt="Speedforma Logo"
            className="h-16 w-auto object-contain mx-auto mb-4"
          />
          <p className="text-gray-400">Sistema de Gestão</p>
        </div>

        <Card className="border-0 shadow-2xl" style={{ backgroundColor: "#2a3250" }}>
          <CardHeader>
            <CardTitle className="text-2xl" style={{ color: "#ffffff" }}>
              Entrar
            </CardTitle>
            <CardDescription style={{ color: "#9ca3af" }}>
              Digite suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" style={{ color: "#ffffff" }}>
                  Usuário
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Digite seu usuário"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                    onBlur={() => handleBlur("username")}
                    className={getInputClassName("username")}
                    style={{ backgroundColor: "#1f2539", color: "#ffffff" }}
                  />
                </div>
                {touched.username && errors.username && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.username.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" style={{ color: "#ffffff" }}>
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => handleBlur("password")}
                    className={getInputClassName("password")}
                    style={{ backgroundColor: "#1f2539", color: "#ffffff" }}
                  />
                </div>
                {touched.password && errors.password && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              {error && (
                <div
                  className="flex items-center gap-2 text-sm p-3 rounded-md"
                  style={{ backgroundColor: "#d03034", color: "#ffffff" }}
                >
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full font-semibold"
                disabled={isLoading}
                style={{ backgroundColor: "#d03034", color: "#ffffff" }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>

            <div className="mt-6 p-4 rounded-md" style={{ backgroundColor: "#1f2539" }}>
              <p className="text-xs font-semibold mb-2" style={{ color: "#ffffff" }}>
                Credenciais de teste:
              </p>
              <p className="text-xs" style={{ color: "#9ca3af" }}>
                Usuário: admin
              </p>
              <p className="text-xs" style={{ color: "#9ca3af" }}>
                Senha: admin123
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
