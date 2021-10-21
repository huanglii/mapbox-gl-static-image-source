# mapbox-gl-static-image-source

English | [中文](README.zh-CN.md)

Load a static image of any projection via ol/reproj.

## install
```
npm i mapbox-gl-static-image-source
```

## use
Here is an image, and its epsg code is 4326:

![](./public/4326.png)

```
import StaticImageSource from 'mapbox-gl-static-image-source'

map.on('load', () => {
  const imageStaticSource = new StaticImageSource({
    crossOrigin: 'anonymous',
    url: '/4326.png', // image url
    projection: 'EPSG:4326', // image projection
    imageExtent: [105.289838, 28.164713, 110.195632, 32.204171] // image extent
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

The rendering result is as shown below: [Load a static image of any projection](https://huanglii.github.io/mapbox-gl-static-image-source/)
