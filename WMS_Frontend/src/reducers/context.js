import React, {useReducer} from 'react';
import { headerInitialState, sidebarInitialState, notifyList, sidebar } from "./menuReducer";

export const LayoutContext = React.createContext({})

const NotifyAction = () => {
    const [state, dispatch] = useReducer(notifyList, headerInitialState);
    const setNotifyList = (payload) => dispatch({"type":"setNotifyList", payload})
    const setNotifyState = (payload) => dispatch({"type":"setNotifyState", payload})
    const setNotifyCount = (payload) => dispatch({"type":"setNotifyCount", payload})
    const setNotifyReaded = (payload) => dispatch({"type":"setNotifyReaded", payload})
    return {notifyList:state.notifyList, 
        notifyState:state.notifyState,
        notifyCount:state.notifyCount,
        setNotifyList, 
        setNotifyState, 
        setNotifyCount, 
        setNotifyReaded
    }
}

const SidebarAction = () => {
    const [state, dispatch] = useReducer(sidebar, sidebarInitialState);
    const setMenuToggle = (payload) => dispatch({"type":"expand", payload})
    const setSidebarToggle = (payload) => dispatch({"type":"open", payload})
    return {menuToggle:state.menuToggle, sidebarToggle:state.sidebarToggle, setMenuToggle, setSidebarToggle}
}

export const LayoutProvider = ({children}) => {
    const notify = NotifyAction();
    const sidebar = SidebarAction();
    return <LayoutContext.Provider value={{notify, sidebar}}>
        {children}
    </LayoutContext.Provider>
}
