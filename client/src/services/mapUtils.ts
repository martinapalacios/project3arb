import LayerVisibility from '../models/LayerVisibility';
import mapboxgl from 'mapbox-gl';

/**
 * Update layers in `map` to match `layerVisibility`.
 * Layer will be skipped if it does not exist in the map.
 */
export const syncLayerVisibilities = (
  map: mapboxgl.Map,
  layerVisibilities: LayerVisibility[]
) => {
  layerVisibilities.forEach(v => {
    if (!map.getLayer(v.layerId)) {
      return;
    }
    map.setLayoutProperty(
      v.layerId,
      'visibility',
      v.visible ? 'visible' : 'none'
    );
  });
};
