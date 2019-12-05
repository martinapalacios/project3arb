import LayerDefinition from '../models/LayerDefinition';
import LayerToggles from '../components/LayerToggles';
import React from 'react';
import { State } from '../store/reducer';
import { connect } from 'react-redux';
import { getMapLayers } from '../store/selectors';
import store from '../store';
import { toggleMapLayer } from '../store/actions';

interface Props {
  mapLayers: LayerDefinition[];
}

const Layers: React.FC<Props> = ({ mapLayers }) => {
  return (
    <LayerToggles
      layerDefs={mapLayers}
      onToggle={key => store.dispatch(toggleMapLayer(key))}
    />
  );
};

export const mapState = (state: State): Props => {
  return { mapLayers: getMapLayers(state) };
};

export default connect(mapState)(Layers);
