import { ImageResponse } from 'next/og'

// Branded link-preview card shown in iMessage, WhatsApp, Slack, Facebook,
// LinkedIn, etc. Generated as a real 1200x630 PNG — social crawlers do not
// render SVG, which is why the old /hasa-logo.svg preview fell back to a
// generic image. Next automatically emits the og:image meta tags for this.
export const alt = 'HASA — Harvard African Students Association'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#4A1414',
          color: '#F7F2EE',
        }}
      >
        <div
          style={{
            fontSize: 180,
            fontWeight: 700,
            letterSpacing: 24,
            // nudge so the letter-spacing doesn't visually shift left
            paddingLeft: 24,
            lineHeight: 1,
          }}
        >
          HASA
        </div>

        {/* Pan-African gradient bar (red → gold → green) */}
        <div
          style={{
            display: 'flex',
            width: 560,
            height: 12,
            borderRadius: 6,
            marginTop: 36,
            marginBottom: 40,
            background: 'linear-gradient(90deg, #8B2C2C 0%, #F4B400 50%, #15803D 100%)',
          }}
        />

        <div
          style={{
            fontSize: 44,
            color: '#EAD7D2',
            textAlign: 'center',
            maxWidth: 900,
          }}
        >
          Harvard African Students Association
        </div>

        <div
          style={{
            fontSize: 26,
            letterSpacing: 8,
            color: '#F4B400',
            marginTop: 24,
          }}
        >
          SINCE 1977
        </div>
      </div>
    ),
    { ...size },
  )
}
