import React from "react";

import AmCreateDocument from "../../../../components/AmCreateDocumentNew";

export default props => {
    //call backend

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
            { label: "Movement Type", type: "labeltext", key: "movementTypeID", texts: "STO_TRANSFER_WM", valueTexts: "5011", codeTranslate: "Movement Type" },
            { label: "Action Time", type: "dateTime", key: "actionTime", codeTranslate: "Action Time" }
        ],
        [
            { label: "Source Warehouse", type: "labeltext", key: "souWarehouseID", texts: "ASRS", valueTexts: 1, codeTranslate: "Source Warehouse" },
            { label: "Destination Warehouse", type: "labeltext", key: "desWarehouseID", texts: "ASRS", valueTexts: 1, codeTranslate: "Destination Warehouse" },

        ],
        [
            { label: "Doc Status", type: "labeltext", key: "", texts: "NEW", codeTranslate: "Doc Status" },
            { label: "Remark", type: "input", key: "remark", codeTranslate: "Remark" }
        ]
    ];

    const columsFindPopup = [
        { Header: "Order No.", accessor: "orderNo", width: 100, style: { textAlign: "center" }, codeTranslate: "Order No." },
        { Header: "SRM Line", accessor: "srmLine", width: 95, style: { textAlign: "center" }, codeTranslate: "SRM Line" },
        { Header: "Item Code", accessor: "SKUItems", width: 350, codeTranslate: "Item Code" },
        // { Header: "SKU Code", accessor: 'Code', width: 110 },
        // { Header: "SKU Name", accessor: 'Name', width: 170 },
        { Header: "Location", accessor: "LocationCode", width: 90, style: { textAlign: "center" }, codeTranslate: "Location" },
        // { Header: 'Batch', accessor: 'Batch' },
        // { Header: "Base Qty", accessor: "Quantity", width: 90, codeTranslate: "Base Qty" },
        // { Header: "Base Unit", accessor: "BaseUnitCode", width: 90, codeTranslate: "Base Unit" },
        { Header: "Qty", accessor: "SaleQuantity", width: 90, codeTranslate: "Qty" },
        { Header: "Unit", accessor: "UnitCode", width: 70, codeTranslate: "Unit" }
    ];

    const columsFindPopupSKU = [
        { Header: "Code", accessor: "Code", fixed: "left", width: 100, sortable: true },
        { Header: "Name", accessor: "Name", width: 250, sortable: true },
        { Header: "Unit", accessor: "UnitTypeCode", width: 100 }
    ];

    const columnEdit = [
        { Header: "Lot", accessor: "lot", type: "input", codeTranslate: "Lot" },
        { Header: "Item Code", accessor: "SKUItems", type: "findPopUp", pair: "skuCode", idddl: "skuitems", queryApi: SKUMaster, fieldLabel: ["SKUItems"], columsddl: columsFindPopupSKU, codeTranslate: "Item Code", required: true },
        // { Header: "Base Qty", accessor: "quantity", type: "inputNum" },
        // { Header: "Base Unit", accessor: "unitType", type: "text" },
        // { Header: "Base Qty", accessor: "Quantity", type: "text" },
        // { Header: "Base Unit", accessor: "BaseUnitCode", type: "text" },
        { Header: "Quantity", accessor: "quantity", type: "inputNum" },
        { Header: "Unit", accessor: "unitType", type: "text", codeTranslate: "Unit" }
    ];

    const columns = [
        { id: "row", Cell: row => row.index + 1, width: 35 },
        { Header: "Lot", accessor: "lot", width: 100 },
        { Header: "Item Code", accessor: "SKUItems" },
        // { Header: "Base Qty", accessor: "quantity", width: 90 },
        // { Header: "Base Unit", accessor: "unitType", width: 70 },
        // { Header: "Base Qty", accessor: "Quantity", width: 90 },
        // { Header: "Base Unit", accessor: "BaseUnitCode", width: 90 },
        { Header: "Qty", accessor: "quantity", width: 110 },
        { Header: "Unit", accessor: "unitType", width: 90 }
    ];

    const apicreate = "/v2/CreateGRDocAPI/"; //API สร้าง Doc
    const apiRes = "/receive/detail?docID="; //path หน้ารายละเอียด ตอนนี้ยังไม่เปิด

    return (
        <AmCreateDocument
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
