import React, { useState, useEffect } from "react";

import AmCreateDocument from "../../../../components/AmCreateDocumentNew";
import AmCreateDoc from '../../../.././components/AmImportDocumentExcel';
import Grid from '@material-ui/core/Grid';
//import queryString from "query-string";
import moment from "moment";
import {
    apicall,
    createQueryString
} from "../../../../components/function/CoreFunction";

const Axios = new apicall();

const SKUMaster = {
    queryString: window.apipath + "/v2/SelectDataViwAPI/",
    t: "SKUMaster",
    q: '[{ "f": "Status", "c":"<", "v": 2}]',
    f: "*",
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
        let Control;
        let ProDate;
        let Expire;
        if (skuType === 5) {
            Headers = { Header: "Vendor Lot", accessor: "ref1", type: "input", width: '300px' }
            Control = { Header: "Control No.", accessor: "orderNo", type: "input", width: '300px', required: true }
            ProDate = { Header: "MFG.Date", accessor: "productionDate", type: "dateFalse", width: '300px', defaultValue: false }
            Expire = { Header: "Expire Date", accessor: "expireDate", type: "dateFalse", width: '300px', defaultValue: false }

        } else if (skuType === 9) {
            Headers = { Header: "Lot", accessor: "lot", type: "input", width: '300px'}
            Control = { Header: "Control No.", accessor: "orderNo", type: "input", width: '300px' }
            ProDate = { Header: "MFG.Date", accessor: "productionDate", type: "date", width: '300px' }
            Expire = { Header: "Expire Date", accessor: "expireDate", type: "date", width: '300px' }

        }else{
            Headers = { Header: "Lot", accessor: "lot", type: "input", width: '300px', required: true }
            Control = { Header: "Control No.", accessor: "orderNo", type: "input", width: '300px' }
            ProDate = { Header: "MFG.Date", accessor: "productionDate", type: "date", width: '300px', required: true }
            Expire = { Header: "Expire Date", accessor: "expireDate", type: "date", width: '300px', required: true }
        }


        if (ProcessTypeCode === '5191' || ProcessTypeCode === '4132' || ProcessTypeCode === '4192'  ) {
            AuditStatusDDL = { Header: "Quality Status", accessor: "auditStatus", type: "dropdownvalue", data: AuditStatus, key: "value", defaultValue: '9', disabled: true }
        } else if (ProcessTypeCode === '5011' || ProcessTypeCode === '4991' || ProcessTypeCode === '4092') {
            AuditStatusDDL = { Header: "Quality Status", accessor: "auditStatus", type: "dropdownvalue", data: AuditStatus, key: "value", defaultValue: '1', disabled: true }
        } else if (ProcessTypeCode === '5013') {
            AuditStatusDDL = { Header: "Quality Status", accessor: "auditStatus", type: "dropdownvalue", data: AuditStatus, key: "value", defaultValue: '0', disabled: true }
        }else {
            AuditStatusDDL = { Header: "Quality Status", accessor: "auditStatus", type: "dropdownvalue", data: AuditStatus, key: "value", defaultValue: '0' }
        }

        var columnEdit = [
            {
                Header: "Item Code",
                accessor: "Code",
                type: "findPopUp",
                search: "Code",
                queryApi: skuquery,
                fieldLabel: ["Code"],
                columsddl: columsFindPopupSKU,
                related: ["Name"],
                fieldDataKey: "Code", // ref กับ accessor
                required: true
            },
            {
                Header: "Item Name",
                accessor: "Name",
                type: "text",
                //queryApi: skuquery,
                //fieldLabel: ["Name"],
                //columsddl: columsFindPopupSKU,
                //related: ["Code",],
                //fieldDataKey: "Name",
                //required: true
            },
            Control,
            Headers, 
            { Header: "Quantity", accessor: "quantity", type: "inputNum", required: true, width: '300px' },
            { Header: "Unit", accessor: "unitType", type: "unitConvert", width: '300px', required: true },
            AuditStatusDDL,         
            { Header: "Remark", accessor: "remark", type: "input", width: '300px' },
            { Header: "Carton No.", accessor: "cartonNo", type: "input", width: '300px' },
            ProDate,
            Expire
            
        ];

        setcolumSKU(columnEdit)
    }, [skuType, ProcessTypeCode])

    const AuditStatus = [
        { label: 'QQQ', value: '5' },
        { label: 'QUARANTINE', value: '0' },
        { label: 'PASSED', value: '1' },
        //{ label: 'REJECTED', value: '2' },
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
        { Header: "Code", accessor: "Code", fixed: "left", width: 110, sortable: true },
        { Header: "Name", accessor: "Name", width: 250, sortable: true },
    ];


    const columns = [
        { Header: "Item Code", accessor: "Code" },
        { Header: "Item Name", accessor: "Name", width: 200 },
        { Header: "Control No.", accessor: "orderNo" },
        { Header: "Lot", accessor: "lot" },
        { Header: "Vendor Lot", accessor: "ref1" },
        { Header: "Quantity", accessor: "quantity" },
        { Header: "Unit", accessor: "unitType" },  
        {
            Header: "Quality Status", accessor: "auditStatus",
            Cell: e => getAuditStatus(e.original)
        },
        { Header: "Remark", accessor: "remark" },
        { Header: "Carton No.", accessor: "cartonNo" },
        {
            Header: "MFG.Date", accessor: "productionDate",
            Cell: e => getFormatDatePro(e.original), widthPDF: 15,
            CellPDF: e => getFormatDatePro(e.original)
        },
        {
            Header: "Expire Date", accessor: "expireDate",
            Cell: e => getFormatDateExp(e.original), widthPDF: 15,
            CellPDF: e => getFormatDateExp(e.original)
        }
    ];

    const getFormatDatePro = (e) => {
        if (e.productionDate)
        return moment(e.productionDate).format("DD/MM/YYYY");
    }

    const getFormatDateExp = (e) => {
        if (e.expireDate)
        return moment(e.expireDate).format("DD/MM/YYYY");
    }

    const getAuditStatus = (e) => {
        console.log(e)
        if (e.auditStatus) {
            if (e.auditStatus === '0' ) {
                return "QUARANTINE"
            } else if (e.auditStatus === '1' ) {
                return "PASSED"
            } else if (e.auditStatus=== '2' ) {
                return "REJECTED"
            } else if (e.auditStatus === '9') {
                return "HOLD"
            }
        }
    }

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
