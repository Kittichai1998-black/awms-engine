import React, { useContext, useReducer } from 'react'

export const WaveContext = React.createContext({})

export const WaveProvider = ({ children }) => {
    const wave = WaveAction();
    return <WaveContext.Provider value={{wave}}>
        {children}
    </WaveContext.Provider>
}


const initialState = {
    "waveID": 0,
    "waveRunMode":0

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

const WaveAction = () => {
    const [state, dispatch] = useReducer(waveReducer, initialState);
    const setWaveID = (value) => dispatch({ type: "ADD", value })
    const setwaveRunMode = (value) => dispatch({ type: "ADDMODE", value })
    const waveID = state.waveID;
    const waveRunMode = state.waveRunMode
    return { waveID, setWaveID, waveRunMode, setwaveRunMode }
}