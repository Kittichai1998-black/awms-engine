import React, {createContext, useReducer} from 'react';

const initialState = {
    selection:[],
    selectionAll:false,
    selected:false,
    page:1,
    pageSize:20,
    sort:{},
    filter:[],
    filtered:false,
}

export const AmTableContext = createContext(initialState)

export const AmTableProvider = ({children}) => {
    const selection = SelectionAction();
    const pagination = PageAction();
    const sort = SortAction();
    const filter = FilterAction();
    return <AmTableContext.Provider value={{selection, pagination, sort, filter}}>
        {children}
    </AmTableContext.Provider>
}

const selectionReducer = (state, action) => {
    switch(action.type){
        case "selectall" : {
            return {
                ...state,
                "selected":true,
                "selectionAll":!state.selectionAll
            }
        }
        case "set" : {
            return {
                ...state,
                "selected":true,
                "selection":[action.payload.data]
            }
        }
        case "add" : {
            let getUniq = state.selection.filter(x=> x[action.payload.uniq] !== action.payload.data[action.payload.uniq]);
            getUniq.push(action.payload.data);
            return {
                ...state,
                "selected":true,
                "selection":getUniq
            }
        }
        case "remove" : {
            let getUniq = state.selection.filter(x=> x[action.payload.uniq] !== action.payload.data);
            return {
                ...state,
                "selected":true,
                "selection":getUniq
            }
        }
        case "addall":{
            return {
                ...state,
                "selected":true,
                "selection":action.payload
            }
        }
        case "removeall":{
            return {
                ...state,
                "selected":true,
                "selection":[]
            }
        }
        default : {}
    }
}

const paginationReducer = (state, action) => {
    switch(action.type){
        case "setpage" : {
            return {
                ...state,
                "page":action.payload
            }
        }
        case "setpagesize" : {
            return {
                ...state,
                "pageSize":action.payload
            }
        }
        default : {}
    }
}

const filterReducer = (state, action) => {
    switch(action.type){
        case "add" : {
            let findData = [...state.filter].find(x=> x.field === action.payload.field)
            if(findData === undefined){
                if(action.payload.value !== undefined && action.payload.value !== ''){
                    let filterData = [...state.filter].filter(x=> x.field !== action.payload.field);
                    if(action.payload.value !== undefined)
                        filterData.push(action.payload)
                    return {
                        ...state,
                        "filtered":true,
                        "filter":filterData
                    }
                }else{
                    return state
                }
            }
            else{
                if(findData.value !== action.payload.value){
                    let filterData = [...state.filter].filter(x=> x.field !== action.payload.field);
                    if(action.payload.value !== undefined)
                        filterData.push(action.payload)
                    return {
                        ...state,
                        "filtered":true,
                        "filter":filterData
                    }
                }
                else{
                    return state
                }
            }
        }
        case "removeall" : {
            return {
                ...state,
                "filtered":true,
                "filter":[]
            }
        }
        default : {}
    }
}

const sortReducer = (state, action) => {
    switch(action.type){
        case "setsort" : {
            return {
                ...state,
                "sort":action.payload
            }
        }
        default : {}
    }
}

const SelectionAction = () => {
    const [selectionValue, selectionDispatch] = useReducer(selectionReducer, initialState)
    const add = (payload) => selectionDispatch({"type":"add", payload})
    const remove = (payload) => selectionDispatch({"type":"remove", payload})
    const addAll = (payload) => selectionDispatch({"type":"addall", payload})
    const removeAll = (payload) => selectionDispatch({"type":"removeall", payload})
    const selectAll = (payload) => selectionDispatch({"type":"selectall", payload})
    const set = (payload) => selectionDispatch({"type":"set", payload})
    return {selectedValue:selectionValue.selected,selectionValue:selectionValue.selection,add,remove,addAll,removeAll, selectAll,set, selectAllState:selectionValue.selectionAll}
}

const PageAction = () => {
    const [pageValues, pageDispatch] = useReducer(paginationReducer, initialState)
    const setPage = (payload) => pageDispatch({"type":"setpage", payload})
    const setPageSize = (payload) => pageDispatch({"type":"setpagesize", payload})
    var pageValue = pageValues.page;
    var pageSize = pageValues.pageSize;
    return {pageValue,setPage,setPageSize,pageSize}
}

const SortAction = () => {
    const [sortValue, sortDispatch] = useReducer(sortReducer, initialState)
    const setSort = (payload) => sortDispatch({"type":"setsort", payload})
    return {sortValue: sortValue.sort,setSort}
}

const FilterAction = () => {
    const [filterValue, filterDispatch] = useReducer(filterReducer, initialState)
    const setFilter = (payload) => filterDispatch({"type":"add", payload})
    const removeFilter = (payload) => filterDispatch({"type":"removeall", payload})
    return {filteredValue:filterValue.filtered,filterValue:filterValue.filter,setFilter,removeFilter}
}