import Modal from './Modal'

interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  return (
    <Modal isOpen={isOpen} title="ℹ️ Справка" onClose={onClose} size="lg">
      <div className="space-y-5 max-h-96 overflow-y-auto text-sm">
        <section>
          <h3 className="font-bold text-brand-blue mb-2">📊 Основы игры</h3>
          <p className="text-gray-700 leading-relaxed">
            Управляйте своим бизнесом, прокрутите дни и зарабатывайте деньги.
            Цель: достичь баланса в 500 000 ₽ или пережить 100 дней.
          </p>
        </section>

        <section>
          <h3 className="font-bold text-brand-orange mb-2">💰 Экономика</h3>
          <p className="text-gray-700 leading-relaxed">
            <strong>Доход:</strong> зависит от количества клиентов и их средней покупки.<br/>
            <strong>Расходы:</strong> закупка товара, зарплата персонала, подписки на сервисы.<br/>
            <strong>Налоги:</strong> 6% от выручки каждый день.
          </p>
        </section>

        <section>
          <h3 className="font-bold text-brand-green mb-2">📦 Склад (FIFO)</h3>
          <p className="text-gray-700 leading-relaxed">
            Товары на складе стареют. Если товар находится дольше срока годности,
            он списывается автоматически и наносит убыток.
          </p>
        </section>

        <section>
          <h3 className="font-bold text-brand-purple mb-2">⭐ Репутация и Лояльность</h3>
          <p className="text-gray-700 leading-relaxed">
            <strong>Репутация:</strong> влияет на привлечение клиентов. Падает при опустошении склада.<br/>
            <strong>Лояльность:</strong> влияет на удержание клиентов.
          </p>
        </section>

        <section>
          <h3 className="font-bold text-brand-blue mb-2">🎁 Сервисы Контура</h3>
          <p className="text-gray-700 leading-relaxed">
            Подключайте сервисы Контура для получения бонусов.
            Синергия между сервисами дает дополнительные эффекты.
          </p>
        </section>

        <section>
          <h3 className="font-bold text-brand-orange mb-2">🎯 События</h3>
          <p className="text-gray-700 leading-relaxed">
            Случайные события появляются в течение игры. Выбирайте варианты осторожно.
          </p>
        </section>

        <section>
          <h3 className="font-bold text-red-600 mb-2">⚠️ Условия поражения</h3>
          <p className="text-gray-700 leading-relaxed">
            Игра заканчивается, если баланс падает ниже нуля или репутация достигает 0 трижды подряд.
          </p>
        </section>
      </div>
    </Modal>
  )
}
