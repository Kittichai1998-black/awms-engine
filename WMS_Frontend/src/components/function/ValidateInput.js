export default (prototypeObj, objCheck, accessor) => {
    return prototypeObj.filter(x => x.required && !objCheck[x[accessor]])
}
