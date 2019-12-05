import {
  getMapLayerVisibilities,
  getMapLocation,
  getMapPopupLayers
} from '../store/selectors';

import LayerVisibility from '../models/LayerVisibility';
import MapComponent from '../components/Map';
import React, { ReactElement } from 'react';
import { State } from '../store/reducer';
import { connect } from 'react-redux';

export interface Props {
  center: [number, number];
  zoom: number;
  layerVisibilities: LayerVisibility[];
  popupLayers: string[];
  controls?: ReactElement[];
}

const Map: React.FC<any> = ({
  center,
  zoom,
  layerVisibilities,
  popupLayers,
  controls
}) => {
  return (
    <MapComponent
      mapStyle="mapbox://styles/mpala/ck387flqf4kua1dpnei0bjmd5"
      center={center}
      zoom={zoom}
      layerVisibilities={layerVisibilities}
      popupLayers={popupLayers}
      controls={controls}
    />
  );
};

export const mapState = (state: State): Partial<Props> => {
  const { center, zoom } = getMapLocation(state);
  const layerVisibilities = getMapLayerVisibilities(state);
  const popupLayers = getMapPopupLayers(state);
  return { center, zoom, layerVisibilities, popupLayers };
};

export default connect(mapState)(Map);
