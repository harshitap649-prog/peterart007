'use client'

import { ReactNode } from 'react'
import PWAInstallButton from './PWAInstallButton'
import useServiceWorker from '../hooks/useServiceWorker'

interface ClientOnlyWrapperProps {
  children: ReactNode
}

export default function ClientOnlyWrapper({ children }: ClientOnlyWrapperProps) {
  useServiceWorker()
  
  return (
    <>
      {children}
      <PWAInstallButton />
    </>
  )
}
