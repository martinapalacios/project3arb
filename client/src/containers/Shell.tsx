import Box from '@material-ui/core/Box';
import LayersContainer from './Layers';
import Map from '../containers/Map';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { Provider } from 'react-redux';
import React from 'react';
import store from '../store';
import theme from '../mui-theme';

const MapControl: React.FC<{ position: string }> = ({ children }) =>
  children as React.ReactElement;

const Shell: React.FC = () => {
  return (
    <Box height="100vh" width="100vw" display="flex" flexDirection="row">
      <Map
        controls={[
          <MapControl position="top-left">
            <MuiThemeProvider theme={theme}>
              <Provider store={store}>
                <Box px={2} py={1}>
                  <LayersContainer />
                </Box>
              </Provider>
            </MuiThemeProvider>
          </MapControl>
        ]}
      />
    </Box>
  );
};

export default Shell;
