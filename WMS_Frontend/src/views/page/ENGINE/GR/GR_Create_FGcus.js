import React, { useState, useEffect } from "react";

import AmCreateDocument from "../../../../components/AmCreateDocumentNew";
import AmCreateDoc from '../../../.././components/AmImportDocumentExcel';
import Grid from '@material-ui/core/Grid';
import queryString from "query-string";
import {
    apicall,
    createQueryString
} from "../../../../components/function/CoreFunction";

const Axios = new apicall();

const SKUMaster = {
    queryString: window.apipath + "/v2/SelectDataViwAPI/",
    t: "SKUMaster",
    q: '[{ "f": "Status", "c":"<", "v": 2}]',
    f: "ID as skuID,Code as skuCode,Name as skuName,UnitTypeCode as unitType,concat(Code, ' : ' ,Name) as SKUItems",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: ""
};


const RD_Create_FGCustomer = props => {
    const [CodeprocessType, setCodeprocessType] = useState(1);
    const [CodeprocessNo, setCodeprocessNo] = useState(4)
    const [table, setTable] = useState(null);
    const [HeaderDoc, setHeaderDoc] = useState([]);
    const [skuType, setskuType] = useState(4);
    const [columSKU, setcolumSKU] = useState();
    const [skuquery, setskuquery] = useState(SKUMaster);
    const [Type, setType] = useState(true);
    const [ProcessTypeCode, setProcessTypeCode] = useState();


    useEffect(() => {
        if (CodeprocessType !== "" && CodeprocessType !== null) {
            var DataprocessTypeID;
            var defaulProcessType = 1010
            if (CodeprocessType === 1) {
                DataprocessTypeID = { label: "Sou. Warehouse", type: "dropdown", key: "souWarehouseID", queryApi: WarehouseQuery, fieldLabel: ["Code", "Name"], defaultValue: 1, codeTranslate: "Source Warehouse" }
            } else if (CodeprocessType === 2) {
                DataprocessTypeID = { label: "Sou. Customer", type: "dropdown", key: "souCustomerID", queryApi: CustomerQuery, fieldLabel: ["Code", "Name"], defaultValue: 1, codeTranslate: "Source Customer" }
            } else if (CodeprocessType === 3) {
                DataprocessTypeID = { label: "Sou. Supplier", type: "dropdown", key: "souSupplierID", queryApi: SupplierQuery, fieldLabel: ["Code", "Name"], defaultValue: 1, codeTranslate: "Source Supplier" }
            } else {
                DataprocessTypeID = { label: "Sou. Warehouse", type: "dropdown", key: "souWarehouseID", queryApi: WarehouseQuery, fieldLabel: ["Code", "Name"], defaultValue: 1, codeTranslate: "Source Warehouse" }
            }
            var headerCreate = [
                [
                    { label: "Doc No.", type: "labeltext", key: "", texts: "-", codeTranslate: "Document No." },
                    { label: "Doc Date", type: "date", key: "documentDate", codeTranslate: "Document Date", width: '300px' }
                ],
                [
                    { label: "Process No.", type: "dropdown", key: "documentProcessTypeID", queryApi: DocumentProcessTypeQuery, fieldLabel: ["Code", "ReProcessType_Name"], defaultValue: 4011, codeTranslate: "Process Type" },
                    { label: "Action Time", type: "dateTime", key: "actionTime", codeTranslate: "Action Time", width: '300px' }
                ],
                [
                    { label: "PO NO.", type: "input", key: "ref1", codeTranslate: "PO", width: '300px' }
                ],
                [
                    DataprocessTypeID,
                    { label: "Des. Warehouse", type: "dropdown", key: "desWarehouseID", queryApi: WarehouseQuery, fieldLabel: ["Code", "Name"], defaultValue: 1, codeTranslate: "Des Warehouse" }
                ],
                [
                    { label: "Doc Status", type: "labeltext", key: "", texts: "NEW", codeTranslate: "Doc Status" },
                    { label: "Remark", type: "input", key: "remark", codeTranslate: "Remark", width: '300px' }
                ],


            ];

            setHeaderDoc(headerCreate)
            setskuquery();
            setType(true)


        } else {

        }
    }, [CodeprocessType]);

    useEffect(() => {
        if (HeaderDoc.length > 0) {
            setTable(
                <AmCreateDocument
                    //addList={addList}
                    headerCreate={HeaderDoc}
                    onChangeProcessType={((e) => { setCodeprocessType(e) })}
                    onChangeProcesTypeSKU={((e) => { setskuType(e) })}
                    onChangeProcessTypeCode={((e) => { setProcessTypeCode(e) })}
                    columns={columns}
                    columnEdit={columSKU}
                    apicreate={apicreate}
                    createDocType={"receive"}
                    history={props.history}
                    itemNo={true}
                    defualItemNo={'0001'}
                    apiRes={apiRes}
                />
            );
        }


    }, [HeaderDoc, CodeprocessType, columSKU])


    useEffect(() => {
        console.log(skuType)
        let itemNos = '0001'
        if (SKUMaster) {
            let objQuery = SKUMaster;
            if (objQuery !== null && Type === true && skuType !== undefined) {
                let skuqrys = JSON.parse(objQuery.q);
                skuqrys = [{ "f": "Status", "c": "<", "v": 2 }, { 'f': 'SKUMasterType_ID', 'c': '=', 'v': skuType }]
                objQuery.q = JSON.stringify(skuqrys);
            }
            setskuquery(objQuery)
        }

        let Headers;
        let Horder;
        let AuditStatusDDL;

        if (skuType === 5) {
            Headers = { Header: "Vendor Lot", accessor: "ref1", type: "input", required: true, width: '300px' }
        } else {
            Headers = { Header: "Lot", accessor: "lot", type: "input", width: '300px', required: true}
        }
        //if (skuType === 5) {
        //    Horder = { Header: "Control No.", accessor: "orderNo", type: "input", width: '300px' }
        //} else {
        //    Horder = { Header: "Order No.", accessor: "orderNo", type: "input", width: '300px' }
        //}
    
        if (ProcessTypeCode === '5191' || ProcessTypeCode === '4132' ) {
            AuditStatusDDL = { Header: "Quality Status", accessor: "auditStatus", type: "dropdownvalue", data: AuditStatus, key: "value", defaultValue: '9', disabled: true }
        } else if (ProcessTypeCode === '5011' || ProcessTypeCode === '4991' ) {
            AuditStatusDDL = { Header: "Quality Status", accessor: "auditStatus", type: "dropdownvalue", data: AuditStatus, key: "value", defaultValue: '1', disabled: true }
        } else if (ProcessTypeCode === '5013') {
            AuditStatusDDL = { Header: "Quality Status", accessor: "auditStatus", type: "dropdownvalue", data: AuditStatus, key: "value", defaultValue: '0', disabled: true }
        }else {
            AuditStatusDDL = { Header: "Quality Status", accessor: "auditStatus", type: "dropdownvalue", data: AuditStatus, key: "value", defaultValue: '0' }
        }

        var columnEdit = [
            // { Header: "Item No.", accessor: "itemNo", type: "itemNo", texts: itemNos },
            {
                // search: false,
                Header: "Item Code",
                accessor: "skuCode",
                type: "findPopUp",
                queryApi: skuquery,
                fieldLabel: ["skuCode"],
                columsddl: columsFindPopupSKU,
                related: ["skuName", "SKUItems"],
                fieldDataKey: "Code", // ref กับ accessor
                //defaultValue: "PJAAN04-0024",
                required: true
            },
            {
                // search: false,
                Header: "Item Name",
                accessor: "skuName",
                type: "findPopUp",
                queryApi: skuquery,
                fieldLabel: ["skuName"],
                columsddl: columsFindPopupSKU,
                related: ["skuName", "SKUItems"],
                fieldDataKey: "Name", // ref กับ accessor
                //defaultValue: "PJAAN04-0024",
                required: true
            },
            { Header: "Control No.", accessor: "orderNo", type: "input", width: '300px' },
            //{ Header: "Batch", accessor: "batch", type: "input", width: '300px' },
               Headers,
            { Header: "Qty", accessor: "quantity", type: "inputNum", required: true, width: '300px' },
            { Header: "Unit", accessor: "unitType", type: "unitConvert", width: '300px', required: true},
              AuditStatusDDL,

            //{ Header: "Ref2", accessor: "ref2", type: "input" },
            //{ Header: "Ref3", accessor: "ref3", type: "input" },
            { Header: "ReMark", accessor: "remark", type: "input", width: '300px' },
            { Header: "Carton No.", accessor: "cartonNo", type: "input", width: '300px' },
           // { Header: "Incubation Day", accessor: "incubationDay", type: "inputNum", width: '300px'},
            { Header: "MFG.Date", accessor: "productionDate", type: "date", width: '300px', required: true },
            { Header: "Expire Date", accessor: "expireDate", type: "date", width: '300px', required: true },
            //{ Header: "ShelfLife Day", accessor: "shelfLifeDay", type: "inputNum" }
        ];

        setcolumSKU(columnEdit)
        //setType(false)

        //setskuquery()
    }, [skuType, ProcessTypeCode])

    const AuditStatus = [
        { label: 'QUARANTINE', value: '0' },
        { label: 'PASSED', value: '1' },
        { label: 'REJECTED', value: '2' },
        { label: 'HOLD', value: '9' },
    ];


    const WarehouseQuery = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "Warehouse",
        q: '[{ "f": "Status", "c":"<", "v": 2}]',
        f: "ID,Code,Name",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: ""
    };

    const UnitTypeQuery = {
        queryString: window.apipath + "/v2/SelectDataViwAPI/",
        t: "UnitTypeConvert",
        q: '[{ "f": "Status", "c":"<", "v": 2},]',
        f: "*",
        g: "",
        s: "[{ 'f': 'unitTypeID', 'od': 'asc' }]",
        sk: 0,
        l: 100,
        all: ""
    };


    const CustomerQuery = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "Customer",
        q: '[{ "f": "Status", "c":"<", "v": 2},]',
        f: "ID,Code,Name",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: ""
    };

    const SupplierQuery = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "Supplier",
        q: '[{ "f": "Status", "c":"<", "v": 2},]',
        f: "ID,Code,Name",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: ""
    };



    const DocumentProcessTypeQuery = {
        queryString: window.apipath + "/v2/SelectDataViwAPI/",
        t: "DocumentProcessTypeMap",
        q: '[{ "f": "Status", "c":"=", "v": 1},{ "f": "DocumentType_ID", "c":"=", "v": 1011}]',
        f: "*",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: ""
    };

    const columsFindPopupSKU = [
        { Header: "Code", accessor: "skuCode", fixed: "left", width: 110, sortable: true },
        { Header: "Name", accessor: "skuName", width: 250, sortable: true },
    ];


    const columns = [
       // { id: "row", Cell: row => row.index + 1, width: 35 },
        //{ Header: "Item No.", accessor: "itemNo" },
        { Header: "Item Code", accessor: "skuCode" },
        { Header: "Item Name", accessor: "skuName", width: 200 },
        { Header: "Control No.", accessor: "orderNo" },
        //{ Header: "Batch", accessor: "batch" },
        { Header: "Lot", accessor: "lot" },
        { Header: "Vendor Lot", accessor: "ref1" },
        { Header: "Qty", accessor: "quantity" },
        { Header: "Unit", accessor: "unitType" },
        { Header: "Quality Status", accessor: "auditStatus" },        
        { Header: "Remark", accessor: "remark" },
        //{ Header: "Ref3", accessor: "ref3" },
        //{ Header: "Ref4", accessor: "ref4" },
        { Header: "Carton No.", accessor: "cartonNo" },
        //{ Header: "Incubation Day", accessor: "incubationDay" },
        { Header: "MFG.Date", accessor: "productionDate" },
        { Header: "Expire Date", accessor: "expireDate" },
        //{ Header: "ShelfLife Day", accessor: "shelfLifeDay" }
    ];

    const apicreate = "/v2/CreateDRDocAPI/"; //API สร้าง Doc
    const apiRes = "/receive/detail?docID="; //path หน้ารายละเอียด ตอนนี้ยังไม่เปิด

    return <div>
        <Grid container>
            <Grid item xs container direction="column">
            </Grid>
            <Grid item>
                <AmCreateDoc
                    apicreate={"/v2/CreateDRDocAPI/"}
                    apiRes={"/receive/detail?docID="}
                    history={props.history}
                    docTypename={"receive"}
                ></AmCreateDoc>
            </Grid>
        </Grid>
        <div>
            {table}</div></div>;
};

export default RD_Create_FGCustomer;
