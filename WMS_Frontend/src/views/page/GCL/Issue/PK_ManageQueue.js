import React from "react";
import AmProcessQueue from "../../../pageComponent/AmProcessQueue/AmProcessQueue";
import queryString from "query-string";

const columnsDocument = [
    { "accessor": "Code", "Header": "Code", "sortable": true, "width": 110 },
    { "accessor": "ReDocumentProcessTypeName", "Header": "Process No.", "sortable": true, "width": 190 },
    { "accessor": "CreateTime", "Header": "Create Time", "sortable": true, "type": "datetime", "width": 130 }
];
const colDocumentItem = [
    {
        "accessor": "BaseCode", "Header": "Base Code", "sortable": false, "width": 200, Cell: (e) => {
            const getOptions = queryString.parse(e.data.Options)
            return getOptions.palletcode
        }
    },
    { "accessor": "Code", "Header": "Item Code", "sortable": false, "width": 200 },
    { "accessor": "SKUMaster_Name", "Header": "Item Name", "sortable": false },
    { "accessor": "Quantity", "Header": "Qty", "sortable": false, "width": 80 },
    { "accessor": "UnitType_Name", "Header": "Unit", "sortable": false, "width": 80 },
];
const columnsConfirm = [
    //{"accessor":"bstoCode", "Header":"Code", "sortable":false, "width":200},
    // { "accessor": "pstoBatch", "Header": "Batch", "sortable": false },
    { "accessor": "pstoOrderNo", "Header": "Control No.", "sortable": false, "width": 100 },
    { "accessor": "pstoLot", "Header": "Lot", "sortable": false, "width": 100 },
    { "accessor": "pstoRef1", "Header": "Vendor Lot", "sortable": false, "width": 100 },
    { "accessor": "pickQty", "Header": "Pick Qty", "sortable": false, "width": 100 },
];

const documentQuery = {
    queryString: window.apipath + "/v2/SelectDataViwAPI/",
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
    "conditions": [
        {
            "field": "Full Pallet", "key": "useFullPick", "enable": true, "defaultValue": true, "editable": true,
        },


    ],
    "eventStatuses": [
        {
            "field": "Recevied", "value": 12, "enable": true, "defaultValue": true, "editable": true,
            // custom: (c) => { return { "defaultValue": true, "editable": true, "enable": true } } 
        }

    ],
    "auditStatuses": [
        {
            "field": "QI", "value": 4, "enable": true, "defaultValue": true, "editable": true,
            custom: (e) => {
                console.log(e)
                let customObj = { "enable": true, "defaultValue": true, "editable": true };

                return customObj
            }
        },
        {
            "field": "ACC", "value": 5, "enable": true, "defaultValue": true, "editable": true,
            custom: (e) => {
                let customObj = { "enable": true, "defaultValue": false, "editable": true };
                if (e.docItem.AuditStatus === 5)
                    customObj.defaultValue = true;
                else
                    customObj.defaultValue = false;

                return customObj
            }
        },
        {
            "field": "ACD", "value": 6, "enable": true, "defaultValue": false, "editable": true,
            custom: (e) => {
                let customObj = { "enable": true, "defaultValue": false, "editable": true };
                if (e.docItem.AuditStatus === 6)
                    customObj.defaultValue = true;
                else
                    customObj.defaultValue = false;

                return customObj
            }
        },
        {
            "field": "ACN", "value": 7, "enable": true, "defaultValue": false, "editable": true,
            custom: (e) => {
                let customObj = { "enable": true, "defaultValue": false, "editable": true };
                if (e.docItem.AuditStatus === 7)
                    customObj.defaultValue = true;
                else
                    customObj.defaultValue = false;

                return customObj
            }
        },
        {
            "field": "ACM", "value": 8, "enable": true, "defaultValue": false, "editable": true,
            custom: (e) => {
                let customObj = { "enable": true, "defaultValue": false, "editable": true };
                if (e.docItem.AuditStatus === 8)
                    customObj.defaultValue = true;
                else
                    customObj.defaultValue = false;

                return customObj
            }
        },
        {
            "field": "HOLD", "value": 9, "enable": true, "defaultValue": false, "editable": true,
            custom: (e) => {
                let customObj = { "enable": true, "defaultValue": false, "editable": true };
                if (e.docItem.AuditStatus === 9)
                    customObj.defaultValue = true;
                else
                    customObj.defaultValue = false;

                return customObj
            }
        },
        {
            "field": "BLOCK", "value": 10, "enable": true, "defaultValue": false, "editable": true,
            custom: (e) => {
                let customObj = { "enable": true, "defaultValue": false, "editable": true };
                if (e.docItem.AuditStatus === 10)
                    customObj.defaultValue = true;
                else
                    customObj.defaultValue = false;

                return customObj
            }
        },
        {
            "field": "UR", "value": 11, "enable": true, "defaultValue": false, "editable": true,
            custom: (e) => {
                let customObj = { "enable": true, "defaultValue": false, "editable": true };
                if (e.docItem.AuditStatus === 11)
                    customObj.defaultValue = true;
                else
                    customObj.defaultValue = false;

                return customObj
            }
        }
    ],
    "orderBys": [
        {
            "field": "Receive Date", "enable": true, "sortField": "psto.createtime",
            "editable": true,
            //   custom: (c) => { return { "value": true, "editable": true, "enable": true, "sortField": "psto.createtime", "sortBy": "1", } }
        },

        {
            "field": "Lot", "enable": true, "sortField": "psto.lot",
            "editable": true,
            //   custom: (c) => { return { "value": true, "editable": true, "enable": true, "sortField": "psto.lot", "sortBy": "1", } }
        },

    ]
}

const documentDetail = {
    columns: 2,
    field: [
        { "accessor": "Code", "label": "Code" },
        { "accessor": "DocumentProcessType_ID", "label": "DocumentProcessType_ID" },
    ],
    fieldHeader: [{ "accessor": "Code", "label": "Code" },
    ]
}

const ProcessQueue = (props) => {
    const customDesArea = (areaList, doc, warehouse) => {
        return areaList.filter(x => x.ID === 9 || x.ID === 10)
    }
    const customDesAreaDefault = (doc) => {
        let sku = doc.document.DocumentProcessType_ID.toString().charAt(0)
        //pm 9 Production Gate  Floor2
        //fg 10 Loading Gate  Floor1
        if (sku === '4') {
            return '10'
        }
        else if (sku === '5') {
            return '9'
        }
    }

    return <AmProcessQueue
        contentHeight={props.height}
        documentPopup={columnsDocument}
        documentQuery={documentQuery}
        warehouseQuery={warehouseQuery}
        areaQuery={desAreaQuery}
        documentItemDetail={colDocumentItem}
        documentDetail={documentDetail}
        processSingle={true}
        processCondition={processCondition}
        customDesArea={customDesArea}
        areaDefault={customDesAreaDefault}
        columnsConfirm={columnsConfirm}
        modeDefault={"1"}
        waveProcess={false}
        confirmProcessUrl={"confirm_process_wq"}
    />
}

export default ProcessQueue;