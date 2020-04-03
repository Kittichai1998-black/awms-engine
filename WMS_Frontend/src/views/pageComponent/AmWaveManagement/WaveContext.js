import React, {useContext, useReducer} from 'react'

export const WaveContext = React.createContext({})

export const WaveManagementProvider = ({children}) => {
    const wave = WaveAction();
    return <WaveContext.Provider value={wave}>
        {children}
    </WaveContext.Provider>
}


const initialState = {
    "waveID":0
}

const waveReducer = (state, action) => {
    switch (action.type) {
        case "ADD" : {
            return {
                ...state,
                "waveID": action.value
            }
        }
        default : {
            return {
                ...state
            }
        }
    }
}

const WaveAction = () => {
    const [state, dispatch] = useReducer(waveReducer, initialState, 0);
    const setWaveID = (value) => dispatch({type:"ADD", value})
    const waveID = state.waveID;
    return {waveID, setWaveID}
}