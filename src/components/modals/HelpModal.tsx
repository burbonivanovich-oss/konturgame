import Modal from './Modal'

interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  return (
    <Modal isOpen={isOpen} title="ℹ️ Справка" onClose={onClose} size="lg">
      <div className="space-y-4 max-h-96 overflow-y-auto text-sm text-gray-300">
        <section>
          <h3 className="font-bold text-green-400 mb-2">📊 Основы игры</h3>
          <p className="mb-2">
            Управляйте своим бизнесом, прокрутите дни и зарабатывайте деньги.
            Цель: достичь баланса в 500 000 ₽ или пережить 100 дней.
          </p>
        </section>

        <section>
          <h3 className="font-bold text-green-400 mb-2">💰 Экономика</h3>
          <p className="mb-2">
            <strong>Доход:</strong> зависит от количества клиентов и их средней покупки.<br/>
            <strong>Расходы:</strong> закупка товара, зарплата персонала, подписки на сервисы.<br/>
            <strong>Налоги:</strong> 20% от прибыли каждый день.
          </p>
        </section>

        <section>
          <h3 className="font-bold text-green-400 mb-2">📦 Склад (FIFO)</h3>
          <p className="mb-2">
            Товары на складе стареют. Если товар находится дольше срока годности,
            он списывается автоматически и наносит убыток.
          </p>
        </section>

        <section>
          <h3 className="font-bold text-green-400 mb-2">⭐ Репутация и Лояльность</h3>
          <p className="mb-2">
            <strong>Репутация:</strong> влияет на привлечение клиентов. Падает при опустошении склада.<br/>
            <strong>Лояльность:</strong> влияет на удержание клиентов. Нужна хорошая лояльность,
            чтобы не потерять клиентов.
          </p>
        </section>

        <section>
          <h3 className="font-bold text-green-400 mb-2">🎁 Сервисы Контура</h3>
          <p className="mb-2">
            Подключайте сервисы Контура (Маркет, Банк, ОФД и др.),
            чтобы получить бонусы. Синергия между сервисами дает дополнительные эффекты.
          </p>
        </section>

        <section>
          <h3 className="font-bold text-green-400 mb-2">🎯 События</h3>
          <p className="mb-2">
            Случайные события появляются в течение игры. Выбирайте варианты осторожно
            — они влияют на вашу экономику и репутацию.
          </p>
        </section>

        <section>
          <h3 className="font-bold text-green-400 mb-2">🔧 Улучшения</h3>
          <p className="mb-2">
            Расширяйте помещение, нанимайте персонал и улучшайте оборудование,
            чтобы увеличить эффективность.
          </p>
        </section>

        <section>
          <h3 className="font-bold text-red-400 mb-2">⚠️ Условия поражения</h3>
          <p>
            Игра заканчивается, если баланс падает ниже нуля или репутация достигает 0 трижды подряд.
          </p>
        </section>
      </div>
    </Modal>
  )
}
