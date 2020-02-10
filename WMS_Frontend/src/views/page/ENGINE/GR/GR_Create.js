import React from "react";

import AmCreateDocument from "../../../../components/AmCreateDocumentNew";

export default props => {
    //call backend
    const view_Customer = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "Customer",
        q: "", //เงื่อนไข '[{ "f": "Status", "c":"<", "v": 2}]'
        f: "ID,Code,Name",
        g: "",
        s: "[{'f':'ID','od':'ASC'}]",
        sk: 0,
        l: 100,
        all: ""
    };
    const view_sto = {
        queryString: window.apipath + "/v2/SelectDataViwAPI/",
        t: "PalletSto",
        q: '[{ "f": "EventStatus", "c":"=", "v": "12"}]', //เงื่อนไข '[{ "f": "Status", "c":"<", "v": 2}]'
        f: "ID,PalletCode as palletcode,Code,Batch,Name,Quantity,SaleQuantity,UnitCode,BaseUnitCode,LocationCode,LocationName,SKUItems,srmLine,OrderNo as orderNo",
        g: "",
        s: "[{'f':'ID','od':'ASC'}]",
        sk: 0,
        l: 100,
        all: ""
    };
    const SKUMaster = {
        queryString: window.apipath + "/v2/SelectDataViwAPI/",
        t: "SKUMaster",
        q: '[{ "f": "Status", "c":"<", "v": 2}]',
        f: "ID,Code,Name,UnitTypeCode, ID as SKUID,concat(Code, ' : ' ,Name) as SKUItems, ID as SKUIDs,Code as skuCode",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: ""
    };

    const headerCreate = [
        [
            { label: "Document No.", type: "labeltext", key: "", texts: "-", CodeTranslate: "Document No." },
            { label: "Document Date", type: "date", key: "documentDate", CodeTranslate: "Document Date" }
        ],
        [
            { label: "Movement Type", type: "labeltext", key: "movementTypeID", texts: "FG_TRANSFER_CUS", valueTexts: "1012", CodeTranslate: "Movement Type" },
            { label: "Action Time", type: "dateTime", key: "actionTime", CodeTranslate: "Action Time" }
        ],
        [
            { label: "Source Warehouse", type: "labeltext", key: "souWarehouseID", texts: "", valueTexts: 1, CodeTranslate: "Source Warehouse" },
            { label: "Destination Customer", type: "dropdown", key: "desCustomerID", queryApi: view_Customer, fieldLabel: ["Code", "Name"], defaultValue: 1, CodeTranslate: "Destination Customer" }
        ],
        [
            { label: "Doc Status", type: "labeltext", key: "", texts: "NEW", CodeTranslate: "Doc Status" },
            { label: "Remark", type: "input", key: "remark", CodeTranslate: "Remark" }
        ]
    ];

    const columsFindPopup = [
        { Header: "SI (Order No)", accessor: "orderNo", width: 100, style: { textAlign: "center" } },
        { Header: "Pallet Code", accessor: "palletcode", width: 110, style: { textAlign: "center" } },
        { Header: "SRM Line", accessor: "srmLine", width: 95, style: { textAlign: "center" } },
        { Header: "Reorder (Item Code)", accessor: "SKUItems", width: 350 },
        // { Header: "SKU Code", accessor: 'Code', width: 110 },
        // { Header: "SKU Name", accessor: 'Name', width: 170 },
        { Header: "Location", accessor: "LocationCode", width: 90, style: { textAlign: "center" } },
        // { Header: 'Batch', accessor: 'Batch' },
        { Header: "Base Qty", accessor: "Quantity", width: 90 },
        { Header: "Base Unit", accessor: "BaseUnitCode", width: 90 },
        { Header: "Qty", accessor: "SaleQuantity", width: 90 },
        { Header: "Unit", accessor: "UnitCode", width: 70 }
    ];

    const addList = {
        queryApi: view_sto,
        columns: columsFindPopup,
        search: [
            { accessor: "palletcode", placeholder: "Pallet Code" },
            { accessor: "Code", placeholder: "Reorder (Item Code)" },
            { accessor: "LocationCode", placeholder: "Location" }
            // { accessor: "remark", placeholder: "Remark" }
        ]
    };

    const columsFindPopupSKU = [
        { Header: "Code", accessor: "Code", fixed: "left", width: 100, sortable: true },
        { Header: "Name", accessor: "Name", width: 250, sortable: true },
        { Header: "Unit", accessor: "UnitTypeCode", width: 100 }
    ];

    const columnEdit = [
        { Header: "SI", accessor: "SI (Order No)", type: "input" },
        { Header: "Pallet Code", accessor: "palletcode", type: "findPopUp", idddl: "palletcode", queryApi: view_sto, fieldLabel: ["palletcode"], columsddl: columsFindPopup },
        { Header: "Reorder (Item Code)", accessor: "SKUItems", type: "findPopUp", pair: "skuCode", idddl: "skuitems", queryApi: SKUMaster, fieldLabel: ["SKUItems"], columsddl: columsFindPopupSKU },
        { Header: "Base Qty", accessor: "quantity", type: "inputNum" },
        { Header: "Base Unit", accessor: "unitType", type: "text" },
        // { Header: "Base Qty", accessor: "Quantity", type: "text" },
        // { Header: "Base Unit", accessor: "BaseUnitCode", type: "text" },
        { Header: "Qty", accessor: "SaleQuantity", type: "text" },
        { Header: "Unit", accessor: "UnitCode", type: "text" }
    ];

    const columns = [
        { id: "row", Cell: row => row.index + 1, width: 35 },
        { Header: "SI (Order No)", accessor: "orderNo", width: 100 },
        { Header: "Pallet Code", accessor: "palletcode", width: 110 },
        { Header: "Reorder (Item Code)", accessor: "SKUItems" },
        { Header: "Base Qty", accessor: "quantity", width: 90 },
        { Header: "Base Unit", accessor: "unitType", width: 70 },
        // { Header: "Base Qty", accessor: "Quantity", width: 90 },
        // { Header: "Base Unit", accessor: "BaseUnitCode", width: 90 },
        { Header: "Qty", accessor: "SaleQuantity", width: 110 },
        { Header: "Unit", accessor: "UnitCode", width: 90 }
    ];

    const apicreate = "/v2/CreateGRDocAPI/"; //API สร้าง Doc
    const apiRes = "/receive/detail?docID="; //path หน้ารายละเอียด ตอนนี้ยังไม่เปิด

    return (
        <AmCreateDocument
            addList={addList}
            headerCreate={headerCreate}
            columns={columns}
            columnEdit={columnEdit}
            apicreate={apicreate}
            createDocType={"receive"}
            history={props.history}
            apiRes={apiRes}
        />
    )
};
