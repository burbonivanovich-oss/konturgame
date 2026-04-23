import { useState, useEffect } from 'react'
import { Phone } from './design-system'
import { K } from './design-system/tokens'

interface ResponsiveLayoutProps {
  desktopView: React.ReactNode
  mobileView: React.ReactNode
}

export function ResponsiveLayout({ desktopView, mobileView }: ResponsiveLayoutProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (isMobile) {
    return (
      <div style={{
        width: '100%', height: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: K.bone, padding: 16,
      }}>
        <Phone>
          {mobileView}
        </Phone>
      </div>
    )
  }

  return <>{desktopView}</>
}

export default ResponsiveLayout
