import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export default function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div
      className={`bg-secondary rounded-xl p-4 ${hover ? 'hover:bg-secondary-light transition-colors cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
