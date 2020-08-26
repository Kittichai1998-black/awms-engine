import React, { useState, useEffect } from "react";

import AmCreateDocument from "../../../../components/AmCreateDocumentNew";
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


const GI_Create_FGCustomer = props => {
    const [CodeprocessType, setCodeprocessType] = useState(1);
    const [table, setTable] = useState(null);
    const [HeaderDoc, setHeaderDoc] = useState([]);
    const [skuType, setskuType] = useState(4);
    const [columSKU, setcolumSKU] = useState();
    const [skuquery, setskuquery] = useState(SKUMaster);
    const [addlistquery, setaddlistquery] = useState(view_sto);
    const [Type, setType] = useState(true);
    const [addlist, setaddlist] = useState({})


    useEffect(() => {
        
        
        if (CodeprocessType !== "" && CodeprocessType !== null) {    
            var DataprocessTypeID;
            var defaulProcessType = 1010
            if (CodeprocessType === 1) {
                DataprocessTypeID = [
                    { label: "Source Warehouse", type: "dropdown", key: "souWarehouseID", queryApi: WarehouseQuery, fieldLabel: ["Code", "Name"], defaultValue: 1, codeTranslate: "Source Warehouse" },
                    { label: "Des Warehouse", type: "dropdown", key: "desWarehouseID", queryApi: WarehouseQuery, fieldLabel: ["Code", "Name"], defaultValue: 1, codeTranslate: "Des Warehouse" }
                ]
            } else if (CodeprocessType === 2) {
                
                 DataprocessTypeID =[ { label: "Source Customer", type: "dropdown", key: "souCustomerID", queryApi: CustomerQuery, fieldLabel: ["Code", "Name"], defaultValue: 1, codeTranslate: "Source Customer" },
                     { label: "Des Customer", type: "dropdown", key: "desCustomerID", queryApi: CustomerQuery, fieldLabel: ["Code", "Name"], defaultValue: 1, codeTranslate: "Des Customer" }
                   ]
            } else if (CodeprocessType === 3) {
                DataprocessTypeID = [
                    { label: "Source Supplier", type: "dropdown", key: "souSupplierID", queryApi: SupplierQuery, fieldLabel: ["Code", "Name"], defaultValue: 1311, codeTranslate: "Source Supplier" },
                    { label: "Des Supplier", type: "dropdown", key: "desSupplierID", queryApi: SupplierQuery, fieldLabel: ["Code", "Name"], defaultValue: 1311, codeTranslate: "Des Supplier" }]
            } else {
               // DataprocessTypeID = { label: "Source Warehouse", type: "dropdown", key: "souWarehouseID", queryApi: WarehouseQuery, fieldLabel: ["Code", "Name"], defaultValue: 1, codeTranslate: "Source Warehouse" }
            }


            var headerCreate = [
                [
                    { label: "Document No.", type: "labeltext", key: "", texts: "-", codeTranslate: "Document No." },
                    { label: "Document Date", type: "date", key: "documentDate", codeTranslate: "Document Date" }
                ],
                [
                    { label: "Process No.", type: "dropdown", key: "documentProcessTypeID", queryApi: DocumentProcessTypeQuery, fieldLabel: ["Code", "Name"], defaultValue: 4011, codeTranslate: "Process Type" },
                    { label: "Action Time", type: "dateTime", key: "actionTime", codeTranslate: "Action Time" }
                ],
                
                    DataprocessTypeID,
                  
                
                [
                    { label: "For Customer", type: "dropdown", key: "forCustomerID", queryApi: CustomerQuery, fieldLabel: ["Code", "Name"], defaultValue: 1, codeTranslate: "For Customer" },
                    { label: "Doc Status", type: "labeltext", key: "", texts: "NEW", codeTranslate: "Doc Status" },
                ],
                [

                    { label: "Remarkss", type: "input", key: "remark", codeTranslate: "Remark" }
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
     

    }, [HeaderDoc, skuquery, addlist])


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

        if (skuType === 5 && CodeprocessType === 3) {
            Headers = { Header: "Vendor Lot", accessor: "ref1", type: "input", required: true }
        } else {
            Headers = { Header: "Vendor Lot", accessor: "", type: "text", texts: "-" }
        }

        if (skuType === 5 && CodeprocessType === 1) {
            AuditStatusDDL = { Header: "Audit Status", accessor: "auditStatus", type: "dropdownvalue", data: AuditStatus, key: "label", defaultValue: 0, disabled: true }
        } else {
            AuditStatusDDL = { Header: "Status", accessor: "auditStatus", type: "dropdownvalue", data: AuditStatus, key: "label", defaultValue: 1 }
        }

        var columnEdit = [
            { Header: "Item No.", accessor: "itemNo", type: "input"},
            {
                // search: false,
                Header: "Item",
                accessor: "skuCode",
                type: "findPopUp",
                queryApi: skuquery,
                fieldLabel: ["skuCode", "skuName"],
                columsddl: columsFindPopupSKU,
                related: ["skuName", "SKUItems"],
                fieldDataKey: "Code", // ref กับ accessor
                //defaultValue: "PJAAN04-0024",
                required: true
            },
            { Header: "OrderNo", accessor: "orderNo", type: "input" },
            { Header: "Batch", accessor: "batch", type: "input" },
            { Header: "Lot", accessor: "lot", type: "input" },
            { Header: "Quantity", accessor: "quantity", type: "inputNum", required: true },
            { Header: "Unit", accessor: "unitType", type: "dropdown", key: "Code", queryApi: UnitTypeQuery, fieldLabel: ["Code"], defaultValue: "ขวด" },
            AuditStatusDDL,
            Headers,
            { Header: "Ref2", accessor: "ref2", type: "input" },
            { Header: "Ref3", accessor: "ref3", type: "input" },
            { Header: "Ref4", accessor: "ref4", type: "input" },
            { Header: "CartonNo", accessor: "cartonNo", type: "input" },
            { Header: "IncubationDay", accessor: "incubationDay", type: "inputNum" },
            { Header: "ProductDate", accessor: "productionDate", type: "date" },
            { Header: "ExpireDate", accessor: "expireDate", type: "date" },
            { Header: "ShelfLifeDay", accessor: "shelfLifeDay", type: "inputNum" }
        ];


        setcolumSKU(columnEdit)
        //setType(false)

        //setskuquery()
    }, [skuType])


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
        q: '[{ "f": "Status", "c":"<", "v": 2},{ "f": "DocumentType_ID", "c":"=", "v": 1012}]',
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
        { Header: "Order No.", accessor: "orderNo", width: 100, style: { textAlign: "center" } },
        { Header: "Pallet", accessor: "palletcode", width: 110, style: { textAlign: "center" } },
        { Header: "Item Code", accessor: "SKUItems", width: 350 },
        { Header: "Location", accessor: "locationCode", width: 90, style: { textAlign: "center" } },
        { Header: "Qty", accessor: "quantity", width: 90 },
        { Header: "Unit", accessor: "unitType", width: 70 },
        { Header: "Audit Status", accessor: "auditStatus" },
        { Header: "Vendor Lot", accessor: "ref1" },
        { Header: "Ref2", accessor: "ref2" },
        { Header: "Ref3", accessor: "ref3" },
        { Header: "Ref4", accessor: "ref4" },
        { Header: "CartonNo", accessor: "cartonNo" },
        { Header: "IncubationDay", accessor: "incubationDay" },
        { Header: "ProductDate", accessor: "productionDate" },
        { Header: "ExpireDate", accessor: "expireDate" },
        { Header: "ShelfLifeDay", accessor: "shelfLifeDay" }
    
    ];

  
    const columns = [
        // { id: "row", Cell: row => row.index + 1, width: 35 },
        { Header: "Item No.", accessor: "itemNo" },
        { Header: "Item", accessor: "SKUItems" },
        { Header: "OrderNo", accessor: "orderNo" },
        { Header: "Batch", accessor: "batch" },
        { Header: "Lot", accessor: "lot" },
        { Header: "Quantity", accessor: "quantity" },
        { Header: "Unit", accessor: "unitType" },
        { Header: "Audit Status", accessor: "auditStatus" },
        { Header: "Vendor Lot", accessor: "ref1" },
        { Header: "Ref2", accessor: "ref2" },
        { Header: "Ref3", accessor: "ref3" },
        { Header: "Ref4", accessor: "ref4" },
        { Header: "CartonNo", accessor: "cartonNo" },
        { Header: "IncubationDay", accessor: "incubationDay" },
        { Header: "ProductDate", accessor: "productionDate" },
        { Header: "ExpireDate", accessor: "expireDate" },
        { Header: "ShelfLifeDay", accessor: "shelfLifeDay" }
    ];

    const apicreate = "/v2/CreateDIDocAPI/"; //API สร้าง Doc
    const apiRes = "/issue/detail?docID="; //path หน้ารายละเอียด ตอนนี้ยังไม่เปิด

    return <div>
        {table}</div>;
};

export default GI_Create_FGCustomer;
