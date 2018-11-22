import { combineReducers } from 'redux'
import mainReducer from './main'

const appReducer = combineReducers({
	mainReducer,
	//some reducers here....
})

export default appReducer