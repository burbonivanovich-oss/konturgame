import { ReactNode } from 'react'
import { KStatusBar } from './KStatusBar'
import { KHome } from './KHome'
import { K } from './tokens'

interface PhoneProps {
  children: ReactNode
  bg?: string
  dark?: boolean
}

export function Phone({ children, bg = K.bone, dark = false }: PhoneProps) {
  return (
    <div className="kg-phone" style={{ background: bg }}>
      <KStatusBar dark={dark}/>
      <div className="kg-body">{children}</div>
      <KHome dark={dark}/>
    </div>
  )
}
