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
    "TabMode":1

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
                "TabMaode": action.value,

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
    const waveID = state.waveID;
    const waveRunMode = state.waveRunMode
    return { waveID, setWaveID, waveRunMode, setwaveRunMode }
}

const TabAction = () => {
    const [state, dispatch] = useReducer(TabReducer, initialState);
    const setTabMode= (value) => dispatch({ type: "ADD", value })  
    const TabMode = state.TabMode;
    return { TabMode, setTabMode }
}