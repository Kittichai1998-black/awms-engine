import React, { useState, useEffect, useRef, useMemo } from "react";
import AmAuditChecker from '../../../pageComponent/AmAuditChecker'
import { AuditStatus, AuditStatus1_2 } from '../../../../components/Models/StorageObjectEvenstatus';
const AuditChecker = (props) => {
    const { classes } = props;
    const newAuditStatus = AuditStatus.map(function (x) {
        return { ...x, value: x.value.toString() }
    });
    const columnsEdit = [
        { "type": "info" },
        // {
        //     "field": "auditStatus", "type": "radiogroup", "name": "auditStatus",
        //     "formLabel": "Select New Audit Status", "fieldLabel": newAuditStatus,
        //     // "defaultValue": { value: '1' }
        // },
        { "field": "auditQty", "type": "number", "name": "Quantity", "clearInput": true, "required": true, "showUnit": true },
        { "field": "remark", "type": "input", "name": "Remark", "clearInput": true },
        // { "field": "unitCode", "type": "label", "name": "Unit", },
    ]
    return (
        <AmAuditChecker columnsEdit={columnsEdit} />
    );
}
export default AuditChecker;