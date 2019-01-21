import { combineReducers } from 'redux'
import mainReducer from './main'
import siteReducer from './site'

const appReducer = combineReducers({
	mainReducer,
	siteReducer
	//some reducers here....
})

export default appReducer