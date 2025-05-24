"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Clock, Building, LogOut, Moon, Sun, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDateTime } from "@/lib/utils"

interface HeaderProps {
  userName: string
  userRole: string
  onLogout: () => void
}

export function Header({ userName, userRole, onLogout }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const { theme, setTheme } = useTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])
  
  const dateTime = formatDateTime(currentTime)
  
  return (
    <header className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-1.5 rounded-md shadow-sm">
              <Building className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-medium text-gray-900 dark:text-white leading-tight">
                Sistema de Reserva de Laboratórios
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {userRole === "admin" ? "Administrador" : "Professor"} • {userName}
              </p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-sm font-medium text-gray-900 dark:text-white">Lab Reservas</h1>
            </div>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-3">
            {/* Relógio com design compacto */}
            <div className="px-2 py-1 rounded-md border border-gray-100 dark:border-gray-700 text-right">
              <div className="text-xs font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1">
                <Clock className="h-3 w-3" /> {dateTime.day.substring(0, 3)}
              </div>
              <div className="text-sm font-mono text-blue-600 dark:text-blue-400">{dateTime.time}</div>
            </div>

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-8 w-8 rounded-full"
            >
              {theme === "dark" ? <Sun className="h-4 w-4 text-yellow-500" /> : <Moon className="h-4 w-4 text-blue-700" />}
            </Button>

            <Button 
              variant="ghost" 
              onClick={onLogout}
              size="sm"
              className="h-8 text-xs gap-1 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20 dark:hover:text-red-300"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sair
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-7 w-7 rounded-full"
            >
              {theme === "dark" ? <Sun className="h-3.5 w-3.5 text-yellow-500" /> : <Moon className="h-3.5 w-3.5 text-blue-700" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`h-7 w-7 rounded-full transition-colors ${isMobileMenuOpen ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300' : ''}`}
            >
              {isMobileMenuOpen ? <X className="h-3.5 w-3.5" /> : <Menu className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 dark:border-gray-700 py-2 animate-in slide-in-from-top duration-200">
            <div className="space-y-2 py-1">
              <div className="px-1 text-xs text-gray-500 dark:text-gray-400">
                {userRole === "admin" ? "Administrador" : "Professor"} • {userName}
              </div>

              {/* Relógio mobile */}
              <div className="flex items-center justify-between text-xs p-1.5 rounded-md bg-gray-50 dark:bg-gray-700/50">
                <div className="font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {dateTime.day.substring(0, 3)}, {dateTime.date}
                </div>
                <div className="font-mono text-blue-600 dark:text-blue-400">{dateTime.time}</div>
              </div>

              <div className="pt-1">
                <Button 
                  variant="ghost" 
                  onClick={onLogout} 
                  size="sm"
                  className="w-full justify-start text-xs hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                >
                  <LogOut className="h-3.5 w-3.5 mr-1.5" />
                  Sair
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
