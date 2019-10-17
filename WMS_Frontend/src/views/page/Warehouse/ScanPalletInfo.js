import React, { useState, useEffect } from "react";
import { apicall, createQueryString, Clone } from '../../../components/function/CoreFunction';
import { ExplodeRangeNum, MergeRangeNum } from '../../../components/function/Convert';
import AmMappingPallet from '../../pageComponent/AmMappingPallet';
import AmDialogs from '../../../components/AmDialogs'

// const Axios = new apicall()


const ScanPalletInfo = (props) => {
    const { } = props;
    const inputWarehouse = { "visible": true, "field": "warehouseID", "typeDropdown": "normal", "name": "WareHouse", "placeholder": "Select WareHouse", "fieldLabel": ["Code", "Name"], "fieldDataKey": "ID", "defaultValue": 1 };
    const inputArea = { "visible": true, "field": "areaID", "typeDropdown": "normal", "name": "Area", "placeholder": "Select Area", "fieldLabel": ["Code", "Name"], "fieldDataKey": "ID" };

    // const inputHeader = [
    //     { "field": "warehouseID", "type": "dropdown", "typeDropdown": "normal", "name": "Warehouse", "dataDropDown": WarehouseQuery, "placeholder": "Select Warehouse", "fieldLabel": ["Code", "Name"], "fieldDataKey": "ID", "defaultValue": 1 },
    //     { "field": "areaID", "type": "dropdown", "typeDropdown": "normal", "name": "Area", "dataDropDown": AreaMasterQuery, "placeholder": "Select Area", "fieldLabel": ["Code", "Name"], "fieldDataKey": "ID" },
    //     // { "field": "MovementType_ID", "type": "dropdown", "typeDropdown": "search", "name": "Movement Type", "dataDropDown": MVTQuery, "placeholder": "Movement Type", "fieldLabel": ["Code"], "fieldDataKey": "ID" },
    //     // { "field": "ActionDateTime", "type": "datepicker", "name": "Action Date/Time", "placeholder": "ActionDateTime" },
    // ]
    const inputItem = [
        // { "field": "Quantity", "type": "number", "name": "Quantity", "placeholder": "Quantity" },
        { "field": "scanCode", "type": "input", "name": "Scan Code", "placeholder": "Scan Code", "isFocus": true, "required": true,"clearInput": true  },
    ]

    return (
        <div>
            <AmMappingPallet
                showWarehouseDDL={inputWarehouse}
                // showAreaDDL={inputArea}
                //headerCreate={inputHeader} //input header
                itemCreate={inputItem} //input scan pallet
                setVisibleTabMenu={['Select', null, null]}
                defaultActionValue={0}
                showArea={true}
                autoPost={true}
                modeSelectOnly={true}
            />
        </div>
    );

}
export default ScanPalletInfo;