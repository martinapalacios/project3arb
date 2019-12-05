import { Middleware, applyMiddleware, createStore } from 'redux';

import { createLogger } from 'redux-logger';
import reducer from './reducer';
import thunk from 'redux-thunk';

const middleware: Middleware[] = [thunk];

if (process.env.NODE_ENV !== 'production') {
  middleware.push(createLogger());
}

const store = createStore(reducer, applyMiddleware(...middleware));

export default store;
