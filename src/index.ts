import {getCenter, getHeight, getIntersection, getWidth} from 'ol/extent'
import {transformExtent, get as getProjection, Projection} from 'ol/proj'
import {calculateSourceResolution, render as renderReprojected} from 'ol/reproj'
import {ERROR_THRESHOLD} from 'ol/reproj/common'
import Triangulation from 'ol/reproj/Triangulation'
import EventTarget from 'ol/events/Target'
import EventType from 'ol/events/EventType'
import ImageState from './ImageState'

interface StaticImageOptions {
  url: string // image url.
  projection: string // image projection.
  imageExtent: [number, number, number, number] // extent of the image in map coordinates. This is the [left, bottom, right, top] map coordinates of your image.
  crossOrigin?: string
}

class StaticImageSource extends EventTarget {
  type = 'canvas'
  canvas!: HTMLCanvasElement
  coordinates!: [number[], number[], number[], number[]]
  private _resolution!: number
  private _options: StaticImageOptions
  private _image!: HTMLImageElement
  private _imageState!: ImageState
  private _imageExtent: [number, number, number, number]
  private _projection: Projection

  constructor(options: StaticImageOptions) {
    super()
    this._options = options
    this._projection = getProjection(options.projection)
    this._imageExtent = options.imageExtent
    this._imageState = ImageState.IDLE

    this._initCoordinates()
    this._loadImage()
  }

  /**
   * 计算 4326 坐标系范围
   */
  private _initCoordinates() {
    const {projection, imageExtent} = this._options
    const _4326Extent = transformExtent(imageExtent, projection, 'EPSG:4326')
    this.coordinates = [
      [_4326Extent[0], _4326Extent[3]],
      [_4326Extent[2], _4326Extent[3]],
      [_4326Extent[2], _4326Extent[1]],
      [_4326Extent[0], _4326Extent[1]],
    ]
  }

  private _loadImage() {
    const {crossOrigin, url} = this._options
    const image = new Image()
    if (crossOrigin) {
      image.crossOrigin = crossOrigin
    }
    image.src = url

    if (image.src && typeof Image !== 'undefined' && Image.prototype.decode) {
      const promise = image.decode()
      promise
        .then(() => this._handleImageLoad())
        .catch((error) => {
          console.error(error)
          this._handleImageError()
        })
    }

    this._imageState = ImageState.LOADING
    this._image = image
  }

  private _handleImageLoad() {
    if (this.getResolution() === undefined) {
      this._resolution = getHeight(this._options.imageExtent) / this._image.height
    }
    this._imageState = ImageState.LOADED
    this._handleImageChange()
  }

  private _handleImageError() {
    this._imageState = ImageState.ERROR
    // this._handleImageChange();
  }

  private _handleImageChange() {
    if (this.getImageState() == ImageState.LOADED) {
      this._reprojectImage()
    }
  }

  private _reprojectImage() {
    const sourceProjection = this.getProjection()
    const targetProjection = getProjection('EPSG:3857')

    const targetExtent = transformExtent(this._imageExtent, sourceProjection, targetProjection)
    const xResolution = getWidth(targetExtent) / this._image.width
    const yResolution = getHeight(targetExtent) / this._image.height
    const targetResolution = Math.max(xResolution, yResolution)

    this._reproject(sourceProjection, targetProjection, targetExtent, targetResolution)
  }

  private _reproject(
    sourceProjection: Projection,
    targetProjection: Projection,
    targetExtent: number[],
    targetResolution: number
  ) {
    if (this.getImageState() == ImageState.LOADED) {
      const maxSourceExtent = sourceProjection.getExtent()
      const maxTargetExtent = targetProjection.getExtent()

      const width = getWidth(targetExtent) / targetResolution
      const height = getHeight(targetExtent) / targetResolution

      const sourcePixelRatio = 1

      const limitedTargetExtent = maxTargetExtent ? getIntersection(targetExtent, maxTargetExtent) : targetExtent
      const targetCenter = getCenter(limitedTargetExtent)
      const sourceResolution = calculateSourceResolution(
        sourceProjection,
        targetProjection,
        targetCenter,
        targetResolution
      )

      const triangulation = new Triangulation(
        sourceProjection,
        targetProjection,
        limitedTargetExtent,
        maxSourceExtent,
        sourceResolution * ERROR_THRESHOLD, // ERROR_THRESHOLD = 0.5
        targetResolution
      )

      this.canvas = renderReprojected(
        width,
        height,
        sourcePixelRatio,
        this.getResolution(),
        maxSourceExtent,
        targetResolution,
        targetExtent,
        triangulation,
        [
          {
            extent: this._options.imageExtent,
            image: this._image,
          },
        ],
        0
      )
      this.dispatchEvent(EventType.LOAD)
    }
  }

  getProjection(): Projection {
    return this._projection
  }

  getImageState(): ImageState {
    return this._imageState
  }

  getResolution(): number {
    return this._resolution
  }
}

export default StaticImageSource
