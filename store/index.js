import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import appReducer from '../reducers/index'

export default function configureStore(){
	const store =  createStore(
		appReducer,
		compose(
			applyMiddleware(thunk),
		)
	);
	if (module.hot){
		module.hot.accept('../reducers', () => {
			const nextRootReducer = require('../reducers/index');
			store.replaceReducer(nextRootReducer);
		});
	}
	return store;
}