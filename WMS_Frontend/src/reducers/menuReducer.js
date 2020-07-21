export const headerInitialState={
    notifyList:[],
    notifyState:false,
    notifyCount:1,
    notifyReaded:[]
}

export const sidebarInitialState={
    menuToggle:{"toggle":false},
    sidebarToggle:true,
}


export const headerToggle = (state, action) => {
    switch (action.type) {
        case "open":
            state = !state;
            
            break;
        default:
            break;
    }
    return state
}

export const LinkToggle = (state, action) => {
    switch (action.type) {
        case "open":
            state = action.location;
            
            break;
        default:
            break;
    }
    return state
}

export const sidebar = (state, action) => {
    switch (action.type) {
        case "expand":{
            if(state.menuToggle.menuID){
                if(state.menuToggle.menuID !== action.payload.menuID){
                    return {...state, menuToggle:{"toggle":true, "menuID":action.payload.menuID}};
                }
                else{
                    return {...state, menuToggle:{"toggle":state.menuToggle.toggle ? false : true, "menuID":action.payload.menuID}};
                }
            }
            else{
                return {...state, menuToggle:{"toggle":true, "menuID":action.payload.menuID}};
            }
        }
        case "open":{
            return {...state, sidebarToggle:action.payload};
        }
        default:
            break;
    }
    return state
}

export const notifyList = (state, action) => {
    switch (action.type){
        case "setNotifyList":{
            return {...state, notifyList:action.payload}
        }
        case "setNotifyState":{
            return {...state, notifyState:action.payload}
        }
        case "setNotifyCount":{
            return {...state, notifyCount:action.payload}
        }
        case "setNotifyReaded":{
            return {...state, notifyReaded:action.payload}
        }
        default:{
            break;
        }
    }
}