import React, {createContext, useReducer} from 'react';

export const ProcessQueueContext = React.createContext({})

const initialState = {
    "documents":[],
    "warehouse":null,
    "uniqueKey":"ID"
}

const documentsReducer = (state, action) => {
    switch (action.type) {
        case "ADDDOC": {
            let docData = [...state.documents];
            let distinctDocData = docData.filter(doc => {
                return doc.ID !== action.payload.ID
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

const uniqueKeyReducer = (state, action) => {
    switch (action.type) {
        case "SETUNIQUE": {
            return {
                ...state,                
                "uniqueKey" : action.payload
              }
        }
        case "CLEARUNIQUE" : {
            return {
                ...state,                
                "uniqueKey" : null
              }
        }
        default : {}
      }
}

export const ProcessQueueProvider = ({children}) => {
    const documents = DocumentsAction();
    const warehouse = WarehouseAction();
    const uniqueKey = UniqueAction();
    return <ProcessQueueContext.Provider value={{documents, warehouse, uniqueKey}}>
        {children}
    </ProcessQueueContext.Provider>
}

const DocumentsAction = () => {
    const [documentsData, documentsDispatch] = useReducer(documentsReducer, initialState)
    const addDocument = (payload) => documentsDispatch({"type":"ADDDOC", payload})
    const clearDocument = (payload) => documentsDispatch({"type":"CLEARDOC", payload})
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

const UniqueAction = () => {
    const [uniqueKey, uniqueKeyDispatch] = useReducer(uniqueKeyReducer, initialState)
    const setUnique = (payload) => uniqueKeyDispatch({"type":"SETUNIQUE", payload})
    const clearUnique = (payload) => uniqueKeyDispatch({"type":"CLEARUNIQUE", payload})
    const uniqueValue = uniqueKey.uniqueKey;

    return {uniqueValue, setUnique, clearUnique}
}