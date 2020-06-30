import React, { useContext, useReducer } from 'react'

export const PutandPickContext = React.createContext({})

export const PutandPickProvider = ({ children }) => {
    const doc = DocAction();
    const dia = DialogsAction();
    return <PutandPickContext.Provider value={{ doc, dia }}>
        {children}
    </PutandPickContext.Provider>
}

const initialState = {
    "docID": 0,
    "datadocItem": [],
    "dataSet": [],
    "dialogItem": false,
    "dataSourceItemTB": [],
    "dailogErr": false,
    "dailogSuc": false,
    "dailogMsg": "",
    "editdata": [],
    "dataCreate": {},
    "datasetTB" :[],

}

const DocReducer = (state, action) => {
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
        } case "EDITITEM": {
            return {
                ...state,
                "editdata": action.value,

            }
        } case "OPEN": {
            return {
                ...state,
                "dialogItem": action.value,

            }
        } case "ADDDATATB": {
            return {
                ...state,
                "dataSourceItemTB": action.value,

            }
        } case "DATASET": {
            return {
                ...state,
                "dataSet": action.value,

            }
        } case "CREATE": {
            return {
                ...state,
                "dataCreate": action.value,

            }
        } case "DATASETTB": {
            return {
                ...state,
                "datasetTB": action.value,

            }
        }
        default: {
            return {
                ...state
            }
        }
    }
}

const DialogsReducer = (state, action) => {
    switch (action.type) {
        case "SUCESS": {
            return {
                ...state,
                "dailogSuc": action.value,

            }
        } case "ERROR": {
            return {
                ...state,
                "dailogErr": action.value,

            }
        }
        case "MSG": {
            return {
                ...state,
                "dailogMsg": action.value,

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
    const setdataSourceItemTB = (value) => dispatch({ type: "ADDDATATB", value })
    const dataSourceItemTB = state.dataSourceItemTB;
    const seteditdata = (value) => dispatch({ type: "EDITITEM", value })
    const editdata = state.editdata;
    const setdataSet = (value) => dispatch({ type: "DATASET", value })
    const dataSet = state.dataSet;
    const setdataCreate = (value) => dispatch({ type: "CREATE", value })
    const dataCreate = state.dataCreate;
    const setdatasetTB = (value) => dispatch({ type: "DATASETTB", value })
    const datasetTB = state.datasetTB;
    return { docID, setdocID, datadocItem, setdatadocItem, dialogItem, setdialogItem, setdataSourceItemTB, dataSourceItemTB, seteditdata, editdata, setdataSet, dataSet, setdataCreate, dataCreate, setdatasetTB,datasetTB}
}

const DialogsAction = () => {
    const [state, dispatch] = useReducer(DialogsReducer, initialState);
    const setdailogSuc = (value) => dispatch({ type: "SUCESS", value })
    const dailogSuc = state.dailogSuc;
    const setdailogErr = (value) => dispatch({ type: "ERROR", value })
    const dailogErr = state.dailogErr;
    const setdailogMsg = (value) => dispatch({ type: "MSG", value })
    const dailogMsg = state.dailogMsg;
    return { setdailogSuc, dailogSuc, setdailogErr, dailogErr, setdailogMsg, dailogMsg }

}

