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
    //{"accessor":"bstoCode", "Header":"Code", "sortable":false, "width":200},
    { "accessor": "pstoBatch", "Header": "Batch", "sortable": false },
    { "accessor": "pstoLot", "Header": "Lot", "sortable": false, "width": 100 },
    { "accessor": "pstoOrderNo", "Header": "Order No", "sortable": false, "width": 100 },
    { "accessor": "pickQty", "Header": "Pick Qty", "sortable": false, "width": 100 },
];

const documentQuery = {
    queryString: window.apipath + "/v2/SelectDataTrxAPI/",
    t: "Document",
    q: '[{ "f": "Status", "c":"<", "v": 2},{ "f": "EventStatus", "c":"=", "v": 10},{ "f": "DocumentType_ID", "c":"=", "v": 2003}]',
    f: "*",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: ""
};

const warehouseQuery = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "Warehouse",
    q:
        '[{ "f": "Status", "c":"<", "v": 2}]',
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
    q:
        '[{ "f": "Status", "c":"<", "v": 2}]',
    f: "*",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: ""
};

const processCondition = {
    // "conditions": [
    //     {
    //         "field": "Full Pallet", "key": "useFullPick", "enable": false, "defaultValue": true, "editable": true,
    //     },
    //     {
    //         "field": "Incubated", "key": "useIncubateDate", "enable": false, "defaultValue": true, "editable": true,
    //         // custom: (c) => { return { "enable": false, "defaultValue": true, "editable": true } } 
    //     },
    //     {
    //         "field": "Expire Date", "key": "useExpireDate", "enable": false, "defaultValue": true, "editable": true,
    //         // custom: (c) => { return { "enable": false, "defaultValue": true, "editable": true } } 
    //     }
    // ],
    "eventStatuses": [
        {
            "field": "Recevied", "value": 12, "enable": true, "defaultValue": true, "editable": true,
            // custom: (c) => { return { "defaultValue": true, "editable": true, "enable": true } } 
        }
        // {
        //     "field": "Consolidated", "value": 36, "enable": true, "defaultValue": true, "editable": true,
        //     // custom: (c) => { return { "defaultValue": true, "editable": true, "enable": true } } 
        // },
        //{ "field": "Block", "value": 907, "enable": true, "defaultValue": true, "editable": true, custom: (c) => { return { "defaultValue": true, "editable": true, "enable": true } } },
        //{ "field": "QC", "value": 908, "enable": true, "defaultValue": true, "editable": true, custom: (c) => { return { "defaultValue": true, "editable": true, "enable": true } } }
    ],
    "auditStatuses": [
        {
            "field": "QUARANTINE", "value": 0, "enable": true, "defaultValue": false, "editable": true,
        },
        {
            "field": "PASSED", "value": 1, "enable": true, "defaultValue": true, "editable": true,
        },
        {
            "field": "REJECTED", "value": 2, "enable": true, "defaultValue": false, "editable": true,
        },
        {
            "field": "HOLD", "value": 9, "enable": true, "defaultValue": false, "editable": true,
        }
    ],
    "orderBys": [
        {
            "field": "Receive Date", "enable": true, "sortField": "psto.createtime", 
            "defaultSortBy": "0", 
            "editable": true, 
            "order":1,
            //   custom: (c) => { return { "value": true, "editable": true, "enable": true, "sortField": "psto.createtime", "sortBy": "1", } }
        },
        {
            "field": "Batch", "enable": true, "sortField": "psto.batch", 
            "defaultSortBy": "0", 
            "editable": true, 
            "order":2,
            //   custom: (c) => { return { "value": true, "editable": true, "enable": true, "sortField": "psto.batch", "sortBy": "1", } }
        },
        {
            "field": "Lot", "enable": true, "sortField": "psto.lot", 
            "editable": true, 
            //   custom: (c) => { return { "value": true, "editable": true, "enable": true, "sortField": "psto.lot", "sortBy": "1", } }
        }
    ]
}

const documentDetail = {
    columns: 2,
    field: [
        { "accessor": "Code", "label": "Code" }, { "accessor": "DocumentProcessType_ID", "label": "DocumentProcessType_ID" },
    ],
    fieldHeader: [{ "accessor": "Code", "label": "Code" }, { "accessor": "RefID", "label": "RefID" }]
}

const ProcessQueue = () => {
    const customDesArea = (areaList, doc, warehouse) => {
        if (doc.document.DocumentProcessType_ID === 1013) {
            return areaList.filter(x => x.ID === 9 || x.ID === 10 || x.ID === 11 || x.ID === 12)
        }
        else
            return areaList
    }

    const customDesAreaDefault = (doc) => {
        if (doc.document.DocumentProcessType_ID === 1013) {
            return "10"
        }
        else
            return "10"
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
        percentRandom={true}
        customDesArea={customDesArea}
        areaDefault={customDesAreaDefault}
        columnsConfirm={columnsConfirm}
        modeDefault={"1"}
        waveProcess={false}
        confirmProcessUrl={"confirm_process_wq"}
    />
}

export default ProcessQueue;