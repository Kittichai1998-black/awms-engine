import React, { useContext, useReducer } from 'react'

export const PutandPickContext = React.createContext({})

export const PutandPickProvider = ({ children }) => {
    const doc = DocAction();
    return <PutandPickContext.Provider value={{doc}}>
        {children}
    </PutandPickContext.Provider>
}

const initialState = {
    "docID": 0,
    "datadocItem": [],
    "dialogItem":false,
}

const DocReducer  = (state, action) => {
    switch (action.type) {
        case "ADD": {
            return {
                ...state,
                "docID": action.value,

            }
        } case "ADDITEM": {
            return {
                ...state,
                "datadocItem": action.value,

            }
        } case "OPEN": {
            return {
                ...state,
                "dialogItem": action.value,

            }
        }    
        default: {
            return {
                ...state
            }
        }
    }
}


const DocAction = () => {
    const [state, dispatch] = useReducer(DocReducer, initialState);
    const setdocID = (value) => dispatch({ type: "ADD", value }) 
    const docID = state.docID;
    const setdatadocItem = (value) => dispatch({ type: "ADDITEM", value })
    const datadocItem = state.datadocItem;
    const setdialogItem = (value) => dispatch({ type: "OPEN", value })
    const dialogItem = state.dialogItem;
    return { docID, setdocID, datadocItem, setdatadocItem, dialogItem, setdialogItem}
}

