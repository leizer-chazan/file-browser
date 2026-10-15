import exifr from 'exifr'

export interface ImageMetadata {
  readonly width: number
  readonly height: number
  readonly camera: string
  readonly capturedAt: string
  readonly exposure: string
  readonly iso: string
  readonly location: string
}

interface ExifData {
  Make?: string
  Model?: string
  DateTimeOriginal?: Date | string
  ExposureTime?: number
  FNumber?: number
  ISO?: number | number[]
  latitude?: number
  longitude?: number
}

export async function readImageMetadata(file: Blob): Promise<ImageMetadata> {
  const bitmap = await createImageBitmap(file)
  const { width, height } = bitmap
  bitmap.close()

  const exif = await exifr.parse(file, { gps: true }) as ExifData | undefined
  const camera = exif?.Make || exif?.Model
    ? [exif.Make, exif.Model].filter(Boolean).join(' ')
    : ''
  const capturedAt = exif?.DateTimeOriginal instanceof Date
    ? exif.DateTimeOriginal.toLocaleString()
    : exif?.DateTimeOriginal ?? ''
  const exposure = exif?.ExposureTime
    ? `${exif.ExposureTime < 1 ? `1/${Math.round(1 / exif.ExposureTime)}` : exif.ExposureTime}s${exif.FNumber ? ` · f/${exif.FNumber}` : ''}`
    : ''
  const iso = Array.isArray(exif?.ISO) ? exif.ISO.join(', ') : String(exif?.ISO ?? '')
  const location = typeof exif?.latitude === 'number' && typeof exif.longitude === 'number'
    ? `${exif.latitude.toFixed(5)}, ${exif.longitude.toFixed(5)}`
    : ''

  return { width, height, camera, capturedAt, exposure, iso, location }
}
