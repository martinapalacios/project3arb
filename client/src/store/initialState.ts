import { State } from './reducer';

const initialState: State = {
  mapLayers: [
    {
      key: 'firstwardboundary',
      title: 'First Ward Boundary',
      isChecked: true,
      controlledLayerIds: []
    },
    {
      key: 'damagehomes',
      title: 'Damage Homes',
      isChecked: false,
      controlledLayerIds: ['Address', 'Photo Link']
    },
    {
      key: 'warehousehazardlocations',
      title: 'Warehouse/Hazard Locations',
      isChecked: false,
      controlledLayerIds: ['Name', 'Type']
    },
    {
      key: 'apartmentlocations',
      title: 'Apartment Locations',
      isChecked: false,
      controlledLayerIds: ['Name', 'Units']
    },
    {
      key: 'firstwardparcels',
      title: 'Parcels',
      isChecked: false,
      controlledLayerIds: ['parcels', 'parcels-outline']
    }
  ],
  mapLocation: {
    center: [-95.37506, 29.7754],
    zoom: 15
  },
  mapPopupLayers: [
    'firstwardparcels',
    'damagehomes',
    'warehousehazardlocations',
    'apartmentlocations'
  ]
};

export default initialState;
