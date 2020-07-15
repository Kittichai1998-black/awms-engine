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
        t: "PackStorageObject",
        q: '', //เงื่อนไข '[{ "f": "Status", "c":"<", "v": 2}]'
        f: "packID,palletcode,skuCode,skuName,Batch as batch,Lot as lot,OrderNo as orderNo,locationCode,SIZE,SKUItems,Quantity as quantity,unitType",
        g: "",
        s: "[{'f':'packID','od':'ASC'}]",
        sk: 0,
        l: 100,
        all: ""
    };
    const SKUMaster = {
        queryString: window.apipath + "/v2/SelectDataViwAPI/",
        t: "SKUMaster",
        q: '[{ "f": "Status", "c":"<", "v": 2},{ "f": "SKUMasterType_ID", "c":"!=", "v": 50}]',
        f: "ID as skuID,Code as skuCode,Name as skuName,UnitTypeCode as unitType,concat(Code, ' : ' ,Name) as SKUItems",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: ""
    };

    const headerCreate = [
        [
            { label: "Document No.", type: "labeltext", key: "", texts: "-" },
            { label: "Document Date", type: "date", key: "documentDate" }
        ],
        [
            { label: "Movement Type", type: "labeltext", key: "movementTypeID", texts: "FG_TRANSFER_CUS", valueTexts: "1012" },
            { label: "Action Time", type: "dateTime", key: "actionTime" }
        ],
        [
            { label: "Source Warehouse", type: "labeltext", key: "souWarehouseID", texts: "", valueTexts: 1 },
            { label: "Destination Customer", type: "dropdown", key: "desCustomerID", queryApi: view_Customer, fieldLabel: ["Code", "Name"], defaultValue: 1 }
        ],
        [
            { label: "Doc Status", type: "labeltext", key: "", texts: "NEW" },
            { label: "Remark", type: "input", key: "remark" }
        ]
    ];

    const columsFindPopup = [
        { Header: "Order No.", accessor: "orderNo", width: 100, style: { textAlign: "center" } },
        { Header: "Pallet", accessor: "palletcode", width: 110, style: { textAlign: "center" } },
        { Header: "SRM Line", accessor: "srmLine", width: 95, style: { textAlign: "center" } },
        { Header: "Item Code", accessor: "SKUItems", width: 350 },
        // { Header: "SKU Code", accessor: 'Code', width: 110 },
        // { Header: "SKU Name", accessor: 'Name', width: 170 },
        { Header: "Location", accessor: "LocationCode", width: 90, style: { textAlign: "center" } },
        // { Header: 'Batch', accessor: 'Batch' },
        // { Header: "Base Qty", accessor: "Quantity", width: 90 },
        // { Header: "Base Unit", accessor: "BaseUnitCode", width: 90 },
        { Header: "Qty", accessor: "SaleQuantity", width: 90 },
        { Header: "Unit", accessor: "UnitCode", width: 70 }
    ];

    const addList = {
        queryApi: view_sto,
        columns: columsFindPopup,
        primaryKeyTable: "packID",
        search: [
            { accessor: "palletcode", placeholder: "Pallet" },
            { accessor: "Code", placeholder: "Reorder (Item Code)" },
            { accessor: "LocationCode", placeholder: "Location" }
            // { accessor: "remark", placeholder: "Remark" }
        ]
    };

    const columsFindPopupSKU = [
        { Header: "Code", accessor: "skuCode", fixed: "left", width: 110, sortable: true },
        { Header: "Name", accessor: "skuName", width: 250, sortable: true },
        { Header: "Unit", accessor: "unitType", width: 50 }
    ];

    const columnEdit = [
        { Header: "Order No.", accessor: "orderNo", type: "input" },
        {
            // search: false,
            Header: "SKU Item",
            accessor: "skuCode",
            type: "findPopUp",
            queryApi: SKUMaster,
            fieldLabel: ["skuCode", "skuName"],
            columsddl: columsFindPopupSKU,
            related: ["unitType", "skuName", "SKUItems"],
            fieldDataKey: "Code", // ref กับ accessor
            defaultValue: "PJAAN04-0024",
            required: true
        },
        { Header: "Quantity", accessor: "quantity", type: "inputNum", required: true },
        { Header: "Unit", accessor: "unitType", type: "text" }
    ];

    const columns = [
        // { id: "row", Cell: row => row.index + 1, width: 35 },
        { Header: "Order No.", accessor: "orderNo", width: 100 },
        { Header: "Item Code", accessor: "SKUItems" },
        { Header: "Qty", accessor: "quantity", width: 110 },
        { Header: "Unit", accessor: "unitType", width: 90 }
    ];

    const apicreate = "/v2/CreateDRDocAPI/"; //API สร้าง Doc
    const apiRes = "/receive/detail?docID="; //path หน้ารายละเอียด ตอนนี้ยังไม่เปิด

    return (
        <AmCreateDocument
            // addList={addList}
            headerCreate={headerCreate}
            columns={columns}
            columnEdit={columnEdit}
            apicreate={apicreate}
            createDocType={"receive"}
            history={props.history}
            apiRes={apiRes}
        // singleItem
        />
    )
};
