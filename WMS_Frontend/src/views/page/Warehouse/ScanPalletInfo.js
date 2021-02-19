import React, { useState, useEffect, useRef, useMemo } from "react";
import AmPalletInformation from '../../pageComponent/AmPalletInformation'
const ScanPalletInfo = (props) => {
    const { classes } = props;
 
    // const columnsEdit = [
    //     { "type": "info"},
    //     { "field": "coutingQty", "type": "number", "name": "Quantity", "clearInput": true, "required": true, "showUnit": true },
    //     { "field": "remark", "type": "input", "name": "Remark", "clearInput": true },
    // ]
    return (
        <AmPalletInformation />
    );
}
export default ScanPalletInfo;