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
                    { label: "Document Date", type: "date", key: "documentDate", codeTranslate: "Document Date" }
                ],
                [
                    { label: "Document ProcessType", type: "labeltext", key: "documentProcessTypeID", texts: "", valueTexts: "", codeTranslate: "Document ProcessType" },
                    { label: "Action Time", type: "dateTime", key: "actionTime", codeTranslate: "Action Time" }
                ],
                [
                    { label: "Source Warehouse", type: "labeltext", key: "souWarehouseID", valueTexts: "", codeTranslate: "Source Warehouse" },
                    { label: "Des Warehouse", type: "labeltext", key: "desWarehouseID", valueTexts: "",  codeTranslate: "Des Warehouse" }
                ],
                [
                    { label: "For Customer", type: "labeltext", key: "forCustomerID", valueTexts: "", codeTranslate: "For Customer" },
                    { label: "Doc Status", type: "labeltext", key: "", texts: "NEW", codeTranslate: "Doc Status" },
                ],

                [

                    { label: "Remark", type: "input", key: "remark", codeTranslate: "Remark" }
                ]

            ];

        } else {
            let DocumentProcessTypeName = dataDocument.DocumentProcessTypeName 
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
            let For_Customer_ID = dataDocument.For_Customer_ID
            console.log(SouWarehouseName)
            let Source;
            if (SouWarehouseName != null) {
                Source = { label: "Source Warehouse", type: "labeltext", key: "souWarehouseID", texts: SouWarehouseName, valueTexts: Sou_Warehouse_ID, codeTranslate: "Source Warehouse" }
            } else if (SouCustomerName != null) {
                Source = { label: "Source Customer", type: "labeltext", key: "souCustomerID", texts: SouCustomerName, valueTexts: Sou_Customer_ID, codeTranslate: "Source Customer" }
            } else if (SouSupplierName != null) {
                Source = { label: "Source Supplier", type: "labeltext", key: "souSupplierID", texts: SouSupplierName, valueTexts: Sou_Supplier_ID, codeTranslate: "Source Supplier" }

            } else {
                Source = { label: "Source Warehouse", type: "labeltext", key: "souWarehouseID", texts: '', valueTexts: '', codeTranslate: "Source Warehouse" }
            }

            headerCreate = [

                [
                    { label: "Doc Delivery", type: "findPopUpDoc", key: "ID", queryApi: DocumentDR, fieldLabel: ["Code"], defaultValue: 1, codeTranslate: "Doc Delivery", cols: columsDoc },
                    { label: "Document Date", type: "date", key: "documentDate", codeTranslate: "Document Date" }
                ],
                [
                    { label: "Process Type", type: "labeltext", key: "documentProcessTypeID", texts: DocumentProcessTypeName, valueTexts: DocumentProcessType_ID, codeTranslate: "Process Type" },
                    { label: "Action Time", type: "dateTime", key: "actionTime", codeTranslate: "Action Time" }
                ],
                [
                    Source,
                    { label: "Des Warehouse", type: "labeltext", key: "desWarehouseID", texts: DesWarehouseName , valueTexts: Des_Warehouse_ID, codeTranslate: "Des Warehouse" }
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





    const columsFindpopUpPALC = [
        {
            Header: "Pallet Code",
            accessor: "Palletcode",
            width: 110,
            style: { textAlign: "center" }
        },

        {
            Header: "SI",
            accessor: "OrderNo",
            width: 70,
            style: { textAlign: "center" }
        },
        { Header: "Reorder/Brand", accessor: "SKUItems" },
        {
            Header: "Size",
            accessor: "Size",
            width: 50
        },
        {
            Header: "Carton No",
            accessor: "Carton",
            width: 100,
            Cell: e => getCarton(e.original)
        },
        // { Header: "SKU Code", accessor: 'Code', width: 110 },
        // { Header: "SKU Name", accessor: 'Name', width: 170 },
        {
            Header: "Location",
            accessor: "LocationCode",
            width: 90,
            style: { textAlign: "center" }
        },


        {
            Header: "Quantity",
            accessor: "Quantity",
            width: 90,
            style: { textAlign: "center" }
        },
        {
            Header: "Unit",
            accessor: "BaseUnitCode",
            width: 70,
            style: { textAlign: "center" }
        },
        // { Header: 'Shelf Day', accessor: 'ShelfDay', width: 95 },
        {
            Header: "Remark",
            accessor: "remark",
            width: 110,
            style: { textAlign: "center" }
        }
    ];

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
        queryString: window.apipath + "/v2/SelectDataTrxAPI/",
        t: "Document",
        q: '[{ "f": "Status", "c":"<", "v": 2},{ "f": "DocumentType_ID", "c":"=", "v": 1011}]',
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
        { Header: "Item Code", accessor: "SKUItems", type: "text"},
        //{ Header: "Pallet", accessor: "Palletcode", type: "findPopUp", idddl: "palletcode", queryApi: PalletCode, fieldLabel: ["palletcode"], columsddl: columsFindpopUp, codeTranslate: "Pallet" },
        { Header: "Batch", accessor: "Batch", type: "text", codeTranslate: "Batch" },
        { Header: "Lot", accessor: "Lot", type: "text", codeTranslate: "Lot" },
        { Header: "Order No.", accessor: "OrderNo", type: "text", codeTranslate: "Order No." },
        { Header: "Quantity", accessor: "Quantity", type: "inputNum", codeTranslate: "Quantity" },
        { Header: "Unit", accessor: "UnitType_Code", type: "text", codeTranslate: "Unit" }
    ];

    const columnEditItem = [
        { Header: "Item Code", accessor: "SKUItems", codeTranslate: "Item Code" },
        { Header: "Batch", accessor: "Batch", codeTranslate: "Batch" },
        { Header: "Lot",  accessor: "Lot",codeTranslate: "Lot" },
        { Header: "Order No.", accessor: "OrderNo", codeTranslate: "Order No." },
        //{ Header: "Quantity", accessor: "Quantity",codeTranslate: "Quantity" },
        //{ Header: "Unit", accessor: "UnitType_Code", codeTranslate: "Unit" }
    ];


    const columnEditItemSet = [
        { Header: "Item Code", accessor: "SKUItems", codeTranslate: "Item Code" },
        { Header: "Batch", accessor: "Batch", codeTranslate: "Batch" },
        { Header: "Lot", accessor: "Lot", codeTranslate: "Lot" },
        { Header: "Order No.", accessor: "OrderNo", codeTranslate: "Order No." },
        //{ Header: "Quantity", accessor: "Quantity",codeTranslate: "Quantity" },
        //{ Header: "Unit", accessor: "UnitType_Code", codeTranslate: "Unit" }
    ];




    const columns = [
        //{ id: "row", Cell: row => row.index + 1, width: 35 },
        { Header: "", accessor: "row", width: 35 },
        { Header: "Item Code", accessor: "SKUItems" },
        { Header: "Batch", accessor: "Batch", width: 100 },
        { Header: "Lot", accessor: "Lot", width: 100 },
        { Header: "Order No.", accessor: "OrderNo", width: 100 },
        { Header: "Qty", accessor: "Quantity", width: 110 },
        { Header: "Unit", accessor: "UnitType_Code", width: 90 }
    ];

    const apicreate = "/v2/CreateGRDocAPI/"; //API ���ҧ Doc
    const apiRes = "/putaway/detail?docID="; //path ˹����������´ �͹����ѧ����Դ

    return <div>
        {table}</div>;
};

export default Create_GR_DR;
