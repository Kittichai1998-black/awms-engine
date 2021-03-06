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

const view_sto = {
    queryString: window.apipath + "/v2/SelectDataViwAPI/",
    t: "PackStorageObject",
    q: '[{ "f": "Status", "c":"<", "v": 2}]',
    f: "*",
    g: "",
    s: "[{'f':'packID','od':'ASC'}]",
    sk: 0,
    l: 100,
    all: ""
};


const AD_Create = props => {
    const [CodeprocessType, setCodeprocessType] = useState(1);
    const [table, setTable] = useState(null);
    const [HeaderDoc, setHeaderDoc] = useState([]);
    const [skuType, setskuType] = useState(4);
    const [columSKU, setcolumSKU] = useState();
    const [skuquery, setskuquery] = useState(SKUMaster);
    const [addlistquery, setaddlistquery] = useState(view_sto);
    const [Type, setType] = useState(true);
    const [ProcessTypeCode, setProcessTypeCode] = useState();
    const [addlist, setaddlist] = useState({})
    const [defaulacts, setdefaulacts] = useState();


    useEffect(() => {


        if (CodeprocessType !== "" && CodeprocessType !== null) {
            var DataprocessTypeID;
            var defaulProcessType = 1010
            var actDate;

            if (ProcessTypeCode === '4181' || ProcessTypeCode === '5181') {
                setdefaulacts(false)
                actDate = { label: "Action Time", type: "dateTimeFalse", key: "actionTime", codeTranslate: "Action Time" }
            } else {
                setdefaulacts(true)
                actDate = { label: "Action Time", type: "dateTime", key: "actionTime", codeTranslate: "Action Time" }

            }

            if (CodeprocessType === 1) {
                DataprocessTypeID = [
                    { label: "Sou. Warehouse", type: "dropdown", key: "souWarehouseID", queryApi: WarehouseQuery, fieldLabel: ["Code", "Name"], defaultValue: 1, codeTranslate: "Source Warehouse" },
                    { label: "Des. Warehouse", type: "dropdown", key: "desWarehouseID", queryApi: WarehouseQuery, fieldLabel: ["Code", "Name"], defaultValue: 1, codeTranslate: "Des Warehouse" }
                ]
            } else if (CodeprocessType === 2) {

                DataprocessTypeID = [{ label: "Sou. Customer", type: "dropdown", key: "souCustomerID", queryApi: CustomerQuery, fieldLabel: ["Code", "Name"], defaultValue: 1, codeTranslate: "Source Customer" },
                { label: "Des. Customer", type: "dropdown", key: "desCustomerID", queryApi: CustomerQuery, fieldLabel: ["Code", "Name"], defaultValue: 1, codeTranslate: "Des Customer" }
                ]
            } else if (CodeprocessType === 3) {
                DataprocessTypeID = [
                    { label: "Sou. Supplier", type: "dropdown", key: "souSupplierID", queryApi: SupplierQuery, fieldLabel: ["Code", "Name"], defaultValue: 1311, codeTranslate: "Source Supplier" },
                    { label: "Des. Supplier", type: "dropdown", key: "desSupplierID", queryApi: SupplierQuery, fieldLabel: ["Code", "Name"], defaultValue: 1311, codeTranslate: "Des Supplier" }]
            } else {
                // DataprocessTypeID = { label: "Source Warehouse", type: "dropdown", key: "souWarehouseID", queryApi: WarehouseQuery, fieldLabel: ["Code", "Name"], defaultValue: 1, codeTranslate: "Source Warehouse" }
            }


            var headerCreate = [
                [
                    { label: "Doc No.", type: "labeltext", key: "", texts: "-", codeTranslate: "Document No." },
                    { label: "Doc Date", type: "date", key: "documentDate", codeTranslate: "Document Date" }
                ],
                [
                    { label: "Process No.", type: "dropdown", key: "documentProcessTypeID", queryApi: DocumentProcessTypeQuery, fieldLabel: ["Code", "ReProcessType_Name"], defaultValue: 4041, codeTranslate: "Process Type" },
                    actDate
                ],

                DataprocessTypeID,



                [
                    // { label: "For Customer", type: "dropdown", key: "forCustomerID", queryApi: CustomerQuery, fieldLabel: ["Code", "Name"], defaultValue: 1, codeTranslate: "For Customer" },
                    { label: "Doc Status", type: "labeltext", key: "", texts: "NEW", codeTranslate: "Doc Status" },
                    { label: "Remark", type: "input", key: "remark", codeTranslate: "Remark" }
                ]

            ];

            setHeaderDoc(headerCreate)
            setskuquery();
            setaddlistquery();
            setType(true)

        } else {

        }
    }, [CodeprocessType, ProcessTypeCode]);

    useEffect(() => {
        if (HeaderDoc.length > 0) {

            setTable(
                <AmCreateDocument
                    addList={addlist}
                    headerCreate={HeaderDoc}
                    onChangeProcessType={((e) => { setCodeprocessType(e) })}
                    onChangeProcesTypeSKU={((e) => { setskuType(e) })}
                    onChangeProcessTypeCode={((e) => { setProcessTypeCode(e) })}
                    columns={columns}
                    columnEdit={columSKU}
                    apicreate={apicreate}
                    createDocType={"counting"}
                    history={props.history}
                    defaulact={defaulacts}
                    //itemNo={true}
                    //defualItemNo={'0001'}
                    apiRes={apiRes}
                />
            );
        }


    }, [HeaderDoc, CodeprocessType, columSKU, addlist])


    useEffect(() => {
        let itemNos = '0001'
        if (SKUMaster) {
            let objQuery = SKUMaster;
            if (objQuery !== null && Type === true && skuType !== undefined) {
                let skuqrys = JSON.parse(objQuery.q);
                skuqrys = [{ "f": "Status", "c": "<", "v": 2 }]
                objQuery.q = JSON.stringify(skuqrys);
            }

            setskuquery(objQuery)
        }
        let Headers;
        let AuditStatusDDL;

        if (skuType === 5) {
            Headers = { Header: "Vendor Lot", accessor: "ref1", type: "input", required: true, width: '300px' }
        } else {
            Headers = { Header: "Lot", accessor: "lot", type: "input", width: '300px', required: true }
        }

        if (ProcessTypeCode === '4081' || ProcessTypeCode === '4141' || ProcessTypeCode === '4151' ||
            ProcessTypeCode === '5011' || ProcessTypeCode === '5141' || ProcessTypeCode === '5151') {
            AuditStatusDDL = { Header: "Quality Status", accessor: "auditStatus", type: "dropdownvalue", data: AuditStatus, key: "value", defaultValue: '1', disabled: true }
        } else {
            AuditStatusDDL = { Header: "Quality Status", accessor: "auditStatus", type: "dropdownvalue", data: AuditStatus, key: "value", defaultValue: '0' }
        }

        var columnEdit = [
            //{ Header: "Item No.", accessor: "itemNo", type: "input"},
            {
                // search: false,
                Header: "Item Code",
                accessor: "skuCode",
                type: "findPopUp",
                queryApi: skuquery,
                fieldLabel: ["skuCode"],
                columsddl: columsFindPopupSKU,
                related: ["skuName", "SKUItems"],
                fieldDataKey: "Code", // ref ????????? accessor
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
                related: ["skuCode", "SKUItems"],
                fieldDataKey: "Name", // ref ????????? accessor
                //defaultValue: "PJAAN04-0024",
                required: true
            },
            { Header: "Control No.", accessor: "orderNo", type: "input", width: '300px' },
            //{ Header: "Batch", accessor: "batch", type: "input" },
            //{ Header: "Lot", accessor: "lot", type: "input", width: '300px' },
            { Header: "Qty", accessor: "quantity", type: "inputNum", TextInputnum: "%", required: true },
            { Header: "Unit", accessor: "unitType", type: "unitConvert", required: true, width: '300px' },
            AuditStatusDDL,
            Headers,
            //{ Header: "Ref2", accessor: "ref2", type: "input" },
            //{ Header: "Ref2", accessor: "ref2", type: "input" },
            //{ Header: "Ref3", accessor: "ref3", type: "input" },
            //{ Header: "Ref4", accessor: "ref4", type: "input" },
            //{ Header: "Carton No.", accessor: "cartonNo", type: "input", width: '300px' },
            //{ Header: "Incubation Day", accessor: "incubationDay", type: "inputNum" },
            { Header: "MFG.DateDate", accessor: "productionDate", type: "date", required: true, width: '300px' },
            { Header: "Expire Date", accessor: "expireDate", type: "date", required: true },
            //{ Header: "ShelfLife Day", accessor: "shelfLifeDay", type: "inputNum" }
        ];
        setcolumSKU(columnEdit)
    }, [skuType, ProcessTypeCode])


    useEffect(() => {
        if (view_sto !== undefined) {
            let objQueryaddlist = view_sto;
            if (objQueryaddlist !== null && Type === true && skuType !== undefined) {
                let addqrys = JSON.parse(objQueryaddlist.q);
                addqrys = [{ "f": "Status", "c": "<", "v": 2 }, { 'f': 'SKUMasterType_ID', 'c': '=', 'v': skuType }]
                objQueryaddlist.q = JSON.stringify(addqrys);
            }

            setaddlistquery(objQueryaddlist)
        }


        var addLists = {
            queryApi: addlistquery,
            columns: columsFindPopupSto,
            primaryKeyTable: "packID",
            search: [
                { accessor: "palletcode", placeholder: "Pallet" },
                { accessor: "Code", placeholder: "Reorder (Item Code)" },
                { accessor: "LocationCode", placeholder: "Location" }
                // { accessor: "remark", placeholder: "Remark" }
            ]
        };

        setaddlist(addLists)

    }, [skuType])

    const AuditStatus = [
        { label: 'QUARANTINE', value: '0' },
        { label: 'PASSED', value: '1' },
        { label: 'REJECTED ', value: '2' },
        { label: 'HOLD', value: '9' },
    ];

    const UnitTypeQuery = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "UnitType",
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
        q: '[{ "f": "Status", "c":"=", "v": 1},{ "f": "DocumentType_ID", "c":"=", "v": 2004}]',
        f: "*",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: ""
    };

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



    const columsFindPopupSKU = [
        { Header: "Code", accessor: "skuCode", fixed: "left", width: 110, sortable: true },
        { Header: "Name", accessor: "skuName", width: 250, sortable: true },
    ];

    const columsFindPopupSto = [
        { Header: "Control No.", accessor: "orderNo", width: 100, style: { textAlign: "center" } },
        { Header: "Pallet", accessor: "palletcode", width: 110, style: { textAlign: "center" } },
        { Header: "Item Code", accessor: "SKUItems", width: 350 },
        { Header: "Location", accessor: "locationCode", width: 90, style: { textAlign: "center" } },
        { Header: "Qty", accessor: "quantity", width: 90 },
        { Header: "Unit", accessor: "unitType", width: 70 },
        { Header: "Quality Status", accessor: "auditStatus" },
        { Header: "Vendor Lot", accessor: "ref1" },
        { Header: "Remark", accessor: "remark" },
        //{ Header: "Ref3", accessor: "ref3" },
        //{ Header: "Ref4", accessor: "ref4" },
        //{ Header: "Carton No.", accessor: "cartonNo" },
        //{ Header: "Incubation Day", accessor: "incubationDay" },
        { Header: "MFG.Date", accessor: "productionDate" },
        { Header: "Expire Date", accessor: "expireDate" },
        //{ Header: "ShelfLife", accessor: "ShelfLifePercent" }

    ];


    const columns = [
        //{ id: "row", Cell: row => row.index + 1, width: 35 },
        { Header: "Item Code", accessor: "skuCode" },
        { Header: "Item Name", accessor: "skuName" },
        { Header: "Control No.", accessor: "orderNo" },
        //{ Header: "Batch", accessor: "batch" },
        { Header: "Lot", accessor: "lot" },
        { Header: "Qty", accessor: "quantity" },
        { Header: "Unit", accessor: "unitType" },
        { Header: "Quality Status", accessor: "auditStatus" },
        { Header: "Vendor Lot", accessor: "ref1" },
        { Header: "Remark", accessor: "remark" },
        //{ Header: "Ref2", accessor: "ref2" },
        //{ Header: "Ref3", accessor: "ref3" },
        //{ Header: "Ref4", accessor: "ref4" },
        //{ Header: "Carton No.", accessor: "cartonNo" },
        // { Header: "Incubation Day", accessor: "incubationDay" },
        { Header: "MFG.Date", accessor: "productionDate" },
        { Header: "Expire Date", accessor: "expireDate" },
        //{ Header: "ShelfLife (%)", accessor: "ShelfLifePercent" }
    ];

    const apicreate = "/v2/CreatePIDocAPI/"; //API ??????????????? Doc
    const apiRes = "/counting/detail?docID="; //path ?????????????????????????????????????????? ????????????????????????????????????????????????

    return <div>
        {table}</div>;
};

export default AD_Create;
