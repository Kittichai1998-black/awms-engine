import React, {createContext, useReducer} from 'react';

export const ProcessQueueContext = React.createContext({})

const initialState = {
    "documents":[],
    "warehouse":null,
}

const documentsReducer = (state, action) => {
    switch (action.type) {
        case "ADDDOC": {
            let docData = [...state.documents];
            let distinctDocData = docData.filter(doc => {
                return doc.ID !== action.payload
            });
            distinctDocData.push(action.payload);
            return {
                ...state,                
                "documents" : distinctDocData
              }
        }
        case "CLEARDOC" : {
            return {
                ...state,                
                "documents" : []
              }
        }
        default : {}
      }
}

const warehouseReducer = (state, action) => {
    switch (action.type) {
        case "ADDWAREHOUSE": {
            return {
                ...state,                
                "warehouse" : action.payload
              }
        }
        case "CLEARWAREHOUSE" : {
            return {
                ...state,                
                "warehouse" : null
              }
        }
        default : {}
      }
}

export const ProcessQueueProvider = ({children}) => {
    const documents = DocumentsAction();
    const warehouse = WarehouseAction();
    return <ProcessQueueContext.Provider value={{documents, warehouse}}>
        {children}
    </ProcessQueueContext.Provider>
}

const DocumentsAction = () => {
    const [documentsData, documentsDispatch] = useReducer(documentsReducer, initialState)
    const addDocument = (payload) => documentsDispatch({"type":"ADDDOC", payload})
    const clearDocument = (payload) => documentsDispatch({"type":"CLEARDOC", payload})
    console.log(documentsData)
    const documentsValue = documentsData.documents;

    return {documentsValue, addDocument, clearDocument}
}

const WarehouseAction = () => {
    const [warehouseData, warehouseDispatch] = useReducer(warehouseReducer, initialState)
    const setWarehouse = (payload) => warehouseDispatch({"type":"ADDWAREHOUSE", payload})
    const clearWarehouse = (payload) => warehouseDispatch({"type":"CLEARWAREHOUSE", payload})
    const warehouseValue = warehouseData.warehouse;

    return {warehouseValue, setWarehouse, clearWarehouse}
}