import { ImageWithFallback } from './ImageWithFallback'

interface AvatarStackProps {
  images: string[]
  label: string
}

export function AvatarStack({ images, label }: AvatarStackProps) {
  return (
    <div className="flex items-center" aria-label={label}>
      {images.map((image, index) => <ImageWithFallback key={`${image}-${index}`} src={image} alt="Trip collaborator" className="-ml-2 size-8 rounded-full border-2 border-parchment object-cover first:ml-0" fallbackClassName="-ml-2 size-8 rounded-full border-2 border-parchment first:ml-0" />)}
    </div>
  )
}
