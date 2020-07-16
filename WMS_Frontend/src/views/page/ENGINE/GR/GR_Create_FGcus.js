import React, { useState, useEffect } from "react";

import AmCreateDocument from "../../../../components/AmCreateDocumentNew";
import queryString from "query-string";
import {
    apicall,
    createQueryString
} from "../../../../components/function/CoreFunction";

const Axios = new apicall();

const RD_Create_FGCustomer = props => {
    const [dataWarehouse, setDataWarehouse] = useState("");
    const [CodeprocessType, setCodeprocessType] = useState(0);
    const [table, setTable] = useState(null);
    const [HeaderDoc, setHeaderDoc] = useState([]);


    useEffect(() => {
        if (CodeprocessType !== "" && CodeprocessType !== null) {
            var CodeprocessTypeStr = CodeprocessType.toString();
            var ProcessTypeID = CodeprocessTypeStr.substring(3)
            var DataprocessTypeID = {};
            if (ProcessTypeID === '') {
                DataprocessTypeID = { label: "Source Warehouse", type: "dropdown", key: "", queryApi: WarehouseQuery, fieldLabel: ["Code", "Name"], defaultValue: 1, codeTranslate: "Source Warehouse" }
            } else if (ProcessTypeID === '1') {
                DataprocessTypeID = { label: "Source Warehouse", type: "dropdown", key: "souWarehouseID", queryApi: WarehouseQuery, fieldLabel: ["Code", "Name"], defaultValue: 1, codeTranslate: "Source Warehouse" }
            } else if (ProcessTypeID === '2') {
                DataprocessTypeID = { label: "Source Customer", type: "dropdown", key: "souCustomerID", queryApi: CustomerQuery, fieldLabel: ["Code", "Name"], defaultValue: 1, codeTranslate: "Source Customer" }
            } else if (ProcessTypeID === '3') {
                DataprocessTypeID = { label: "Source Supplier", type: "dropdown", key: "souSupplierID", queryApi: SupplierQuery, fieldLabel: ["Code", "Name"], defaultValue: 1311, codeTranslate: "Source Supplier" }
            } else {
               // DataprocessTypeID = { label: "Source Warehouse", type: "dropdown", key: "souWarehouseID", queryApi: WarehouseQuery, fieldLabel: ["Code", "Name"], defaultValue: 1, codeTranslate: "Source Warehouse" }
            }


            var headerCreate = [
                [
                    { label: "Document No.", type: "labeltext", key: "", texts: "-", codeTranslate: "Document No." },
                    { label: "Document Date", type: "date", key: "documentDate", codeTranslate: "Document Date" }
                ],
                [
                    { label: "Process Type", type: "dropdown", key: "documentProcessTypeID", queryApi: DocumentProcessTypeQuery, fieldLabel: ["Code", "Name"], defaultValue: 1010, codeTranslate: "Process Type" },
                    { label: "Action Time", type: "dateTime", key: "actionTime", codeTranslate: "Action Time" }
                ],
                [
                    DataprocessTypeID,
                    { label: "Des Warehouse", type: "dropdown", key: "desWarehouseID", queryApi: WarehouseQuery, fieldLabel: ["Code", "Name"], defaultValue: 1, codeTranslate: "Des Warehouse" }
                ],
                [
                    { label: "For Customer", type: "dropdown", key: "forCustomerID", queryApi: CustomerQuery, fieldLabel: ["Code", "Name"], defaultValue: 1, codeTranslate: "For Customer" },
                    { label: "Doc Status", type: "labeltext", key: "", texts: "NEW", codeTranslate: "Doc Status" },
                ],
                [

                    { label: "Remarkss", type: "input", key: "remark", codeTranslate: "Remark" }
                ]

            ];

            setHeaderDoc(headerCreate)


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
                    columns={columns}
                    columnEdit={columnEdit}
                    apicreate={apicreate}
                    createDocType={"receiveOrder"}
                    history={props.history}
                    apiRes={apiRes}
                />
            );
        }


    }, [HeaderDoc, CodeprocessType])

    const SKUMaster = {
        queryString: window.apipath + "/v2/SelectDataViwAPI/",
        t: "SKUMaster",
        q: '[{ "f": "Status", "c":"<", "v": 2},{ "f": "SKUMasterType_ID", "c":"!=", "v": 50}]',
        f: "ID as skuID,Code as skuCode,Name as skuName,UnitTypeCode as unitType,concat(Code, ' : ' ,Name) as SKUItems",
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



    const DocumentProcessTypeQuery = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "DocumentProcessType",
        q: '[{ "f": "Status", "c":"<", "v": 2}]',
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
        { Header: "Unit", accessor: "unitType", width: 50 }
    ];

    const columnEdit = [
        { Header: "Order No.", accessor: "orderNo", type: "input" },
        {
            // search: false,
            Header: "SKU Item",
            accessor: "skuCode",
            type: "findPopUp",
            queryApi: SKUMaster,
            fieldLabel: ["skuCode", "skuName"],
            columsddl: columsFindPopupSKU,
            related: ["unitType", "skuName", "SKUItems"],
            fieldDataKey: "Code", // ref กับ accessor
            defaultValue: "PJAAN04-0024",
            required: true
        },
        { Header: "Quantity", accessor: "quantity", type: "inputNum", required: true },
        { Header: "Unit", accessor: "unitType", type: "text" }
    ];

    const columns = [
        // { id: "row", Cell: row => row.index + 1, width: 35 },
        { Header: "Order No.", accessor: "orderNo", width: 100 },
        { Header: "Item Code", accessor: "SKUItems" },
        { Header: "Qty", accessor: "quantity", width: 110 },
        { Header: "Unit", accessor: "unitType", width: 90 }
    ];

    const apicreate = "/v2/CreateDRDocAPI/"; //API สร้าง Doc
    const apiRes = "/receive/detail?docID="; //path หน้ารายละเอียด ตอนนี้ยังไม่เปิด

    return <div>
        {table}</div>;
};

export default RD_Create_FGCustomer;
