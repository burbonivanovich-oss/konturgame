interface ModalProps {
  isOpen: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  closeButton?: boolean
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
}

export default function Modal({
  isOpen,
  title,
  onClose,
  children,
  size = 'md',
  closeButton = true,
}: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Затемнение фона */}
      <div
        className="absolute inset-0 bg-black bg-opacity-40"
        onClick={onClose}
      />

      {/* Модальное окно */}
      <div className={`relative bg-white rounded-lg p-6 shadow-xl ${sizeClasses[size]} max-h-[80vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          {closeButton && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition text-2xl leading-none hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center"
            >
              ✕
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  )
}
