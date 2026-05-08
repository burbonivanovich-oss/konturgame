import Modal from './Modal'
import { K } from '../design-system/tokens'
import { hasConsent, setConsent } from '../../utils/analytics'

interface PrivacyModalProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * Privacy notice — что игра собирает, что не собирает, как отключить.
 * Минимально-достаточный документ под 152-ФЗ для маркетинговой
 * single-player игры без логина и платежей.
 */
export default function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  const consent = hasConsent()

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🔒 Приватность" size="md">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13, color: K.ink2, lineHeight: 1.6 }}>
        <p>
          «Бизнес с Контуром» — браузерная одиночная игра. Она работает
          в вашем браузере, не требует регистрации и не отправляет
          никаких персональных данных.
        </p>

        <h3 style={{ fontSize: 13, fontWeight: 800, color: K.ink, marginTop: 8 }}>
          Что хранится локально
        </h3>
        <p>
          Прогресс игры (баланс, неделя, выбранные сервисы, репутация
          NPC и т.п.) сохраняется в localStorage вашего браузера под
          ключом <code style={{ background: K.bone, padding: '1px 6px', borderRadius: 4 }}>konturgame_state_v7</code>.
          Эти данные никуда не отправляются, очищаются при удалении
          данных сайта или вручную через «Настройки → Удалить данные».
        </p>

        <h3 style={{ fontSize: 13, fontWeight: 800, color: K.ink, marginTop: 8 }}>
          Анонимная статистика
        </h3>
        <p>
          {consent ? (
            <>
              <strong style={{ color: K.mint }}>Сейчас включена.</strong>{' '}
              Игра пишет в локальный буфер обезличенные события (например,
              «начат прогон с типом „кафе“», «завершена 12-я неделя»,
              «активирован сервис Маркет»). Эти события могут быть
              отправлены для агрегированной аналитики без привязки
              к личности.
            </>
          ) : (
            <>
              <strong style={{ color: K.muted }}>Сейчас отключена.</strong>{' '}
              Никакая телеметрия не пишется и не отправляется. Игра
              работает в полном объёме.
            </>
          )}
        </p>
        <p>
          Анонимные события не содержат: ваше имя, e-mail, IP-адрес,
          ID устройства, точную геолокацию, отпечаток браузера.
          Содержат только: тип бизнеса, номер недели, ID сервиса,
          числовые игровые метрики.
        </p>

        <h3 style={{ fontSize: 13, fontWeight: 800, color: K.ink, marginTop: 8 }}>
          Сторонние ресурсы
        </h3>
        <p>
          Игра загружает шрифт Manrope с Google Fonts — это единственный
          внешний запрос. Ссылки в финальной модалке («Попробовать в
          реальности») ведут на kontur.ru — переходы по ним подчиняются
          политике приватности этого сайта.
        </p>

        <h3 style={{ fontSize: 13, fontWeight: 800, color: K.ink, marginTop: 8 }}>
          Передумали?
        </h3>
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button
            onClick={() => { setConsent(!consent) }}
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              border: `1px solid ${K.line}`,
              background: K.bone,
              color: K.ink,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {consent ? 'Отключить статистику' : 'Включить статистику'}
          </button>
        </div>

        <p style={{ fontSize: 11, color: K.muted, marginTop: 12 }}>
          Версия v1, обновлено: 2026-05-08. Контакт по вопросам приватности —
          через стандартные каналы СКБ Контур.
        </p>
      </div>
    </Modal>
  )
}
