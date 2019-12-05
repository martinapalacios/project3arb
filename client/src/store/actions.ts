import { createStandardAction } from 'typesafe-actions';

/** Toggle map layer visibility by layer key */
export const toggleMapLayer = createStandardAction('app/TOGGLE_MAP_LAYER')<
  string
>();

export const setMapLocation = createStandardAction('app/SET_MAP_LOCATION')<{
  center?: [number, number];
  zoom?: number;
}>();
