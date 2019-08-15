const dropdownData = {
    select:{},
    data:{},
};

const DropDownListSelect = (state=dropdownData.select, action) => {
    switch (action.type) {
        case "select":
        state[action.field] = action.select;
            break;
        case "rmvSelect":
            delete state[action.field];
            break;
        default:
            break;
    }
    return state;
};

const DropDownListData = (state=dropdownData, action) => {
    switch (action.type) {
        case "addData":
        state[action.field] = action.data;
            break;
        case "rmvData":
            delete state[action.field];
            break;
        default:
            break;
    }
    return state;
}

export { DropDownListSelect, DropDownListData }