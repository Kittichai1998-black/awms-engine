import React, { useState, useEffect } from "react";
import AmManualCreateDoc from '../../../pageComponent/AmManualCreateDoc/AmManualCreateDoc'
const CreateGRByQR = (props) => {
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
    const view_SKUMaster = {
        queryString: window.apipath + "/v2/SelectDataViwAPI/",
        t: "SKUMaster",
        q: '[{ "f": "Status", "c":"<", "v": 2}]',
        f: "ID as sku_id,Name,Code as sku,UnitTypeCode as unit",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: ""
    };
    const table_Warehouse = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "Warehouse",
        q: '[{ "f": "Status", "c":"<", "v": 2}]',
        f: "ID as warehouse_id,Name,Code as warehouse",
        g: "",
        s: "[{ 'f': 'ID', 'od': 'asc' }]",
        sk: 0,
        l: 100,
        all: ""
    }
    const table_Customer = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "Customer",
        q: '[{ "f": "Status", "c":"<", "v": 2}]',
        f: "ID as customer_id,Name,Code as customer",
        g: "",
        s: "[{ 'f': 'ID', 'od': 'asc' }]",
        sk: 0,
        l: 100,
        all: ""
    }
    const columsFindPopup_Customer = [
        { Header: "Code", accessor: "customer", fixed: "left", width: 110, sortable: true },
        { Header: "Name", accessor: "Name", width: 250, sortable: true },
    ];
    const columsFindPopup_Warehouse = [
        { Header: "Code", accessor: "warehouse", fixed: "left", width: 110, sortable: true },
        { Header: "Name", accessor: "Name", width: 250, sortable: true },
    ];

    const columsFindPopup_SKU = [
        { Header: "Code", accessor: "sku", fixed: "left", width: 110, sortable: true },
        { Header: "Name", accessor: "Name", width: 250, sortable: true },
        { Header: "Unit Type", accessor: "unit", width: 100, sortable: true },
    ];
    const columnsEdit = [{ field: "code", type: "input", name: "Item", disabled: true, placeholder: "Code" },
    { field: "lot", type: "input", name: "Lot", disabled: true, placeholder: "Name" },
    { field: "qty", type: "input", name: "Qty", disabled: true, placeholder: "Name" }
    ]
    const AuditStatus = [
        { label: 'QI', value: '4' },
        { label: 'ACC', value: '5' },
        { label: 'ACD', value: '6' },
        { label: 'ACN', value: '7' },
        { label: 'ACM', value: '8' },
        { label: 'HOLD', value: '9' },
        { label: 'BLOCK', value: '10' },
        { label: 'UR', value: '11' },

    ];

    const columnEdit = [

        { Header: "Bagging Order", accessor: "doc_wms", type: "input", width: '300px', required: true },
        {
            Header: "Customer",
            accessor: "customer_id",
            type: "findPopUp",
            required: true,
            fieldLabel: ["customer", "Name"],
            idddl: "customer",
            queryApi: table_Customer,
            columsddl: columsFindPopup_Customer,
            related: ["customer"],
            removeRelated: ["customer"]
        },
        {
            Header: "SKU",
            accessor: "sku_id",
            type: "findPopUp",
            required: true,
            fieldLabel: ["sku", "Name"],
            idddl: "sku",
            queryApi: view_SKUMaster,
            columsddl: columsFindPopup_SKU,
            related: ["unit", "sku"],
            removeRelated: ["unit", "sku"]
        },
        { Header: "Unit Type", accessor: "unit", type: "text", width: '300px' },
        { Header: "Grade", accessor: "grade", type: "input", width: '300px', required: true },
        { Header: "Lot", accessor: "lot", type: "input", width: '300px', required: true },
        { Header: "Start Pallet", accessor: "start_pallet", type: "inputNum", width: '300px', required: true },
        { Header: "End Pallet", accessor: "end_pallet", type: "inputNum", width: '300px', required: true },
        {
            Header: "Warehouse",
            accessor: "warehouse_id",
            type: "findPopUp",
            required: true,
            // fieldDataKey: "warehouse",
            fieldLabel: ["warehouse", "Name"],
            idddl: "warehouse",
            queryApi: table_Warehouse,
            defaultValue: 1,
            columsddl: columsFindPopup_Warehouse,
            related: ["warehouse"],
            removeRelated: ["warehouse"]
        },
        { Header: "Qty", accessor: "qty", type: "inputNum", width: '300px', required: true },
        { Header: "Qty Per Pallet", accessor: "qty_per_pallet", type: "inputNum", width: '300px', required: true },
        { Header: "Storage Status", accessor: "status", type: "dropdownvalue", data: AuditStatus, key: "value", defaultValue: '0', width: '300px', required: true },

    ]

    const columnQR = [

        { accessor: "doc_wms" },
        { accessor: "customer" },
        { accessor: "grade" },
        { accessor: "sku" },
        { accessor: "lot" },
        { accessor: "start_pallet" },
        { accessor: "end_pallet" },
        { accessor: "warehouse" },
        { accessor: "qty" },
        { accessor: "unit" },
        { accessor: "qty_per_pallet" },
        { accessor: "status" },

    ]

    return (
        <AmManualCreateDoc
            doctype={1011}
            columnEdit={columnEdit}
            columnQR={columnQR}
            delete={true}
            deleteApi={""}
            edit={true}
            editApi={""}
            close={true}
            closeApi={""}
        />
    );

}
export default CreateGRByQR;