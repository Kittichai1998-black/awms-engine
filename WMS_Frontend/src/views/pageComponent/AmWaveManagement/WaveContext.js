import React, { useContext, useReducer } from 'react'

export const WaveContext = React.createContext({})

export const WaveProvider = ({ children }) => {
    const wave = WaveAction();
    const tabModes = TabAction();
    return <WaveContext.Provider value={{ wave, tabModes}}>
        {children}
    </WaveContext.Provider>
}


const initialState = {
    "waveID": 0,
    "waveRunMode": 0,
    "TabMode": 1,
    "areaID": 0,
    "areaLoc":0

}

const waveReducer = (state, action) => {
    switch (action.type) {
        case "ADD": {
            return {
                ...state,
                "waveID": action.value,

            }
        }
        case "ADDMODE": {
            return {
                ...state,
                "waveRunMode": action.value,
            }
        }
        case "AREA": {
            return {
                ...state,
                "areaID": action.value,
            }
        }
        case "AREALOC": {
            return {
                ...state,
                "areaLoc": action.value,
            }
        }
        default: {
            return {
                ...state
            }
        }
    }
}


const TabReducer = (state, action) => {
    switch (action.type) {
        case "ADD": {
            return {
                ...state,
                "TabMode": action.value,
            }
        }
        default: {
            return {
                ...state
            }
        }
    }
}
const WaveAction = () => {
    const [state, dispatch] = useReducer(waveReducer, initialState);
    const setWaveID = (value) => dispatch({ type: "ADD", value })
    const setwaveRunMode = (value) => dispatch({ type: "ADDMODE", value })
    const setareID = (value) => dispatch({ type: "AREA", value })
    const setareaLoc = (value) => dispatch({ type: "AREALOC", value })
    const waveID = state.waveID;
    const waveRunMode = state.waveRunMode
    const areaID = state.areaID
    const areaLoc = state.areaLoc
    return { waveID, setWaveID, waveRunMode, setwaveRunMode, areaID, setareID, areaLoc,setareaLoc }
}

const TabAction = () => {
    const [state, dispatch] = useReducer(TabReducer, initialState);
    const setTabMode= (value) => dispatch({ type: "ADD", value })  
    const TabMode = state.TabMode;
    return { TabMode, setTabMode }
}