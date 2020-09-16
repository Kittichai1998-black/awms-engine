import React, { useState, useEffect, useRef, useMemo } from "react";
import AmAuditChecker from '../../../pageComponent/AmAuditChecker'
import { AuditStatus1_2 } from '../../../../components/Models/StorageObjectEvenstatus';
const AuditChecker = (props) => {
    const { classes } = props;
 
    const columnsEdit = [
        { "type": "info"},
        {
            "field": "new_auditStatus", "type": "radiogroup", "name": "new_auditStatus", "formLabel": "Select Audit Status", "fieldLabel": AuditStatus1_2,
            // "defaultValue": { value: '1' }
        },
        { "field": "auditQty", "type": "number", "name": "Quantity", "clearInput": true, "required": true, "showUnit": true },
        { "field": "remark", "type": "input", "name": "Remark", "clearInput": true },
        // { "field": "unitCode", "type": "label", "name": "Unit", },
    ]
    return (
        <AmAuditChecker columnsEdit={columnsEdit} />
    );
}
export default AuditChecker;