import CssBaseline from '@material-ui/core/CssBaseline';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { Provider } from 'react-redux';
import React from 'react';
import Shell from './containers/Shell';
import store from './store';
import theme from './mui-theme';

const App: React.FC = () => {
  return (
    <>
      <CssBaseline />
      <MuiThemeProvider theme={theme}>
        <Provider store={store}>
          <Shell></Shell>
        </Provider>
      </MuiThemeProvider>
    </>
  );
};

export default App;
