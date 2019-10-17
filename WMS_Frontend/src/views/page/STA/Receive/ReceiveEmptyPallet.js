import React, { useState, useEffect } from "react";
import { apicall, createQueryString, Clone } from '../../../../components/function/CoreFunction';
import { ExplodeRangeNum, MergeRangeNum } from '../../../../components/function/RangeNumUtill';
import AmMappingPallet from '../../../pageComponent/AmMappingPallet';
import AmDialogs from '../../../../components/AmDialogs'
import * as SC from '../../../../constant/StringConst'

// const Axios = new apicall()


const ReceiveEmptyPallet = (props) => {
    const { } = props;

    const inputWarehouse = { "visible": true, "field": "warehouseID", "typeDropdown": "normal", "name": "Warehouse", "placeholder": "Select Warehouse", "fieldLabel": ["Code", "Name"], "fieldDataKey": "ID", "defaultValue": 1, "customQ": "{ 'f': 'ID', 'c':'=', 'v': 1}" };
    const inputArea = { "visible": true, "field": "areaID", "typeDropdown": "normal", "name": "Area", "placeholder": "Select Area", "fieldLabel": ["Code", "Name"], "fieldDataKey": "ID", "defaultValue": 13, "customQ": "{ 'f': 'ID', 'c':'=', 'v': 13}" };

    // const inputHeader = [
    //     { "field": "warehouseID", "type": "dropdown", "typeDropdown": "normal", "name": "Warehouse", "dataDropDown": WarehouseQuery, "placeholder": "Select Warehouse", "fieldLabel": ["Code", "Name"], "fieldDataKey": "ID", "defaultValue": 1 },
    //     { "field": "areaID", "type": "dropdown", "typeDropdown": "normal", "name": "Area", "dataDropDown": AreaMasterQuery, "placeholder": "Select Area", "fieldLabel": ["Code", "Name"], "fieldDataKey": "ID", "defaultValue": 13 },
    //     // { "field": "MovementType_ID", "type": "dropdown", "typeDropdown": "search", "name": "Movement Type", "dataDropDown": MVTQuery, "placeholder": "Movement Type", "fieldLabel": ["Code"], "fieldDataKey": "ID" },
    //     // { "field": "ActionDateTime", "type": "datepicker", "name": "Action Date/Time", "placeholder": "ActionDateTime" },
    // ]
    const inputItem = [
        // { "field": "amount", "type": "number", "name": "Quantity", "placeholder": "Quantity", "defaultValue": 1 },
        { "field": "scanCode", "type": "input", "name": "Scan Code", "placeholder": "Scan Code", "isFocus": true, "required": true, "clearInput": true },
        { "field": SC.OPT_REMARK, "type": "input", "name": "Remark", "placeholder": "Remark" },
        {    //  "visible": false, 
            "field": SC.OPT_DONE_DES_EVENT_STATUS, "type": "radiogroup", "name": "Status", "fieldLabel": [
                { value: '12', label: "RECEIVED" },
            ],
            "defaultValue": { value: '12', disabled: true }
        }
    ]


    return (
        <div>
            <AmMappingPallet
                showWarehouseDDL={inputWarehouse}
                showAreaDDL={inputArea}
                // headerCreate={inputHeader} //input header
                itemCreate={inputItem} //input scan pallet
                modeEmptyPallet={true} //mode รับเข้าพาเลทเปล่า
                setVisibleTabMenu={['Select', 'Add', 'Remove']}
                autoPost={true}
            />
        </div>
    );

}
export default ReceiveEmptyPallet;