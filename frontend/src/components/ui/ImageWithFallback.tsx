import { useState } from 'react'
import type { ImgHTMLAttributes } from 'react'

interface ImageWithFallbackProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackClassName?: string
  fallbackSrc?: string
}

const DEFAULT_TRAVEL_FALLBACK = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80'

export function ImageWithFallback({ 
  alt, 
  className = '', 
  fallbackClassName = '', 
  fallbackSrc = DEFAULT_TRAVEL_FALLBACK,
  src,
  onError, 
  ...props 
}: ImageWithFallbackProps) {
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(src || fallbackSrc)
  const [hasFailed, setHasFailed] = useState(false)

  const handleError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasFailed) {
      setHasFailed(true)
      setCurrentSrc(fallbackSrc)
    }
    onError?.(event)
  }

  return (
    <img
      {...props}
      src={currentSrc || fallbackSrc}
      alt={alt}
      className={className}
      loading={props.loading || 'lazy'}
      onError={handleError}
    />
  )
}

