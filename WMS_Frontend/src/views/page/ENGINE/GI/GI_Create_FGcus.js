import React, { useState, useEffect } from "react";

import AmCreateDocument from "../../../../components/AmCreateDocumentNew";
import AmCreateDoc from '../../../.././components/AmImportDocumentExcel';
import Grid from '@material-ui/core/Grid';
import queryString from "query-string";
import {
    apicall,
    createQueryString
} from "../../../../components/function/CoreFunction";
import moment from "moment";
const Axios = new apicall();

const SKUMaster = {
    queryString: window.apipath + "/v2/SelectDataViwAPI/",
    t: "SKUMaster",
    q: '[{ "f": "Status", "c":"<", "v": 2}]',
    f: "*,ID as skuID",
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
    s: "[{'f':'expireDate','od':'ASC'}]",
    sk: 0,
    l: 100,
    all: ""
};


const GI_Create_FGCustomer = props => {
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



    useEffect(() => {


        if (CodeprocessType !== "" && CodeprocessType !== null) {
            var DataprocessTypeID;
            var defaulProcessType = 1010
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
                    { label: "Process No.", type: "dropdown", key: "documentProcessTypeID", queryApi: DocumentProcessTypeQuery, fieldLabel: ["Code", "ReProcessType_Name"], defaultValue: 4061, codeTranslate: "Process Type" },
                    { label: "Action Time", type: "dateTime", key: "actionTime", codeTranslate: "Action Time" }
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
    }, [CodeprocessType]);

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
                    createDocType={"issue"}
                    history={props.history}
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
                skuqrys = [{ "f": "Status", "c": "<", "v": 2 }, { 'f': 'SKUMasterType_ID', 'c': '=', 'v': skuType }]
                objQuery.q = JSON.stringify(skuqrys);
            }

            setskuquery(objQuery)
        }
        let Headers;
        let AuditStatusDDL;

        if (skuType === 5) {
            Headers = { Header: "Vendor Lot", accessor: "ref1", type: "input",  width: '300px' }
        } else {
            Headers = { Header: "Lot", accessor: "lot", type: "input", width: '300px' }
        }

        if (ProcessTypeCode === '4081' ||
            ProcessTypeCode === '4041' ||
            ProcessTypeCode === '4151' ||
            ProcessTypeCode === '5011' ||
            ProcessTypeCode === '5141' ||
            ProcessTypeCode === '5151' 
            ) {
            AuditStatusDDL = { Header: "Quality Status", accessor: "auditStatus", type: "dropdownvalue", data: AuditStatus, key: "value", defaultValue: '1', disabled: true }
        } else {
            AuditStatusDDL = { Header: "Quality Status", accessor: "auditStatus", type: "dropdownvalue", data: AuditStatus, key: "value", defaultValue: '0' }
        }
        var columnEdit = [
            {
                Header: "Item Code",
                accessor: "Code",
                type: "findPopUp",
                queryApi: skuquery,
                fieldLabel: ["Code"],
                columsddl: columsFindPopupSKU,
                related: ["Name"],
                fieldDataKey: "Code", 
                required: true
            },
            {
                Header: "Item Name",
                accessor: "Name",
                type: "text",
                //queryApi: skuquery,
                //fieldLabel: ["Name"],
                //columsddl: columsFindPopupSKU,
                //related: ["Code"],
                //fieldDataKey: "Name", 
                //required: true
            },
            { Header: "Control No.", accessor: "orderNo", type: "input", width: '300px' },
            Headers,
            { Header: "Quantity", accessor: "quantity", type: "inputNum", required: true, width: '300px' },
            { Header: "Unit", accessor: "unitType", type: "unitConvert", width: '300px', required: true },
            AuditStatusDDL,
            { Header: "Remark", accessor: "remark", type: "input", width: '300px' },
            //{ Header: "MFG.Date", accessor: "productionDate", type: "date", width: '300px', required: true },
            //{ Header: "Expire Date", accessor: "expireDate", type: "date", width: '300px', required: true },
        ];
        setcolumSKU(columnEdit)
    }, [skuType, ProcessTypeCode])


    useEffect(() => {
        let Querys;
        if (ProcessTypeCode === '4081' ||
            ProcessTypeCode === '4041' ||
            ProcessTypeCode === '4151' ||
            ProcessTypeCode === '5011' ||
            ProcessTypeCode === '5141' ||
            ProcessTypeCode === '5151' ) {
            Querys = [
                { "f": "Status", "c": "<", "v": 2 },
                { 'f': 'SKUMasterType_ID', 'c': '=', 'v': skuType },
                { 'f': 'IsStock', 'c': '=', 'v': 1 },
                { 'f': 'AuditStatus', 'c': '=', 'v': 1 }]
        } else {
            Querys = [{ "f": "Status", "c": "<", "v": 2 },
                { 'f': 'SKUMasterType_ID', 'c': '=', 'v': skuType },
                { 'f': 'IsStock', 'c': '=', 'v': 1}
            ]
        }

        if (view_sto !== undefined) {
            let objQueryaddlist = view_sto;
            if (objQueryaddlist !== null && Type === true && skuType !== undefined) {
                let addqrys = JSON.parse(objQueryaddlist.q);
                addqrys = Querys
                objQueryaddlist.q = JSON.stringify(addqrys);
            }

            setaddlistquery(objQueryaddlist)
        }

        var addLists = {
            queryApi: addlistquery,
            columns: columsFindPopupSto,
            primaryKeyTable: "packID",
        };

        setaddlist(addLists)

    }, [skuType, ProcessTypeCode])

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
        q: '[{ "f": "Status", "c":"=", "v": 1},{ "f": "DocumentType_ID", "c":"=", "v": 1012}]',
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
        { Header: "Code", accessor: "Code", fixed: "left", width: 110, sortable: true },
        { Header: "Name", accessor: "Name", width: 250, sortable: true },
    ];

    const columsFindPopupSto = [
        { Header: "Pallet", accessor: "palletcode", width: 110,  },
        { Header: "Item Code", accessor: "Code" },
        { Header: "Item Name", accessor: "Name"},
        { Header: "Control No.", accessor: "orderNo", width: 100,  },
        { Header: "Lot", accessor: "lot" },
        { Header: "Vendor Lot", accessor: "ref1" },
        { Header: "Location", accessor: "locationCode", width: 9},
        { Header: "Qty", accessor: "quantity", width: 90 },
        { Header: "Unit", accessor: "unitType", width: 70 },
        { Header: "Quality Status", accessor: "auditStatus", Cell: e => getAuditStatus(e.original)},
        { Header: "Remark", accessor: "remark" },
        //{ Header: "Shelf life (%)", accessor: "ShelfLifePercent" },
        { Header: "MFG.Date", accessor: "productionDate", Cell: e => getFormatDatePro(e.original)},
        { Header: "Expire Date", accessor: "expireDate", Cell: e => getFormatDateExp(e.original)},

    ];


    const columns = [
        { Header: "Pallet", accessor: "palletcode", width: 110, },
        { Header: "Item Code", accessor: "Code" },
        { Header: "Item Name", accessor: "Name" },
        { Header: "Control No.", accessor: "orderNo" },
        { Header: "Lot", accessor: "lot" },
        { Header: "Vendor Lot", accessor: "ref1" },
        { Header: "Qty", accessor: "quantity" },
        { Header: "Unit", accessor: "unitType" },
        {
            Header: "Quality Status", accessor: "auditStatus",
            Cell: e => getAuditStatus(e.original)
        },
        { Header: "Remark", accessor: "remark" },
        //{
        //    Header: "Shelf life (%)", accessor: "ShelfLifePercent"
        //    //Cell: e => getShelfLifePercent(e.original), widthPDF: 15,
        //},
        {
            Header: "MFG.Date", accessor: "diProductionDate",
            Cell: e => getFormatDatePro(e.original), widthPDF: 15,
            CellPDF: e => getFormatDatePro(e)
        },
        {
            Header: "Expire Date", accessor: "diExpireDate",
            Cell: e => getFormatDateExp(e.original), widthPDF: 15,
            CellPDF: e => getFormatDateExp(e)
        }
    ];

    const getFormatDatePro = (e) => {
        if (e.productionDates) {
            return moment(e.productionDates).format("DD/MM/YYYY");
        }
       
    }

    const getFormatDateExp = (e) => {
        if (e.expireDates) {
            return moment(e.expireDates).format("DD/MM/YYYY");
        }
      
    }

    const getAuditStatus = (e) => {
        if (e.auditStatus ) {
            if (e.auditStatus === '0' ) {
                return "QUARANTINE"
            } else if (e.auditStatus === '1' ) {
                return "PASSED"
            } else if (e.auditStatus === '2' ) {
                return "REJECTED"
            } else if (e.auditStatus === '9' ) {
                return "HOLD"
            }
        }
    }
    const apicreate = "/v2/CreateDIDocAPI/"; //API สร้าง Doc
    const apiRes = "/issue/detail?docID="; //path หน้ารายละเอียด ตอนนี้ยังไม่เปิด

    return <div>
        <Grid container>
            <Grid item xs container direction="column">
            </Grid>
            <Grid item>
                <AmCreateDoc
                    apicreate={"/v2/CreateDIDocAPI/"}
                    apiRes={"/issue/detail?docID="}
                    history={props.history}
                    docTypename={"issue"}
                ></AmCreateDoc>
            </Grid>
        </Grid>
        {table}</div>;
};

export default GI_Create_FGCustomer;
