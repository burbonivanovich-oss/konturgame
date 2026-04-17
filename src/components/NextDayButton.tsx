import { useState } from 'react'

interface NextDayButtonProps {
  isDisabled?: boolean
  disabledReason?: string
  onNextDay?: () => void
}

export default function NextDayButton({
  isDisabled = false,
  disabledReason = 'Нет событий',
  onNextDay,
}: NextDayButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    if (isDisabled || isLoading) return

    setIsLoading(true)
    try {
      await onNextDay?.()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="text-center">
      <button
        onClick={handleClick}
        disabled={isDisabled || isLoading}
        className={`
          px-12 py-4 rounded-lg font-bold text-lg transition-all transform
          ${
            isDisabled
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 active:scale-95'
          }
          ${isLoading ? 'opacity-75' : ''}
        `}
      >
        {isLoading ? '⏳ Расчёт...' : '→ Следующий день'}
      </button>
      <p className="text-sm text-gray-400 mt-2">{disabledReason}</p>
    </div>
  )
}
