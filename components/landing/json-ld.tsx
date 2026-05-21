const SITE_URL = 'https://anikare.vercel.app' // TODO: anikare.co alındığında güncelle

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      '@id': `${SITE_URL}/#app`,
      name: 'AnıKare',
      url: SITE_URL,
      description:
        'Düğün ve davetler için QR tabanlı dijital fotoğraf paylaşım platformu. Misafirleriniz QR kod okutarak anında fotoğraf paylaşır.',
      applicationCategory: 'PhotographyApplication',
      operatingSystem: 'Web Browser',
      inLanguage: 'tr-TR',
      offers: [
        {
          '@type': 'Offer',
          name: 'Ücretsiz',
          price: '0',
          priceCurrency: 'TRY',
          description: '10 fotoğraf, 2 video',
        },
        {
          '@type': 'Offer',
          name: 'Standart',
          price: '1000',
          priceCurrency: 'TRY',
          description: 'Sınırsız fotoğraf, 20 video, 4K kalite',
        },
        {
          '@type': 'Offer',
          name: 'Premium',
          price: '1399',
          priceCurrency: 'TRY',
          description: 'Sınırsız fotoğraf ve video, canlı slayt gösterisi',
        },
      ],
    },
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#org`,
      name: 'AnıKare',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/brand/logo.svg`,
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'AnıKare',
      description: 'Düğün ve etkinlikler için QR tabanlı fotoğraf paylaşım platformu',
      publisher: { '@id': `${SITE_URL}/#org` },
      inLanguage: 'tr-TR',
    },
  ],
}

export default function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
