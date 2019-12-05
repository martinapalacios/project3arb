import 'mapbox-gl/dist/mapbox-gl.css';

import {
  MuiThemeProvider,
  makeStyles,
  useTheme
} from '@material-ui/core/styles';
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl, { MapLayerMouseEvent, MapMouseEvent } from 'mapbox-gl';

import Box from '@material-ui/core/Box';
import LayerVisibility from '../models/LayerVisibility';
import MapPopup from './MapPopup';
import ReactDOM from 'react-dom';
import RootRef from '@material-ui/core/RootRef';
import invoke from 'lodash.invoke';
import { syncLayerVisibilities } from '../services/mapUtils';
import uniqBy from 'lodash.uniqby';

// eslint-disable-next-line
const App = () => <h1>{process.env.API_URL}</h1>;
const { REACT_APP_MAPBOX_ACCESS_TOKEN: MAPBOX_ACCESS_TOKEN } = process.env;

export interface Props {
  center: [number, number];
  mapStyle: string;
  zoom: number;

  // Optional features

  /**
   * Array of "Controls" to add to the map.
   * Controls are components that will be rendered in their own scope and added to a mapbox-gl map control container.
   * Controls can optionally specify a `position` prop that will determine their position around the map.
   * `position` defaults to 'top-right'.
   * `position` values should match https://docs.mapbox.com/mapbox-gl-js/api/#map#addcontrol.
   */
  controls?: React.ReactElement[];

  /**
   * Array of map layers to manage visibility.
   * Layers will be kept in sync with their matching IDs.
   * Layers not in the managed array will use the default visibility defined in the style.
   */
  layerVisibilities?: LayerVisibility[];

  /** Array of layer IDs to show popups with property data */
  popupLayers?: string[];
}

const Map: React.FC<Props> = ({
  center,
  zoom,
  mapStyle,
  controls = [],
  layerVisibilities = [],
  popupLayers = []
}) => {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const mapContainer = useRef(null);

  // Track if the initial map location has been set.
  // If it has not, we don't fly to when setting location.
  const initialLocationSet = useRef(false);

  useStyles();

  const theme = useTheme(); // Get theme to apply to control theme providers

  /** Initialize mapbox-gl map on component mount */
  useEffect(() => {
    if (!mapContainer.current) {
      throw new Error(
        'Ref to map container element must be assigned before rendering'
      );
    }

    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN as string;

    const m = new mapboxgl.Map({
      container: (mapContainer.current as unknown) as Element,
      customAttribution: ''
    });

    // m.addControl(new mapboxgl.FullscreenControl());
    m.addControl(new mapboxgl.NavigationControl());

    setMap(m);

    return () => {
      m.remove();
      setMap(null);
    };
  }, []);

  /** Append controls (`props.controls`) to appropriate map control containers */
  useEffect(() => {
    if (!map || !controls.length) {
      return;
    }

    const removeOnCleanup: Element[] = controls.map(control => {
      const position = control.props.position || 'top-right';

      const controlGroup = document.createElement('div');
      controlGroup.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
      (map as any)._controlPositions[position].appendChild(controlGroup);

      ReactDOM.render(control, controlGroup);

      return controlGroup;
    });

    return () =>
      removeOnCleanup.forEach(elem =>
        invoke(elem, 'parentNode.removeChild', elem)
      );
  }, [map, controls]);

  /** Update map style on `mapStyle` change */
  useEffect(() => {
    map && map.setStyle(mapStyle);
  }, [map, mapStyle]);

  /** Fly to `center` and `zoom` on change */
  useEffect(() => {
    if (!map) {
      return;
    }

    // If initial location has not been set, this is the first load of the map.
    // Jump straight to location without animation.
    // Otherwise, this is a location change to an existing, loaded map. Fly to loc with animation.
    if (!initialLocationSet.current) {
      map.jumpTo({ center, zoom });
      initialLocationSet.current = true;
    } else {
      map.flyTo({ center, zoom });
    }
  }, [map, center, zoom]);

  /** Sync visible layers on `layerVisibility` change */
  useEffect(() => {
    if (!map || !layerVisibilities.length) {
      return;
    }

    syncLayerVisibilities(map, layerVisibilities);

    // Sync on initial and other map style loads.
    // On component mount, `layerVisibilities` will try to sync prior to style load
    // and will not be applied without handling style.load event.
    map.on('style.load', ({ target }: { target: mapboxgl.Map }) =>
      syncLayerVisibilities(target, layerVisibilities)
    );
  }, [map, layerVisibilities]);

  /** Show popup with feature data when clicking any `popupLayers` */
  useEffect(() => {
    // TODO. May also want to 1. select/highlight feature (ISS-33), 2. choose feat when multiple clicked (ISS-34)

    if (!map || !popupLayers.length) {
      return;
    }

    map.on('click', showPopup);

    popupLayers.forEach(layer => {
      map.on('mouseenter', layer, updateCursor);
      map.on('mouseleave', layer, resetCursor);
    });

    return () => {
      map.off('click', showPopup);

      popupLayers.forEach(layer => {
        map.off('mouseenter', layer, updateCursor);
        map.off('mouseleave', layer, resetCursor);
      });
    };

    function showPopup({ lngLat, point, target }: MapLayerMouseEvent) {
      const features = target.queryRenderedFeatures(point, {
        layers: popupLayers
      });

      if (!features.length) {
        return;
      }

      // The same feature can be returned twice from a query if it crosses a tile edge.
      // Filter for values unique by layer and feature id.
      const featuresUniq = uniqBy(features, f => f.layer.id + f.id);

      const container = document.createElement('div');

      ReactDOM.render(
        <MuiThemeProvider theme={theme}>
          <MapPopup
            features={featuresUniq}
            maxHeight="45vh"
            overflow="hidden auto"
          ></MapPopup>
        </MuiThemeProvider>,
        container
      );

      const popup = new mapboxgl.Popup({
        maxWidth: '320px',
        closeButton: false
      })
        .setLngLat(lngLat)
        .setDOMContent(container)
        .addTo(target);

      // Unmount `MapPopup` component when popup is closed.
      // Without unmounting, the DOM element for the popup is removed by Mapbox,
      // but the popup component is still managed by the React virt DOM.
      popup.on('close', () => ReactDOM.unmountComponentAtNode(container));
    }

    function updateCursor({ target }: MapMouseEvent) {
      target.getCanvas().style.cursor = 'pointer';
    }

    function resetCursor({ target }: MapMouseEvent) {
      target.getCanvas().style.cursor = '';
    }
  }, [map, popupLayers, theme]);

  return (
    <RootRef rootRef={mapContainer}>
      <Box component="div" flex="1 1 100%" height={1} width={1} />
    </RootRef>
  );
};

export default Map;

const addImage =
  // tslint:disable-next-line: max-line-length
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwAQMAAABtzGvEAAAABlBMVEUAAAAAAAClZ7nPAAAAAXRSTlMAQObYZgAAABpJREFUeAFjoBZgPkB1yv7//z9YKVrYRyUAAGoSHy2hvqxVAAAAAElFTkSuQmCC';

const fullscreenImage =
  // tslint:disable-next-line: max-line-length
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgAQMAAADYVuV7AAAABlBMVEUAAAAzMzPI8eYgAAAAAXRSTlMAQObYZgAAACZJREFUeAFjAIFRwP//PwPD//8faM4BU/yDjjPMwGAOa3qmt1EAAJi6f4Gal950AAAAAElFTkSuQmCC';

const removeImage =
  // tslint:disable-next-line: max-line-length
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAKklEQVR4Ae3PAQkAAAzDsPs3/Ys4jAEJVECnHgAAAMCGezFgoBoAAADAAYiWb5Ec1zNuAAAAAElFTkSuQmCC';

const shrinkImage =
  // tslint:disable-next-line: max-line-length
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgAQMAAADYVuV7AAAABlBMVEUAAAAzMzPI8eYgAAAAAXRSTlMAQObYZgAAACNJREFUeAFjgIBR8B+IBieH/z+I8/8DLTnDCtAv3AZ72hkFAK3Sf4Hpvgm3AAAAAElFTkSuQmCC';

const useStyles = makeStyles(theme => ({
  '@global': {
    '.mapboxgl-map': {
      ...theme.typography.body1
    },
    '.mapboxgl-ctrl-group': {
      overflow: 'hidden',
      borderRadius: theme.shape.borderRadius,
      '& > button:focus': {
        boxShadow: 'none',
        '&:first-child': {
          borderRadius: 0
        },
        '&:last-child': {
          borderRadius: 0
        }
      },
      '&:not(:empty)': {
        boxShadow: theme.shadows['2']
      }
    },
    '.mapboxgl-ctrl': {
      '&.mapboxgl-ctrl-attrib': {
        ...theme.typography.caption,
        lineHeight: 2,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        '&, & a': {
          color: 'rgba(255, 255, 255, 0.75)'
        }
      }
    },
    'a.mapboxgl-ctrl-logo': {
      display: 'none'
    },
    '.mapboxgl-ctrl-icon': {
      backgroundPosition: 'center center',
      backgroundSize: '24px 24px',
      backgroundRepeat: 'no-repeat',
      '&.mapboxgl-ctrl-fullscreen': {
        backgroundImage: `url(${fullscreenImage})`
      },
      '&.mapboxgl-ctrl-shrink': {
        backgroundImage: `url(${shrinkImage})`
      },
      '&.mapboxgl-ctrl-zoom-in': {
        backgroundImage: `url(${addImage})`
      },
      '&.mapboxgl-ctrl-zoom-out': {
        backgroundImage: `url(${removeImage})`
      }
    },
    '.mapboxgl-popup-content': {
      padding: 0,
      boxShadow: theme.shadows['2'],
      borderRadius: theme.shape.borderRadius,
      '.mapboxgl-popup-anchor-top-left &': {
        borderTopLeftRadius: theme.shape.borderRadius
      },
      '.mapboxgl-popup-anchor-top-right &': {
        borderTopRightRadius: theme.shape.borderRadius
      },
      '.mapboxgl-popup-anchor-bottom-left &': {
        borderBottomLeftRadius: theme.shape.borderRadius
      },
      '.mapboxgl-popup-anchor-bottom-right &': {
        borderBottomRightRadius: theme.shape.borderRadius
      }
    },
    '.mapboxgl-popup-close-button': {
      display: 'block',
      height: 24,
      width: 24,
      fontSize: '18px',
      borderTopRightRadius: theme.shape.borderRadius,
      '&:focus': {
        outline: 'none'
      }
    },
    '.mapboxgl-popup-tip': {
      visibility: 'hidden'
    }
  }
}));
