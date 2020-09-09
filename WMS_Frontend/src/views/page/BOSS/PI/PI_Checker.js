import React, { useState, useEffect, useRef, useMemo } from "react";
import AmAuditChecker from '../../../pageComponent/AmAuditChecker'
import { AuditStatus1_2 } from '../../../../components/Models/StorageObjectEvenstatus';
const AuditChecker = (props) => {
    const { classes } = props;
 
    const columnsEdit = [
        {
            "field": "new_auditStatus", "type": "radiogroup", "name": "new_auditStatus", "formLabel": "Select Audit Status", "fieldLabel": AuditStatus1_2,
            // "defaultValue": { value: '1' }
        },
        { "field": "auditQty", "type": "number", "name": "Audit Qty", "clearInput": true, "required": true, "showUnit": true },
        // { "field": "unitCode", "type": "label", "name": "Unit", },
    ]
    return (
        <AmAuditChecker columnsEdit={columnsEdit} />
    );
}
export default AuditChecker;