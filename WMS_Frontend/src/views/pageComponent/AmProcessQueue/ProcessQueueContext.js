import React, {createContext, useReducer, useMemo} from 'react';

export const ProcessQueueContext = React.createContext({})

const initialState = {
    "documents":[],    
    "uniqueKey":"ID",
    "documentDetail":{},
    "dialogState":{},
    "documentList":[],
    "rowEdit":{},
    "warehouse":{}
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
        case "REMOVEDOC" : {
            let docData = [...state.documents];
            let distinctDocData = docData.filter(doc => {
                return doc.ID !== action.payload
            });
            return {
                ...state,                
                "documents" : distinctDocData
              }
        }
        case "ADDSINGLE" : {
            return {
                ...state,
                "documents" : [action.payload],
                "documentList" : []
              }
        }
        case "CLEARDOC" : {
            return {
                ...state,
                "documents" : [],
                "documentList" : []
              }
        }
        case "ADDDOCLIST" : {
            let getDocs = [...state["documentList"]].filter(x => {
                return x.document.ID !== action.payload.document.ID
            });
            getDocs.push(action.payload);
            return {
                ...state,                
                "documentList" : getDocs
              }
        }
        case "REMOVEDOCLIST" : {
            let getDocs = [...state["documentList"]].filter(x => {
                return x.document.ID !== action.payload
            });
            return {
                ...state,                
                "documentList" : getDocs
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

const warehouseReducer = (state, action) => {
    switch (action.type) {
        case "SETWAREHOUSE": {
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

const docDetailReducer = (state, action) => {
    switch (action.type) {
        case "SETDOCDETAIL": {
            return {
                ...state,                
                "documentDetail" : action.payload
              }
        }
        default : {}
      }
}

export const ProcessQueueProvider = ({children}) => {
    const documents = DocumentsAction();
    const uniqueKey = UniqueAction();
    const documentDetail = DocDetailAction();
    const warehouse = WarehouseAction();
    return <ProcessQueueContext.Provider value={{documents, uniqueKey, documentDetail, warehouse}}>
        {children}
    </ProcessQueueContext.Provider>
}

const DocDetailAction = () => {
    const [documentDetail, documentDetailDispatch] = useReducer(docDetailReducer, initialState)
    const setDocumentDetail = (payload) => documentDetailDispatch({"type":"SETDOCDETAIL", payload})
    const documentDetailValue = documentDetail.documentDetail;

    return {documentDetailValue, setDocumentDetail}
}

const DocumentsAction = () => {
    const [documentsData, documentsDispatch] = useReducer(documentsReducer, initialState)
    const setDocuments = (payload) => documentsDispatch({"type":"ADDDOC", payload})
    const setDocumentList = (payload) => documentsDispatch({"type":"ADDDOCLIST", payload})
    const clearDocument = (payload) => documentsDispatch({"type":"CLEARDOC", payload})
    const removeDocument = (payload) => documentsDispatch({"type":"REMOVEDOC", payload})
    const removeDocumentList = (payload) => documentsDispatch({"type":"REMOVEDOCLIST", payload})
    const addSingleDocument = (payload) => documentsDispatch({"type":"ADDSINGLE", payload})
    const documentsValue = documentsData.documents;
    const documentListValue = documentsData.documentList;

    return {documentsValue,documentListValue, setDocuments, clearDocument, setDocumentList, removeDocument, removeDocumentList, addSingleDocument}
}

const UniqueAction = () => {
    const [uniqueKey, uniqueKeyDispatch] = useReducer(uniqueKeyReducer, initialState)
    const setUnique = (payload) => uniqueKeyDispatch({"type":"SETUNIQUE", payload})
    const clearUnique = (payload) => uniqueKeyDispatch({"type":"CLEARUNIQUE", payload})
    const uniqueValue = uniqueKey.uniqueKey;

    return {uniqueValue, setUnique, clearUnique}
}

const WarehouseAction = () => {
    const [warehouse, warehouseDispatch] = useReducer(warehouseReducer, initialState)
    const setWarehouse = (payload) => warehouseDispatch({"type":"SETWAREHOUSE", payload})
    const clearWarehouse = (payload) => warehouseDispatch({"type":"CLEARWAREHOUSE", payload})
    const warehouseValue = warehouse.warehouse;

    return {warehouseValue, setWarehouse, clearWarehouse}
}