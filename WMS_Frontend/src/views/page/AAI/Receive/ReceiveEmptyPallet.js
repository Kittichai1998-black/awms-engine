import React, { useState, useEffect } from "react";
import { apicall, createQueryString, Clone } from '../../../../components/function/CoreFunction';
import { ExplodeRangeNum, MergeRangeNum } from '../../../../components/function/RangeNumUtill';
import AmMappingPallet from '../../../pageComponent/AmMappingPallet';
import AmDialogs from '../../../../components/AmDialogs'

// const Axios = new apicall()


const ReceiveEmptyPallet = (props) => {
    const { } = props;

    const inputWarehouse = { "visible": true, "field": "warehouseID", "typeDropdown": "normal", "name": "Warehouse", "placeholder": "Select Warehouse", "fieldLabel": ["Code", "Name"], "fieldDataKey": "ID", "defaultValue": 1 };
    const inputArea = { "visible": true, "field": "areaID", "typeDropdown": "normal", "name": "Area", "placeholder": "Select Area", "fieldLabel": ["Code", "Name"], "fieldDataKey": "ID", "defaultValue": 13 };

    const inputItem = [
        // { "field": "amount", "type": "number", "name": "Quantity", "placeholder": "Quantity", "defaultValue": 1 },
        { "field": "scanCode", "type": "input", "name": "Scan Code", "placeholder": "Scan Code", "isFocus": true, "required": true },
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