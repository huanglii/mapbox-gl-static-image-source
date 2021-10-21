# mapbox-gl-static-image-source

English | [中文](README.zh-CN.md)

Load a static image of any projection via ol/reproj.

```
import StaticImageSource from 'mapbox-gl-static-image-source'

map.on('load', () => {
  const imageStaticSource = new StaticImageSource({
    crossOrigin: 'anonymous',
    url: '/4326.png',
    projection: 'EPSG:4326',
    imageExtent: [105.289838, 28.164713, 110.195632, 32.204171]
  })
  imageStaticSource.addEventListener('load', (e) => {
    map.addSource('canvas-source', e.target)
    map.addLayer(
      {
        id: 'canvas-layer',
        type: 'raster',
        source: 'canvas-source',
      },
      'waterway'
    )
  })
})
```
