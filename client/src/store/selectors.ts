import LayerVisibility from '../models/LayerVisibility';
import { State } from './reducer';
import { createSelector } from 'reselect';

export const getMapLayers = ({ mapLayers }: State) => mapLayers;

/** Aggregates all controlLayerIds with corresponding visibility(checked) from parent map layer */
export const getMapLayerVisibilities = createSelector(
  getMapLayers,
  mapLayers =>
    mapLayers.reduce<LayerVisibility[]>(
      (acc, mapLayer) => [
        ...acc,
        ...mapLayer.controlledLayerIds.map(l => ({
          layerId: l,
          visible: mapLayer.isChecked
        }))
      ],
      []
    )
);

export const getMapLocation = ({ mapLocation }: State) => mapLocation;

export const getMapPopupLayers = ({ mapPopupLayers }: State) => mapPopupLayers;
