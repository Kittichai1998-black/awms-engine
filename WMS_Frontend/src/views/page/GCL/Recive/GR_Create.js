import React, { useState, useEffect } from "react";

import AmCreateDocument from "../../../../components/AmCreateDocumentNew";
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


const GR_Create = props => {
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
                    { label: "Grade", type: "input", key: "ref1", codeTranslate: "Grade", width: '300px' },
                    { label: "Doc.WMS", type: "input", key: "ref2", codeTranslate: "Doc.WMS", width: '300px' }
                ],
                [
                    { label: "Customer", type: "dropdown", key: "forCustomerID", queryApi: CustomerQuery, fieldLabel: ["Code", "Name"], defaultValue: 1, codeTranslate: "Source Customer" },
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

        Headers = { Header: "Lot", accessor: "lot", type: "input", width: '300px', required: true }
        // Control = { Header: "Control No.", accessor: "orderNo", type: "input", width: '300px' }
        // ProDate = { Header: "MFG.Date", accessor: "productionDate", type: "date", width: '300px', required: true }
        // Expire = { Header: "Expire Date", accessor: "expireDate", type: "date", width: '300px', required: true }

        AuditStatusDDL = { Header: "Quality Status", accessor: "auditStatus", type: "dropdownvalue", data: AuditStatus, key: "value", defaultValue: '0' }


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
            Headers,
            { Header: "Quantity", accessor: "quantity", type: "inputNum", required: true, width: '300px' },
            { Header: "Unit", accessor: "unitType", type: "unitConvert", width: '300px', required: true },
            { Header: "Quantity/Pallet", accessor: "options", type: "input", width: '300px' },
            { Header: "Start Pallet", accessor: "options", type: "input", width: '300px' },
            { Header: "End Pallet", accessor: "options", type: "input", width: '300px' },
            AuditStatusDDL,
            { Header: "Remark", accessor: "remark", type: "input", width: '300px' },



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
        { Header: "Lot", accessor: "lot" },
        { Header: "Quantity", accessor: "quantity" },
        { Header: "Unit", accessor: "unitType" },
        {
            Header: "Quality Status", accessor: "auditStatus",
            Cell: e => getAuditStatus(e.original)
        },
        { Header: "Quantity/Pallet", accessor: "options" },
        { Header: "Start Pallet", accessor: "options" },
        { Header: "End Pallet", accessor: "options" },
        { Header: "Remark", accessor: "remark" },
    ];

    const getAuditStatus = (e) => {
        if (e.auditStatus) {
            if (e.auditStatus === '0') {
                return "QUARANTINE"
            } else if (e.auditStatus === '1') {
                return "PASSED"
            } else if (e.auditStatus === '2') {
                return "REJECTED"
            } else if (e.auditStatus === '9') {
                return "HOLD"
            }
        }
    }

    const apicreate = "/v2/CreateDRDocAPI/"; //API สร้าง Doc
    const apiRes = "/receive/detail?docID="; //path หน้ารายละเอียด ตอนนี้ยังไม่เปิด

    return <>
        <div>
            {table}</div>
    </>;
};

export default GR_Create;
