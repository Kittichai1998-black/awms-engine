import React from "react";
import AmProcessQueue from "../../../pageComponent/AmProcessQueue/AmProcessQueue";
import {
    apicall
} from "../../../../components/function/CoreFunction";

const columnsDocument = [{ "accessor": "Code", "Header": "เลขที่ใบเบิก", "sortable": true }];
const colDocumentItem = [
    { "accessor": "BaseCode", "Header": "เลขที่ภาชนะ", "sortable": false, "width": 200 },
    { "accessor": "Code", "Header": "ชนิดราคา", "sortable": false, "width": 80 },
    { "accessor": "Quantity", "Header": "จำนวน", "sortable": false, "width": 80 },
    { "accessor": "Ref2", "Header": "แบบ", "sortable": false, "width": 80 },
    { "accessor": "Ref3", "Header": "ประเภทธนบัตร", "sortable": false, "width": 80 },
    { "accessor": "Ref1", "Header": "สถาบัน", "sortable": false, "width": 80 },
    { "accessor": "Ref4", "Header": "ศูนย์เงินสด", "sortable": false, "width": 80 },
];
const columnsConfirm = [
    { "accessor":"bstoCode", "Header":"เลขที่ภาชนะ", "sortable":false, "width":200 },
    { "accessor": "pickQty", "Header": "จำนวน", "sortable": false, "width": 150 },
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
    "auditStatuses": [{ "field": "QUARANTINE", "value": 0, "enable": true, "defaultValue": true, "editable": false,},
    { "field": "PASSED", "value": 1, "enable": true, "defaultValue": true, "editable": false,},
    { "field": "NOTPASSED", "value": 3, "enable": true, "defaultValue": true, "editable": false,}],
    "orderBys": [{"field": "Receive Date", "enable": true, "sortField": "psto.createtime", "sortBy": "0", "editable": true,}]
}

const documentDetail = {
    columns: 2,
    field: [{ "accessor": "Code", "label": "Code" }, { "accessor": "DocumentProcessType_ID", "label": "DocumentProcessType_ID" },],
    fieldHeader: [{ "accessor": "Code", "label": "Code" }]
}

var Axios = new apicall();

const customAfterProcess  = (res) => {
    if(res._result.status === 0)
        Axios.post(window.apipath + "/v2/pcq_error", { docID:res.processResults[0].docID });
    else{
        let flagError = false;
        for(let i = 0; i < res.processResults.length; i++){
            let p = res.processResults[i]
            if(flagError)
                break;
            for(let j = 0; j < p.processResultItems.length; j++){
                let pc = p.processResultItems[j];
                if(pc.pickStos.length === 0)
                {
                    flagError = true;
                    res._result.status = 0
                    res._result.message = "ไม่พบสินค้าในเอกสาร " + p.docCode + ":" + pc.docItemCode
                    break;
                }
                else{
                    let sumQty = pc.pickStos.reduce((o, n) => {
                        return o + n.pickBaseQty;
                    }, 0);
                    if(pc.baseQty !== null){
                        if(pc.baseQty !== sumQty)
                        {
                            flagError = true;
                            res._result.status = 0
                            res._result.message = "ไม่พบสินค้าในเอกสาร " + p.docCode + ":" + pc.docItemCode
                            break;
                        }
                    }
                }
            }
        }
        if(flagError === true){
            Axios.post(window.apipath + "/v2/pcq_error", { docID:res.processResults[0].docID });
        }
    }
    
    return res;
};

const ProcessQueue = (props) => {
    const customDesAreaDefault = (doc) => {
        return 3;
    }
    return <AmProcessQueue
        contentHeight={props.height}
        confirmErrorClear={true}
        processErrorClear={true}
        documentPopup={columnsDocument}
        documentQuery={documentQuery}
        warehouseQuery={warehouseQuery}
        areaQuery={desAreaQuery}
        warehouseDefault="1"
        documentItemDetail={colDocumentItem}
        documentDetail={documentDetail}
        processSingle={true}
        processCondition={processCondition}
        areaDefault={customDesAreaDefault}
        columnsConfirm={columnsConfirm}
        modeDefault={"1"}
        waveProcess={false}
        confirmProcessUrl={"confirm_process_wq"}
        customAfterProcess = {(res) => customAfterProcess(res)}
    />
}

export default ProcessQueue;