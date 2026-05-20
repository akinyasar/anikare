import EventWizard from '@/components/event/wizard'

export const metadata = {
  title: 'Yeni Etkinlik — AnıKare',
}

export default function NewEventPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Yeni Etkinlik Oluştur</h1>
        <p className="text-gray-400 text-sm mt-1">
          3 adımda etkinliğinizi kurun, QR kodunuzu alın.
        </p>
      </div>
      <EventWizard />
    </div>
  )
}
