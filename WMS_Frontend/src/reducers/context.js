import React, {useReducer} from 'react';
import { headerInitialState, sidebarInitialState, notifyList, sidebar } from "./menuReducer";

export const LayoutContext = React.createContext({})

const NotifyAction = () => {
    const [state, dispatch] = useReducer(notifyList, headerInitialState);
    const setNotifyList = (payload) => dispatch({"type":"setNotifyList", payload})
    const setNotifyAddList = (payload) => dispatch({"type":"setNotifyList", payload})
    const setNotifyState = (payload) => dispatch({"type":"setNotifyState", payload})
    const setNotifyCount = (payload) => dispatch({"type":"setNotifyCount", payload})
    const setNotifyReaded = (payload) => dispatch({"type":"setNotifyReaded", payload})
    return {notifyList:state.notifyList, 
        notifyState:state.notifyState,
        notifyCount:state.notifyCount,
        setNotifyList,
        setNotifyAddList,
        setNotifyState, 
        setNotifyCount, 
        setNotifyReaded
    }
}

const SidebarAction = () => {
    const [state, dispatch] = useReducer(sidebar, sidebarInitialState);
    const setMenuToggle = (payload) => dispatch({"type":"expand", payload})
    const setSidebarToggle = (payload) => dispatch({"type":"open", payload})
    const setMobileSidebarToggle = (payload) => dispatch({"type":"moblieOpen", payload})
    return {menuToggle:state.menuToggle, sidebarToggle:state.sidebarToggle, mobileSidebarToggle:state.mobileSidebarToggle, setMenuToggle, setSidebarToggle, setMobileSidebarToggle}
}

export const LayoutProvider = ({children}) => {
    const notify = NotifyAction();
    const sidebar = SidebarAction();
    return <LayoutContext.Provider value={{notify, sidebar}}>
        {children}
    </LayoutContext.Provider>
}
