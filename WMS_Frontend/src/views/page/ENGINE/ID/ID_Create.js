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
            { label: "Document No.", type: "labeltext", key: "", texts: "-", codeTranslate: "Document No." },
            { label: "Document Date", type: "date", key: "documentDate", codeTranslate: "Document Date" }
        ],
        [
            { label: "Movement Type", type: "labeltext", key: "movementTypeID", texts: "FG_TRANSFER_CUS", valueTexts: "1012", codeTranslate: "Movement Type" },
            { label: "Action Time", type: "dateTime", key: "actionTime", codeTranslate: "Action Time" }
        ],
        [
            { label: "Source Warehouse", type: "labeltext", key: "souWarehouseID", texts: "", valueTexts: 1, codeTranslate: "Source Warehouse" },
            { label: "Destination Customer", type: "dropdown", key: "desCustomerID", queryApi: view_Customer, fieldLabel: ["Code", "Name"], defaultValue: 1, codeTranslate: "Destination Customer" }
        ],
        [
            { label: "For Customer", type: "dropdown", key: "forCustomerID", queryApi: view_Customer, fieldLabel: ["Code", "Name"], defaultValue: 1, codeTranslate: "For Customer" },
            { label: "Doc Status", type: "labeltext", key: "", texts: "NEW", codeTranslate: "Doc Status" },
        ],
        [
           
            { label: "Remark", type: "input", key: "remark", codeTranslate: "Remark" }
        ]
    ];

    const columsFindPopup = [
        { Header: "Item Code", accessor: "SKUItems", width: 350, codeTranslate: "Item Code" },
        { Header: "Pallet", accessor: "palletcode", width: 110, style: { textAlign: "center" }, codeTranslate: "Pallet" },
        { Header: "Order No.", accessor: "orderNo", width: 100, style: { textAlign: "center" }, codeTranslate: "Order No." },
        { Header: "Location", accessor: "LocationCode", width: 90, style: { textAlign: "center" }, codeTranslate: "Location" },
        { Header: "Qty", accessor: "SaleQuantity", width: 90, codeTranslate: "Qty" },
        { Header: "Unit", accessor: "UnitCode", width: 70, codeTranslate: "Unit" }
    ];

    const addList = {
        queryApi: view_sto,
        columns: columsFindPopup,
        search: [
            { accessor: "palletcode", placeholder: "Pallet" },
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
        { Header: "Item Code", accessor: "SKUItems", type: "findPopUp", pair: "skuCode", idddl: "skuitems", queryApi: SKUMaster, fieldLabel: ["SKUItems"], columsddl: columsFindPopupSKU, codeTranslate: "Item Code", required: true },
        { Header: "Pallet", accessor: "palletcode", type: "findPopUp", idddl: "palletcode", queryApi: view_sto, fieldLabel: ["palletcode"], columsddl: columsFindPopup, codeTranslate: "Pallet" },
        { Header: "Batch", accessor: "batch", type: "input", codeTranslate: "Batch" },
        { Header: "Lot", accessor: "lot", type: "input", codeTranslate: "Lot" },
        { Header: "Order No.", accessor: "orderNo", type: "input", codeTranslate: "Order No." },
        { Header: "Quantity", accessor: "quantity", type: "inputNum", codeTranslate: "Quantity"},
        { Header: "Unit", accessor: "unitType", type: "text", codeTranslate: "Unit" }
    ];

    const columns = [
        { id: "row", Cell: row => row.index + 1, width: 35 },
        { Header: "Item Code", accessor: "SKUItems" },
        { Header: "Pallet", accessor: "palletcode", width: 110 },
        { Header: "Batch", accessor: "batch", width: 100 },
        { Header: "Lot", accessor: "lot", width: 100 },
        { Header: "Order No.", accessor: "orderNo", width: 100 },
        { Header: "Qty", accessor: "quantity", width: 110 },
        { Header: "Unit", accessor: "unitType", width: 90 }
    ];

    const apicreate = "/v2/CreateIDDocAPI/"; //API สร้าง Doc
    const apiRes = "/IssueOrder/detail?docID="; //path หน้ารายละเอียด ตอนนี้ยังไม่เปิด

    return (
        <AmCreateDocument
            addList={addList}
            headerCreate={headerCreate}
            columns={columns}
            columnEdit={columnEdit}
            apicreate={apicreate}
            createDocType={"issueOrder"}
            history={props.history}
            apiRes={apiRes}
        />
    )
};
