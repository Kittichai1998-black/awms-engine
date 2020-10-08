import React from "react";
import AmProcessQueue from "../../../pageComponent/AmProcessQueue/AmProcessQueue";
import queryString from "query-string";

const columnsDocument = [{ "accessor": "Code", "Header": "Code", "sortable": true }];
const colDocumentItem = [
    { "accessor": "BaseCode", "Header": "Base Code", "sortable": false, "width": 200, Cell:(e) => {
        const getOptions = queryString.parse(e.data.Options)
        return getOptions.palletcode
    } },
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
    queryString: window.apipath + "/v2/SelectDataTrxAPI/",
    t: "Document",
    q: '[{ "f": "Status", "c":"<", "v": 2},{ "f": "EventStatus", "c":"=", "v": 10},{ "f": "DocumentType_ID", "c":"=", "v": 1002}]',
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
    "conditions": [
        {
            "field": "Full Pallet", "key": "useFullPick", "enable": true, "defaultValue": true, "editable": true,
        },
        {
            "field": "Shelf Life > 85%", "key": "useShelfLifeDate", "enable": true, "defaultValue": true, "editable": true,
            custom: (c) => {
                let objCon = { "enable": true, "defaultValue": true, "editable": true} 
                if(c.docItem.SKUMasterTypeID === 5){
                    objCon.defaultValue = false;
                }
                return objCon;
            }
        },
        // {
        //     "field": "Incubated", "key": "useIncubateDate", "enable": false, "defaultValue": true, "editable": true,
        //     // custom: (c) => { return { "enable": false, "defaultValue": true, "editable": true } } 
        // },
        // {
        //     "field": "Expire Date", "key": "useExpireDate", "enable": false, "defaultValue": true, "editable": true,
        //     // custom: (c) => { return { "enable": false, "defaultValue": true, "editable": true } } 
        // }
    ],
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
            custom:(e)=>{
                let customObj = {"enable": true, "defaultValue": false, "editable": true};
                if(e.docItem.AuditStatus === 0)
                    customObj.defaultValue = true;
                else
                    customObj.defaultValue = false;
                
                return customObj
            }
        },
        {
            "field": "PASSED", "value": 1, "enable": true, "defaultValue": true, "editable": true,
            custom:(e)=>{
                let customObj = {"enable": true, "defaultValue": false, "editable": true};
                if(e.docItem.AuditStatus === 1)
                    customObj.defaultValue = true;
                else
                    customObj.defaultValue = false;
                
                return customObj
            }
        },
        {
            "field": "REJECTED", "value": 2, "enable": true, "defaultValue": false, "editable": true,
            custom:(e)=>{
                let customObj = {"enable": true, "defaultValue": false, "editable": true};
                if(e.docItem.AuditStatus === 2)
                    customObj.defaultValue = true;
                else
                    customObj.defaultValue = false;
                
                return customObj
            }
        },
        {
            "field": "HOLD", "value": 9, "enable": true, "defaultValue": false, "editable": true,
            custom:(e)=>{
                let customObj = {"enable": true, "defaultValue": false, "editable": true};
                if(e.docItem.AuditStatus === 9)
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
            "field": "Expiry Date", "enable": true, "sortField": "psto.expirydate",
            "editable": true,
            "order": 1,
            custom: (c) => {
                let objSorting = { "value": true, "editable": true, "enable": true, "sortField": "psto.expirydate"} 
                if(c.docItem.SKUMasterTypeID === 4){
                    objSorting.defaultSortBy = "0"
                    objSorting.order = 1
                }

                return objSorting;
            }
        },
        {
            "field": "Batch", "enable": true, "sortField": "psto.batch",
            "editable": true,
            //   custom: (c) => { return { "value": true, "editable": true, "enable": true, "sortField": "psto.batch", "sortBy": "1", } }
        },
        {
            "field": "Lot", "enable": true, "sortField": "psto.lot",
            "editable": true,
            //   custom: (c) => { return { "value": true, "editable": true, "enable": true, "sortField": "psto.lot", "sortBy": "1", } }
        },
        {
            "field": "Control No", "enable": true, "sortField": "psto.orderNo",
            "editable": true,
            "order": 2,
            custom: (c) => {
                let objSorting = { "editable": true, "enable": true, "sortField": "psto.orderNo"} 
                if(c.docItem.SKUMasterTypeID === 5){
                    objSorting.defaultSortBy = "0";
                    objSorting.order = 1
                }
                return objSorting;
            }
        }
    ]
}

const documentDetail = {
    columns: 2,
    field: [
        { "accessor": "Code", "label": "Code" },
        { "accessor": "DocumentProcessType_ID", "label": "DocumentProcessType_ID" },
    ],
    fieldHeader: [{ "accessor": "Code", "label": "Code" },
    { "accessor": "RefID", "label": "RefID" }]
}

const ProcessQueue = () => {
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