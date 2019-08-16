

export const initialState={
    headerToggle:false,
    menuToggle:{"toggle":true},
    linkLocation:""
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

export const menuToggle = (state, action) => {
    switch (action.type) {
        case "expand":
            if(state.menuID){
                if(state.menuID !== action.menuID){
                    state = {"toggle":state.toggle ? state.toggle : !state.toggle, "menuID":action.menuID};
                }
                else{
                    state = {"toggle":state.menuID === action.menuID ? !state.toggle : state.toggle, "menuID":action.menuID};
                }
            }
            else{
                state = {"toggle":state.toggle, "menuID":action.menuID};
            }
            break;
        default:
            break;
    }
    return state
}