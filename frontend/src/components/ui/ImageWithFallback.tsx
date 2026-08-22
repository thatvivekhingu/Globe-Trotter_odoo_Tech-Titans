import { ImageOff } from 'lucide-react'
import { useState } from 'react'
import type { ImgHTMLAttributes } from 'react'

interface ImageWithFallbackProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackClassName?: string
}

export function ImageWithFallback({ alt, className = '', fallbackClassName = '', onError, ...props }: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div role="img" aria-label={alt} className={['flex items-center justify-center bg-ink/5 text-ink/35', fallbackClassName || className].join(' ')}>
        <ImageOff size={22} aria-hidden="true" />
      </div>
    )
  }

  return <img {...props} alt={alt} className={className} loading={props.loading || 'lazy'} onError={(event) => { setFailed(true); onError?.(event) }} />
}
