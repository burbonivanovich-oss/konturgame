interface KHomeProps {
  dark?: boolean
}

export function KHome({ dark = false }: KHomeProps) {
  return <div className="k-home" style={{ background: dark ? '#fff' : '#0E1116' }}/>
}
