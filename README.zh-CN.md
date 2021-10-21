# mapbox-gl-static-image-source

[English](README.md) | 中文

通过 ol/reproj 加载任意投影的静态图片。

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
