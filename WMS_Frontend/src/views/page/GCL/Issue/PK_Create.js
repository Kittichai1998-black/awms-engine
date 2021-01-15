import React, { useState, useEffect } from "react";

import AmputAndpick from "../../../pageComponent/AmCreateDocPutandPick/AmputAndpick";
import queryString from "query-string";
import {
    apicall,
    createQueryString
} from "../../../../components/function/CoreFunction";

const Axios = new apicall();

const Create_GR_DR = props => {
    const [dataMovementTypeCUS, setDataMovementTypeCUS] = useState("");
    const [table, setTable] = useState(null);
    const [dataDocument, setdataDocument] = useState();


    useEffect(() => {
        var headerCreate = []
        if (dataDocument === undefined) {
            headerCreate = [

                [
                    { label: "Doc Delivery", type: "findPopUpDoc", key: "ID", queryApi: DocumentDR, fieldLabel: ["Code"], defaultValue: 1, codeTranslate: "Doc Delivery", cols: columsDoc },
                    { label: "Doc Date", type: "date", key: "documentDate", codeTranslate: "Document Date" }
                ],
                [
                    { label: "Process No.", type: "labeltext", key: "documentProcessTypeID", texts: "", valueTexts: "", codeTranslate: "Document ProcessType" },
                    { label: "Action Time", type: "dateTime", key: "actionTime", codeTranslate: "Action Time" }
                ],
                [
                    { label: "Grade", type: "input", key: "ref1", codeTranslate: "Grade", width: '300px' },
                    { label: "Doc.WMS", type: "input", key: "ref2", codeTranslate: "Doc.WMS", width: '300px' }
                ],
                [
                    { label: "Customer", type: "labeltext", key: "forCustomerID", valueTexts: "", codeTranslate: "Customer" },
                    { label: "", type: "", key: "", codeTranslate: "", width: '300px' },
                ],
                [
                    { label: "Des. Area", type: "labeltext", key: "desAreaMasterID", valueTexts: "", codeTranslate: "Des. Area" },
                    { label: "Des. Warehouse", type: "labeltext", key: "desWarehouseID", valueTexts: "", codeTranslate: "Des Warehouse" }
                ],
                [

                    { label: "Doc Status", type: "labeltext", key: "", texts: "NEW", codeTranslate: "Doc Status" },
                    { label: "Remark", type: "input", key: "remark", codeTranslate: "Remark" }
                ]

            ];

        } else {
            let DocumentProcessTypeName = dataDocument.DocumentProcessTypeName
            let DocumentProcessType_ID = dataDocument.DocumentProcessType_ID
            let SouCustomerName = dataDocument.SouCustomerName
            let Sou_Customer_ID = dataDocument.Sou_Customer_ID
            let DesCustomerName = dataDocument.DesCustomerName
            let Des_Customer_ID = dataDocument.Des_Customer_ID
            let SouWarehouseName = dataDocument.SouWarehouseName
            let Sou_Warehouse_ID = dataDocument.Sou_Warehouse_ID
            let DesWarehouseName = dataDocument.DesWarehouseName
            let Des_Warehouse_ID = dataDocument.Des_Warehouse_ID
            let SouSupplierName = dataDocument.SouSupplierName
            let Sou_Supplier_ID = dataDocument.Sou_Supplier_ID
            let DesSupplierName = dataDocument.DesSupplierName
            let Des_Supplier_ID = dataDocument.Des_Supplier_ID
            let ForCustomerName = dataDocument.ForCustomerName
            let For_Customer_ID = dataDocument.For_Customer_ID
            let Ref1 = dataDocument.Ref1
            let Ref2 = dataDocument.Ref2
            headerCreate = [

                [
                    { label: "Doc NO.", type: "findPopUpDoc", key: "ID", queryApi: DocumentDR, fieldLabel: ["Code"], defaultValue: 1, codeTranslate: "Doc Delivery", cols: columsDoc },
                    { label: "Doc Date", type: "date", key: "documentDate", codeTranslate: "Document Date" }
                ],
                [
                    { label: "Process No.", type: "labeltext", key: "documentProcessTypeID", texts: DocumentProcessTypeName, valueTexts: DocumentProcessType_ID, codeTranslate: "Process Type" },
                    { label: "Action Time", type: "dateTime", key: "actionTime", codeTranslate: "Action Time" }
                ],
                [
                    { label: "Grade", type: "input", key: "ref1", texts: Ref1, codeTranslate: "Grade" },
                    { label: "Doc.WMS", type: "input", key: "ref2", texts: Ref2, codeTranslate: "Doc.WMS" }
                ],
                [
                    { label: "Customer", type: "labeltext", key: "desAreaMasterID", texts: ForCustomerName, codeTranslate: "Customer" },
                    { label: "", type: "", key: "", texts: "", codeTranslate: "" }
                ],
                [
                    { label: "Des. Area", type: "labeltext", key: "forCustomerID", texts: ForCustomerName, codeTranslate: "Customer" },
                    { label: "Des. Warehouse", type: "labeltext", key: "desWarehouseID", texts: DesWarehouseName, codeTranslate: "Des. Warehouse" }
                ],
                [
                    { label: "For Customer", type: "labeltext", key: "forCustomerID", texts: ForCustomerName, valueTexts: For_Customer_ID, codeTranslate: "For Customer" },
                    { label: "Doc Status", type: "labeltext", key: "", texts: "NEW", codeTranslate: "Doc Status" },
                ],

                [
                    { label: "Remark", type: "input", key: "remark", codeTranslate: "Remark" }
                ]

            ];

        }


        if (headerCreate.length > 0) {
            setTable(
                <AmputAndpick
                    //addList={addList}
                    docheaderCreate={headerCreate}
                    doccolumns={columns}
                    doccolumnEdit={columnEdit}
                    docapicreate={apicreate}
                    doccreateDocType={"picking"}
                    doctypeDocNo={1012}
                    dochistory={props.history}
                    onChangeDoument={(e) => { setdataDocument(e) }}
                    docItemQuery={DocumentItem}
                    doccolumnEditItem={columnEditItem}
                    doccolumnEditItemSet={columnEditItemSet}
                    docapiRes={apiRes}
                />
            );
        }

    }, [dataDocument]);

    const columsDoc = [
        { Header: "Code", accessor: "Code" }
    ]

    const DocumentDR = {
        queryString: window.apipath + "/v2/SelectDataTrxAPI/",
        t: "Document",
        q: '[{ "f": "Status", "c":"<", "v": 2},{ "f": "DocumentType_ID", "c":"=", "v": 1012}]',
        f: "*",
        g: "",
        s: "[{'f':'ID','od':'desc'}]",
        sk: 0,
        l: 100,
        all: ""

    }

    const DocumentItem = {
        queryString: window.apipath + "/v2/SelectDataViwAPI/",
        t: "DocumentItem",
        q: '[{ "f": "Status", "c":"<", "v": 2}]',
        f: "*",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: ""

    }

    const columnEdit = [
        { Header: "Item Code", accessor: "SKUMaster_Code", codeTranslate: "Item Code", type: "text" },
        { Header: "Item Name", accessor: "SKUMaster_Name", codeTranslate: "Item Name", type: "text" },
        { Header: "Lot", accessor: "Lot", type: "text", codeTranslate: "Lot" },
        { Header: "Quantity", accessor: "Quantity", type: "inputNum", codeTranslate: "Qty" },
        { Header: "Unit", accessor: "UnitType_Code", type: "text", codeTranslate: "Unit" },
        { Header: "Quality Status", accessor: "AuditStatus", type: "text", codeTranslate: "AuditStatus" },
        { Header: "Remark", accessor: "Remark", type: "text", codeTranslate: "Remark" },
        // { Header: "MFG.Date", accessor: "ProductionDate", type: "text", codeTranslate: "ProductionDate" },
        // { Header: "Expire Date", accessor: "ExpireDate", type: "text", codeTranslate: "ExpireDate" },
        //{ Header: "ShelfLife Day", accessor: "ShelfLifeDay", type: "text", codeTranslate: "ShelfLifeDay" }
    ];


    const columnEditItem = [
        { Header: "Item Code", accessor: "SKUMaster_Code", codeTranslate: "Item Code", type: "text" },
        { Header: "Item Name", accessor: "SKUMaster_Name", codeTranslate: "Item Name", type: "text" },
        { Header: "Lot", accessor: "Lot", type: "text", codeTranslate: "Lot" },
        { Header: "Quantity", accessor: "Quantity", type: "inputNum", codeTranslate: "Qty" },
        { Header: "Unit", accessor: "UnitType_Code", type: "text", codeTranslate: "Unit" },
        { Header: "Quality Status", accessor: "AuditStatus", type: "text", codeTranslate: "AuditStatus" },
        { Header: "Remark", accessor: "Remark", type: "text", codeTranslate: "Remark" },
        // { Header: "MFG.Date", accessor: "ProductionDate", type: "text", codeTranslate: "ProductionDate" },
        // { Header: "Expire Date", accessor: "ExpireDate", type: "text", codeTranslate: "ExpireDate" },

    ];

    const columnEditItemSet = [
        { Header: "Pallet Code", accessor: "PalletCode", codeTranslate: "Item Code" },
        { Header: "Item Code", accessor: "SKUMaster_Code", codeTranslate: "Item Code" },
        { Header: "Item Name", accessor: "SKUMaster_Name", codeTranslate: "Item Name" },
        { Header: "Lot", accessor: "Lot", codeTranslate: "Lot" },
        //{ Header: "Item No.", accessor: "ItemNo", codeTranslate: "ItemNo" },
        //{ Header: "Quantity", accessor: "Quantity",codeTranslate: "Quantity" },
        //{ Header: "Unit", accessor: "UnitType_Code", codeTranslate: "Unit" }
    ];


    const columns = [
        { Header: "Item Code", accessor: "SKUMaster_Code", codeTranslate: "Item Code", type: "text" },
        { Header: "Item Name", accessor: "SKUMaster_Name", codeTranslate: "Item Name", type: "text" },
        { Header: "Lot", accessor: "Lot", type: "text", codeTranslate: "Lot" },
        { Header: "Quantity", accessor: "Quantity", type: "inputNum", codeTranslate: "Qty" },
        { Header: "Unit", accessor: "UnitType_Code", type: "text", codeTranslate: "Unit" },
        { Header: "Quality Status", accessor: "AuditStatus", type: "text", codeTranslate: "AuditStatus" },
        { Header: "Remark", accessor: "Remark", type: "text", codeTranslate: "Remark" },
        // { Header: "MFG.Date", accessor: "ProductionDate", type: "text", codeTranslate: "ProductionDate" },
        // { Header: "Expire Date", accessor: "ExpireDate", type: "text", codeTranslate: "ExpireDate" },

    ];

    const apicreate = "/v2/CreateGIDocAPI/"; //API สร้าง Doc
    const apiRes = "/issue/pickingdetail?docID="; //path หน้ารายละเอียด ตอนนี้ยังไม่เปิด

    return <div>
        {table}</div>;
};

export default Create_GR_DR;
