import { createMuiTheme } from '@material-ui/core';

const theme = createMuiTheme({
  palette: {
    secondary: {
      light: '#52c7b8',
      main: '#009688',
      dark: '#00675b',
      contrastText: '#fff'
    }
  },
  shape: {
    borderRadius: 2
  },
  typography: {
    fontSize: 14,
    h2: {
      fontSize: `${20 / 16}rem`
    },
    h3: {
      fontSize: `${14 / 16}rem`,
      lineHeight: 1.5
    },
    body1: {
      fontSize: `${13 / 16}rem`
    }
  }
});

export default theme;
