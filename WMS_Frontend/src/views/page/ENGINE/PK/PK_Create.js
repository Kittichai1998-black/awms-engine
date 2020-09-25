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
                    { label: "Sou. Warehouse", type: "labeltext", key: "souWarehouseID", valueTexts: "", codeTranslate: "Source Warehouse" },
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
            let Source;
            if (SouWarehouseName != null) {
                Source = [{ label: "Sou. Warehouse", type: "labeltext", key: "souWarehouseID", texts: SouWarehouseName, valueTexts: Sou_Warehouse_ID, codeTranslate: "Source Warehouse" },
                    { label: "Des. Warehouse", type: "labeltext", key: "desWarehouseID", texts: SouWarehouseName, valueTexts: Des_Warehouse_ID, codeTranslate: "Des Warehouse" },
                ]
            } else if (SouCustomerName != null) {
                Source = [{ label: "Sou. Customer", type: "labeltext", key: "souCustomerID", texts: SouCustomerName, valueTexts: Sou_Customer_ID, codeTranslate: "Source Customer" },
                    { label: "Des. Customer", type: "labeltext", key: "desCustomerID", texts: DesCustomerName, valueTexts: Des_Customer_ID, codeTranslate: "Des Customer" }
                ]
            } else if (SouSupplierName != null) {
                Source = [{ label: "Sou. Supplier", type: "labeltext", key: "souSupplierID", texts: SouSupplierName, valueTexts: Sou_Supplier_ID, codeTranslate: "Source Supplier" },
                    { label: "Des. Supplier", type: "labeltext", key: "desSupplierID", texts: DesSupplierName, valueTexts: Des_Supplier_ID, codeTranslate: "Des Supplier" }
                ]

            } else {
                Source = [{ label: "Sou. Warehouse", type: "labeltext", key: "souWarehouseID", texts: SouWarehouseName, valueTexts: Sou_Warehouse_ID, codeTranslate: "Source Warehouse" },
                    { label: "Des. Warehouse", type: "labeltext", key: "desWarehouseID", texts: DesWarehouseName, valueTexts: Des_Warehouse_ID, codeTranslate: "Des Warehouse" },
                ]
            }

            headerCreate = [

                [
                    { label: "Doc NO.", type: "findPopUpDoc", key: "ID", queryApi: DocumentDR, fieldLabel: ["Code"], defaultValue: 1, codeTranslate: "Doc Delivery", cols: columsDoc },
                    { label: "Doc Date", type: "date", key: "documentDate", codeTranslate: "Document Date" }
                ],
                [
                    { label: "Process No.", type: "labeltext", key: "documentProcessTypeID", texts: DocumentProcessTypeName, valueTexts: DocumentProcessType_ID, codeTranslate: "Process Type" },
                    { label: "Action Time", type: "dateTime", key: "actionTime", codeTranslate: "Action Time" }
                ],
                
                    Source,
                    
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
        s: "[{'f':'ID','od':'asc'}]",
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
        //{ Header: "Item No.", accessor: "ItemNo", type: "text", codeTranslate: "ItemNo" },
        { Header: "Item Code", accessor: "SKUMaster_Code", codeTranslate: "Item Code", type: "text" },
        { Header: "Item Name", accessor: "SKUMaster_Name", codeTranslate: "Item Name", type: "text" },
        { Header: "Control No.", accessor: "OrderNo", type: "text", codeTranslate: "OrderNo" },
        //{ Header: "Batch", accessor: "Batch", type: "text", codeTranslate: "Batch" },
        { Header: "Lot", accessor: "Lot", type: "text", codeTranslate: "Lot" },
        { Header: "Qty", accessor: "Quantity", type: "inputNum", codeTranslate: "Qty" },
        { Header: "Unit", accessor: "UnitType_Code", type: "text", codeTranslate: "Unit" },
        { Header: "Quality Status", accessor: "AuditStatus", type: "text", codeTranslate: "AuditStatus" },
        { Header: "Vendor Lot", accessor: "Ref1", type: "text", codeTranslate: "Ref1" },
        { Header: "Remark", accessor: "Remark", type: "text", codeTranslate: "Remark" },
        //{ Header: "Ref2", accessor: "Ref2", type: "text", codeTranslate: "Ref2" },
        //{ Header: "Ref3", accessor: "Ref3", type: "text", codeTranslate: "Ref3" },
        //{ Header: "Ref4", accessor: "Ref4", type: "text", codeTranslate: "Ref4" },
        { Header: "Carton No.", accessor: "CartonNo", type: "text", codeTranslate: "CartonNo" },
        //{ Header: "Incubation Day", accessor: "IncubationDay", type: "text", codeTranslate: "IncubationDay" },
        { Header: "MFG.Date", accessor: "ProductionDate", type: "text", codeTranslate: "ProductionDate" },
        { Header: "Expire Date", accessor: "ExpireDate", type: "text", codeTranslate: "ExpireDate" },
        //{ Header: "ShelfLife Day", accessor: "ShelfLifeDay", type: "text", codeTranslate: "ShelfLifeDay" }
    ];


    const columnEditItem = [
        //{ Header: "Item No.", accessor: "ItemNo", codeTranslate: "ItemNo" },
        { Header: "Item Code", accessor: "SKUMaster_Code", codeTranslate: "Item Code" },
        { Header: "Item Name", accessor: "SKUMaster_Name", codeTranslate: "Item Name" },
        { Header: "Control No.", accessor: "OrderNo", codeTranslate: "OrderNo" },
        //{ Header: "Batch", accessor: "Batch", codeTranslate: "Batch" },
        //{ Header: "Lot", accessor: "Lot", codeTranslate: "Lot" },
        { Header: "Qty", accessor: "Quantity", codeTranslate: "Qty" },
        { Header: "Unit", accessor: "UnitType_Code", codeTranslate: "Unit" },
        { Header: "Quality Status", accessor: "AuditStatus", codeTranslate: "AuditStatus" },
        { Header: "Vendor Lot", accessor: "Ref1", codeTranslate: "Ref1" },
        { Header: "Remark", accessor: "Remark", codeTranslate: "Remark"},
        //{ Header: "Ref2", accessor: "Ref2", codeTranslate: "Ref2" },
        //{ Header: "Ref3", accessor: "Ref3", codeTranslate: "Ref3" },
        //{ Header: "Ref4", accessor: "Ref4", codeTranslate: "Ref4" },
        { Header: "Carton No.", accessor: "CartonNo", codeTranslate: "CartonNo" },
        //{ Header: "Incubation Day", accessor: "IncubationDay", codeTranslate: "IncubationDay" },
        { Header: "MFG.Date", accessor: "ProductionDate", codeTranslate: "ProductDate" },
        { Header: "Expire Date", accessor: "ExpireDate", codeTranslate: "ExpireDate" },
        //{ Header: "ShelfLife Day", accessor: "ShelfLifeDay", codeTranslate: "ShelfLifeDay" }

    ];

    const columnEditItemSet = [
        { Header: "Item Code", accessor: "SKUMaster_Code", codeTranslate: "Item Code" },
        { Header: "Item Name", accessor: "SKUMaster_Name", codeTranslate: "Item Name" },
        { Header: "Lot", accessor: "Lot", codeTranslate: "Lot" },
        //{ Header: "Item No.", accessor: "ItemNo", codeTranslate: "ItemNo" },
        //{ Header: "Quantity", accessor: "Quantity",codeTranslate: "Quantity" },
        //{ Header: "Unit", accessor: "UnitType_Code", codeTranslate: "Unit" }
    ];


    const columns = [
        //{ id: "row", Cell: row => row.index + 1, width: 35 },
        //{ Header: "", accessor: "row", width: 35 },
        { Header: "Item Code", accessor: "SKUMaster_Code" },
        { Header: "Item Nane", accessor: "SKUMaster_Name" },
        { Header: "Control No.", accessor: "OrderNo" },
        //{ Header: "Batch", accessor: "Batch" },
        { width: 130, accessor: "Lot", Header: "Lot" },
        { width: 120, accessor: "_qty", Header: "Qty" },
        { width: 70, accessor: "UnitType_Code", Header: "Unit" },
        { Header: "Quality Status", accessor: "AuditStatus" },
        { Header: "Vendor Lot", accessor: "Ref1" },
        { Header: "Remark", accessor: "Remark"},
        //{ Header: "Ref2", accessor: "Ref2" },
        //{ Header: "Ref3", accessor: "Ref3" },
        //{ Header: "Ref4", accessor: "Ref4" },
        { Header: "Carton No.", accessor: "CartonNo" },
        //{ Header: "Incubation Day", accessor: "IncubationDay" },
        { Header: "MFG.Date", accessor: "ProductionDate" },
        { Header: "Expire Date", accessor: "ExpireDate" },
        //{ Header: "ShelfLife Day", accessor: "ShelfLifeDay" }
    ];

    const apicreate = "/v2/CreateGIDocAPI/"; //API สร้าง Doc
    const apiRes = "/issue/pickingdetail?docID="; //path หน้ารายละเอียด ตอนนี้ยังไม่เปิด

    return <div>
        {table}</div>;
};

export default Create_GR_DR;
