import React, { useState, useEffect, useRef, useMemo } from "react";
import AmCoutingChecker from '../../../pageComponent/AmCoutingChecker'
const AuditChecker = (props) => {
    const { classes } = props;
 
    const columnsEdit = [
        { "type": "info"},
        { "field": "coutingQty", "type": "number", "name": "Qty", "clearInput": true, "required": true, "showUnit": true },
        { "field": "remark", "type": "input", "name": "Remark", "clearInput": true },
    ]
    return (
        <AmCoutingChecker columnsEdit={columnsEdit} />
    );
}
export default AuditChecker;