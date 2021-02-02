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
                    { label: "Doc NO.", type: "findPopUpDoc", key: "ID", queryApi: DocumentDR, fieldLabel: ["Code"], defaultValue: 1, codeTranslate: "Doc Delivery", cols: columsDoc },
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
                    { label: "Des. Warehouse", type: "labeltext", key: "desWarehouseID", valueTexts: "", codeTranslate: "Des Warehouse" }
                ],
                [

                    { label: "Doc Status", type: "labeltext", key: "", texts: "NEW", codeTranslate: "Doc Status" },
                    { label: "Remark", type: "input", key: "Remark", codeTranslate: "Remark" }
                ]

            ];

        } else {
            let DocumentProcessTypeName = dataDocument.ReDocumentProcessTypeName
            let DocumentProcessType_ID = dataDocument.DocumentProcessType_ID
            let SouCustomerName = dataDocument.SouCustomerName
            let Sou_Customer_ID = dataDocument.Sou_Customer_ID
            let SouWarehouseName = dataDocument.SouWarehouseName
            let Sou_Warehouse_ID = dataDocument.Sou_Warehouse_ID
            let SouSupplierName = dataDocument.SouSupplierName
            let Sou_Supplier_ID = dataDocument.Sou_Supplier_ID
            let DesWarehouseName = dataDocument.DesWarehouseName
            let Des_Warehouse_ID = dataDocument.Des_Warehouse_ID
            let ForCustomerName = dataDocument.ForCustomerName
            let Ref1 = dataDocument.Ref1
            let Ref2 = dataDocument.Ref2
            let For_Customer_ID = dataDocument.For_Customer_ID

            headerCreate = [

                [
                    { label: "Doc Delivery", type: "findPopUpDoc", key: "ID", queryApi: DocumentDR, fieldLabel: ["Code"], defaultValue: 1, codeTranslate: "Doc Delivery", cols: columsDoc },
                    { label: "Document Date", type: "date", key: "documentDate", codeTranslate: "Document Date" }
                ],
                [
                    { label: "Process No.", type: "labeltext", key: "documentProcessTypeID", texts: DocumentProcessTypeName, valueTexts: DocumentProcessType_ID, codeTranslate: "Process Type" },
                    { label: "Action Time", type: "dateTime", key: "actionTime", codeTranslate: "Action Time" }
                ],
                [
                    { label: "Grade", type: "labeltext", valueTexts: Ref1, codeTranslate: "Grade", key: "ref1", },
                    { label: "Doc.WMS", type: "labeltext", valueTexts: Ref2, codeTranslate: "Doc.WMS", key: "ref2", }
                ],
                [
                    { label: "Customer", type: "labeltext", key: "forCustomerID", valueTexts: ForCustomerName, codeTranslate: "Customer" },
                    { label: "Des. Warehouse", type: "labeltext", key: "desWarehouseID", texts: DesWarehouseName, valueTexts: Des_Warehouse_ID, codeTranslate: "Des Warehouse" }
                ],
                [
                    { label: "Doc Status", type: "labeltext", key: "", texts: "NEW", codeTranslate: "Doc Status" },
                    { label: "Remark", type: "input", key: "Remark", codeTranslate: "Remark" }
                ],



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
                    doccreateDocType={"putAway"}
                    doctypeDocNo={1011}
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




    const getCarton = value => {
        var qryStr = queryString.parse(value.Options);
        return qryStr["carton_no"];
    };
    const PalletCode = {
        queryString: window.apipath + "/v2/SelectDataViwAPI/",
        t: "PalletSto",
        q:
            '[{"f":"Status" , "c":"=" , "v":"1"},{"f": "EventStatus" , "c":"in" , "v": "12,97"},{"f": "GroupType" , "c":"=" , "v": "1"}]', //���͹� '[{ "f": "Status", "c":"<", "v": 2}]'
        f:
            "ID,palletcode,Code,Batch,Name,Quantity,UnitCode,BaseUnitCode,LocationCode,LocationName,SKUItems,srmLine,OrderNo as orderNo,Remark as remark,Size,Options",
        g: "",
        s: "[{'f':'ID','od':'ASC'}]",
        sk: 0,
        l: 20,
        all: ""
    };


    const DocumentDR = {
        queryString: window.apipath + "/v2/SelectDataViwAPI/",
        t: "Document",
        q: '[{ "f": "Status", "c":"=", "v": 1},{ "f": "DocumentType_ID", "c":"=", "v": 1011}]',
        f: "*",
        g: "",
        s: "[{'f':'ID','od':'DESC'}]",
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
        { Header: "Vendor Lot", accessor: "Ref1", type: "text", codeTranslate: "Ref1" },
        { Header: "Quantity", accessor: "Quantity", type: "inputNum", codeTranslate: "Qty" },
        { Header: "Unit", accessor: "UnitType_Code", type: "text", codeTranslate: "Unit" },
        { Header: "Quantity/Pallet", accessor: "options", type: "input", width: '300px' },
        { Header: "Start Pallet", accessor: "options", type: "input", width: '300px' },
        { Header: "End Pallet", accessor: "options", type: "input", width: '300px' },
        { Header: "Quality Status", accessor: "AuditStatus", type: "text", codeTranslate: "AuditStatus" },
        { Header: "Remark", accessor: "Remark", type: "text", codeTranslate: "Remark" },


    ];

    const columnEditItem = [
        { Header: "Item Code", accessor: "SKUMaster_Code", codeTranslate: "Item Code", type: "text" },
        { Header: "Item Name", accessor: "SKUMaster_Name", codeTranslate: "Item Name", type: "text" },
        { Header: "Lot", accessor: "Lot", type: "text", codeTranslate: "Lot" },
        { Header: "Quantity", accessor: "Quantity", type: "inputNum", codeTranslate: "Qty" },
        { Header: "Unit", accessor: "UnitType_Code", type: "text", codeTranslate: "Unit" },
        { Header: "Quantity/Pallet", accessor: "options", type: "input", width: '300px' },
        { Header: "Start Pallet", accessor: "options", type: "input", width: '300px' },
        { Header: "End Pallet", accessor: "options", type: "input", width: '300px' },
        { Header: "Quality Status", accessor: "AuditStatus", type: "text", codeTranslate: "AuditStatus" },
        { Header: "Remark", accessor: "Remark", type: "text", codeTranslate: "Remark" },
    ];


    const columnEditItemSet = [
        { Header: "Item Code", accessor: "SKUMaster_Code", codeTranslate: "Item Code" },
        { Header: "Item Name", accessor: "SKUMaster_Name", codeTranslate: "Item Name" },
        { Header: "Lot", accessor: "Lot", codeTranslate: "Lot" },
    ];


    const columns = [
        { Header: "Quality Status", accessor: "AuditStatus" },
        { Header: "Item Code", accessor: "SKUMaster_Code" },
        { Header: "Item Name", accessor: "SKUMaster_Name" },
        { Header: "Lot", accessor: "Lot", width: 130, },
        { Header: "Qty", accessor: "_qty", width: 120, },
        { Header: "Unit", accessor: "UnitType_Code", width: 70, },
        { Header: "Quantity/Pallet", accessor: "options", width: 70 },
        { Header: "Start Pallet", accessor: "options", width: 70 },
        { Header: "End Pallet", accessor: "options", width: 70 },
        { Header: "Remark", accessor: "Remark" },

    ];

    const apicreate = "/v2/CreateGRDocAPI/"; //API ���ҧ Doc
    const apiRes = "/receive/putawaydetail?docID="; //path ˹����������´ �͹����ѧ����Դ

    return <div>
        {table}</div>;
};

export default Create_GR_DR;
