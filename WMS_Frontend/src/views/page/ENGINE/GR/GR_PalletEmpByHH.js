import React, { useState, useEffect } from "react";
import AmMappingHH from '../../../pageComponent/AmMappingPalletEmp/AmMappingPalletEmp'
const GR_PalletEmpByHH = (props) => {
    const UnitTypeQuery = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "UnitType",
        q:
            '[{ "f": "Status", "c":"<", "v": 2},{ "f": "ObjectType", "c":"=", "v": 2}]',
        f: "*",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: ""
    };
    const obj = {}
    const columnsEdit = [
        {
            field: "code",
            type: "input",
            name: "Item",
            disabled: true,
            placeholder: "Code"
        },
        {
            field: "lot",
            type: "input",
            name: "Lot",
            disabled: true,
            placeholder: "Name"
        },
        {
            field: "qty",
            type: "input",
            name: "Qty",
            disabled: false,
            placeholder: "Name"
        }]
    const columnsManual = [
        {
            field: "pstoCode",
            type: "input",
            name: "Item",
            disabled: true,
            required: true,
            placeholder: "Code"
        },
        {
            field: "lot",
            type: "input",
            name: "Lot",
            disabled: true,
            placeholder: "Lot"
        },
        {
            field: "batch",
            type: "input",
            name: "Batch",
            disabled: true,
            placeholder: "Batch"
        },
        {
            field: "orderNo",
            type: "input",
            name: "Control No.",
            disabled: true,
            placeholder: "Control No."
        },
        // {
        //     field: "itemNo",
        //     type: "input",
        //     name: "ItemNo",
        //     disabled: true,
        //     placeholder: "ItemNo"
        // }, 
        // {
        //     field: "refID",
        //     type: "input",
        //     name: "RefID",
        //     disabled: true,
        //     placeholder: "RefID"
        // }, {
        //     field: "ref1",
        //     type: "input",
        //     name: "Ref1",
        //     disabled: true,
        //     placeholder: "Ref1"
        // }, {
        //     field: "ref2",
        //     type: "input",
        //     name: "Ref2",
        //     disabled: true,
        //     placeholder: "Ref2"
        // }, {
        //     field: "ref3",
        //     type: "input",
        //     name: "Ref3",
        //     disabled: true,
        //     placeholder: "Ref3"
        // }, {
        //     field: "ref4",
        //     type: "input",
        //     name: "Ref4",
        //     disabled: true,
        //     placeholder: "Ref4"
        // }, {
        //     field: "cartonNo",
        //     type: "input",
        //     name: "CartonNo",
        //     disabled: true,
        //     placeholder: "CartonNo"
        // },
        {
            field: "addQty",
            type: "input",
            name: "Qty",
            disabled: false,
            required: true,
            placeholder: "Name"
        },
        {
            field: "UnitTypeCode",
            type: "dropdown",
            typeDropDown: "search",
            name: "Unit Type",
            dataDropDown: UnitTypeQuery,
            placeholder: "Unit Type",
            required: true,
            fieldLabel: ["Code", "Name"],
            fieldDataKey: "Code"
        }, {
            field: "packUnitTypeCode",
            type: "dropdown",
            typeDropDown: "search",
            name: "PackUnitType",
            required: true,
            dataDropDown: UnitTypeQuery,
            placeholder: "PackUnit Type",
            fieldLabel: ["Code", "Name"],
            fieldDataKey: "Code"
        },
        {
            field: "expireDate",
            type: "datetime",
            name: "Expire Date",
            disabled: false,
            placeholder: "Expire Date"
        },
        {
            field: "incubationDate",
            type: "datetime",
            name: "Inc.Date",
            disabled: false,
            placeholder: "Incubation Date"
        },
        {
            field: "productDate",
            type: "datetime",
            name: "Product Date",
            disabled: false,
            placeholder: "Product Date"
        }
    ]
    return (
        <AmMappingHH columnsEdit={columnsEdit} columnsManual={columnsManual} />
    );

}
export default GR_PalletEmpByHH;