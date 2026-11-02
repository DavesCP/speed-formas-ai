"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from 'next/navigation'
import { cn } from "@/lib/utils"
import { LayoutDashboard, FolderKanban, Settings, ChevronDown, ChevronRight, Users, Shield, Sliders, Menu, X, LogOut, Library } from 'lucide-react'
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"

interface MenuItem {
  title: string
  icon: React.ReactNode
  href?: string
  children?: MenuItem[]
}

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    href: "/dashboard",
  },
  {
    title: "Projetos",
    icon: <FolderKanban className="h-5 w-5" />,
    children: [
      {
        title: "Gerenciamento",
        icon: <FolderKanban className="h-4 w-4" />,
        href: "/projetos",
      },
      {
        title: "Biblioteca 2D",
        icon: <Library className="h-4 w-4" />,
        href: "/projetos/biblioteca",
      },
    ],
  },
  {
    title: "Configurações",
    icon: <Settings className="h-5 w-5" />,
    children: [
      {
        title: "Controle de Acesso",
        icon: <Shield className="h-4 w-4" />,
        href: "/configuracoes/controle-acesso",
      },
      {
        title: "Perfis",
        icon: <Users className="h-4 w-4" />,
        href: "/configuracoes/controle-acesso/perfis",
      },
      {
        title: "Parametrizadores",
        icon: <Sliders className="h-4 w-4" />,
        href: "/configuracoes/parametrizadores",
      },
    ],
  },
]

function MenuItemComponent({ item, level = 0 }: { item: MenuItem; level?: number }) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const isActive = item.href === pathname
  const hasChildren = item.children && item.children.length > 0

  const handleClick = () => {
    if (hasChildren) {
      setIsOpen(!isOpen)
    }
  }

  const content = (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-all duration-200",
        "hover:bg-[#2a3250]",
        isActive && "bg-[#d03034] text-white",
        !isActive && "text-white",
        level > 0 && "ml-4",
      )}
      onClick={handleClick}
      style={{
        backgroundColor: isActive ? "#d03034" : undefined,
      }}
    >
      <div className="flex items-center gap-3">
        {item.icon}
        <span className="font-medium">{item.title}</span>
      </div>
      {hasChildren && (
        <div className="transition-transform duration-200">
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </div>
      )}
    </div>
  )

  return (
    <div className="animate-slide-in">
      {item.href && !hasChildren ? <Link href={item.href}>{content}</Link> : content}
      {hasChildren && isOpen && (
        <div className="mt-1 space-y-1">
          {item.children?.map((child, index) => (
            <MenuItemComponent key={index} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export function Sidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { user, logout } = useAuth()

  const sidebarContent = (
    <div className="flex flex-col h-full" style={{ backgroundColor: "#1f2539" }}>
      {/* Header */}
      <div className="p-6 border-b" style={{ borderColor: "#2d3548" }}>
        <div className="flex items-center justify-between">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-10-27%20at%2011.52.58-Photoroom-VTnlYo4ialp8n3AOPdMUQr3TGrUkgq.png"
            alt="Speedforma Logo"
            className="h-10 w-auto object-contain"
          />
          <button onClick={() => setIsMobileOpen(false)} className="lg:hidden text-white">
            <X className="h-6 w-6" />
          </button>
        </div>
        <p className="text-sm text-gray-400 mt-1">Sistema de Gestão</p>
      </div>

      {/* User Info */}
      <div className="p-4 border-b" style={{ borderColor: "#2d3548" }}>
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#d03034" }}
          >
            <Users className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item, index) => (
          <MenuItemComponent key={index} item={item} />
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t" style={{ borderColor: "#2d3548" }}>
        <Button onClick={logout} variant="ghost" className="w-full justify-start text-white hover:bg-[#2a3250]">
          <LogOut className="h-5 w-5 mr-3" />
          Sair
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg"
        style={{ backgroundColor: "#1f2539" }}
      >
        <Menu className="h-6 w-6 text-white" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:block w-72 h-screen sticky top-0">{sidebarContent}</aside>

      {/* Sidebar - Mobile */}
      <aside
        className={cn(
          "lg:hidden fixed top-0 left-0 z-50 w-72 h-screen transition-transform duration-300",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
