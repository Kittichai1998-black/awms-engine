import React from "react";
import AmProcessQueue from "../../../pageComponent/AmProcessQueue/AmProcessQueue";

const columnsDocument = [{ "accessor": "Code", "Header": "Code", "sortable": true }];
const colDocumentItem = [
    { "accessor": "Code", "Header": "Code", "sortable": false, "width": 200 },
    { "accessor": "SKUMaster_Name", "Header": "Name", "sortable": false },
    { "accessor": "Quantity", "Header": "Qty", "sortable": false, "width": 80 },
    { "accessor": "UnitType_Name", "Header": "Unit", "sortable": false, "width": 80 },
];
const columnsConfirm = [
    { "accessor":"bstoCode", "Header":"Code", "sortable":false, "width":200 },
    { "accessor": "pstoBatch", "Header": "Batch", "sortable": false },
    { "accessor": "pstoLot", "Header": "Lot", "sortable": false, "width": 100 },
    { "accessor": "pstoOrderNo", "Header": "Order No", "sortable": false, "width": 100 },
    { "accessor": "pickQty", "Header": "Pick Qty", "sortable": false, "width": 100 },
];

const documentQuery = {
    queryString: window.apipath + "/v2/SelectDataTrxAPI/",
    t: "Document",
    q: '[{ "f": "Status", "c":"<", "v": 2},{ "f": "EventStatus", "c":"=", "v": 10},{ "f": "DocumentType_ID", "c":"=", "v": 1002}]',
    f: "*",
    g: "",
    s: "[{'f':'ID','od':'desc'}]",
    sk: 0,
    l: 100,
    all: ""
};

const warehouseQuery = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "Warehouse",
    q: '[{ "f": "Status", "c":"<", "v": 2}]',
    f: "*",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: ""
};

const desAreaQuery = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "AreaMaster",
    q: '[{ "f": "Status", "c":"<", "v": 2}]',
    f: "*",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: ""
};

const processCondition = {
    "conditions": [{ "field": "Full Pallet", "key": "useFullPick", "enable": true, "defaultValue": true, "editable": false }],
    "eventStatuses": [{ "field": "Recevied", "value": 12, "enable": true, "defaultValue": true, "editable": false,}],
    "orderBys": [{"field": "Receive Date", "enable": true, "sortField": "psto.createtime", "sortBy": "0", "editable": true,}]
}

const documentDetail = {
    columns: 2,
    field: [{ "accessor": "Code", "label": "Code" }, { "accessor": "DocumentProcessType_ID", "label": "DocumentProcessType_ID" },],
    fieldHeader: [{ "accessor": "Code", "label": "Code" }]
}

const ProcessQueue = () => {
    const customDesAreaDefault = (doc) => {
        return 3;
    }

    return <AmProcessQueue
        documentPopup={columnsDocument}
        documentQuery={documentQuery}
        warehouseQuery={warehouseQuery}
        areaQuery={desAreaQuery}
        documentItemDetail={colDocumentItem}
        documentDetail={documentDetail}
        processSingle={true}
        processCondition={processCondition}
        areaDefault={customDesAreaDefault}
        columnsConfirm={columnsConfirm}
        modeDefault={"1"}
        waveProcess={false}
        confirmProcessUrl={"confirm_process_wq"}
    />
}

export default ProcessQueue;