import React from 'react';
import { initialState } from "../reducers/menuReducer";

const HeaderContext = React.createContext(initialState.headerToggle)
const LocationContext = React.createContext(initialState.linkLocation)

export { HeaderContext, LocationContext}
