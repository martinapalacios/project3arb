import * as actions from './actions';

import { ActionType, getType } from 'typesafe-actions';

import LayerDefinition from '../models/LayerDefinition';
import { combineReducers } from 'redux';
import initialState from './initialState';

export type Action = ActionType<typeof actions>;

export interface State {
  mapLayers: LayerDefinition[];
  mapLocation: {
    center: [number, number];
    zoom: number;
  };
  mapPopupLayers: string[];
}

export default combineReducers<State, Action>({
  mapLayers: (state = initialState.mapLayers, action) => {
    switch (action.type) {
      case getType(actions.toggleMapLayer):
        const layerKey = action.payload;
        return state.map(l => ({
          ...l,
          isChecked: l.key === layerKey ? !l.isChecked : l.isChecked
        }));

      default:
        return state;
    }
  },
  mapLocation: (state = initialState.mapLocation, action) => {
    switch (action.type) {
      case getType(actions.setMapLocation):
        return { ...state, ...action.payload };

      default:
        return state;
    }
  },
  mapPopupLayers: (state = initialState.mapPopupLayers) => state
});
