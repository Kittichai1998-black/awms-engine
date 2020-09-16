import DocView from "../../../pageComponent/DocumentView";
import React, { useState, useEffect } from "react";
// import AmIconStatus from "../../../../components/AmIconStatus";
// import { Button } from "@material-ui/core";
// import AmStorageObjectStatus from "../../../../components/AmStorageObjectStatus";
import CheckCircle from "@material-ui/icons/CheckCircle";
import HighlightOff from "@material-ui/icons/HighlightOff";
import queryString from "query-string";
import AmRediRectInfo from "../../../../components/AmRedirectInfo";
import AmAuditStatus from '../../../../components/AmAuditStatus';
import moment from "moment";

const PI_Detail = props => {

    const [OwnerGroupType, setOwnerGroupType] = useState(1);
    const [docview, setdocview] = useState();
    const [header, setheader] = useState();



    useEffect(() => {
        if (header !== undefined) {
            setdocview(<DocView
                openSOU={true}
                openDES={false}
                optionDocItems={optionDocItems}
                columnsDetailSOU={columnsDetailSOU}
                //columnsDetailDES={columnsDetailDES}
                OnchageOwnerGroupType={(value) => { setOwnerGroupType(value) }}
                CreateputAway={false}
                apiCreate={'/issue/pickingcreate?docID='}
                columns={columns}
                typeDoc={"counting"}
                typeDocNo={2004}
                docID={getDocID()}
                header={header}
                buttonBack={true}
                linkBack={"/issue/search"}
                history={props.history}
                usePrintPDF={false}
            >
            </DocView>
            )
        }

    }, [header])

    useEffect(() => {
        if (OwnerGroupType !== undefined) {
            var DataprocessType;
            if (OwnerGroupType === 1) {
                DataprocessType = [{ label: "Sou. Warehouse", values: "SouWarehouseName" },
                { label: "Des. Warehouse", values: "DesWarehouseName" }]
            } else if (OwnerGroupType === 2) {
                DataprocessType = [{ label: "Source Customer", values: "SouCustomerName" },
                    { label: "Des. Customer", values: "DesCustomerName" }]
            } else if (OwnerGroupType === 3) {
                DataprocessType = [{ label: "Source Supplier", values: "SouSupplierName" },
                    { label: "Des. Supplier", values: "DesSupplierName" }]
            } else {
                DataprocessType = [{ label: "Source Warehouse", values: "SouWarehouseName" },
                { label: "Des. Warehouse", values: "DesWarehouseName" }]
            }

        }

        var TextHeader = [
            [
                { label: "Doc No.", values: "Code" },
                { label: "Doc Date", values: "DocumentDate", type: "date" }
            ],
            [
                { label: "Process No.", values: "ReDocumentProcessTypeName" },
                { label: "Action Time", values: "ActionTime", type: "dateTime" }
            ],
            
                DataprocessType,

            
            [
                { label: "Doc Status", values: "renderDocumentStatusIcon()", type: "function" },
                { label: "Remark", values: "Remark" }
            ]
        ];
        setheader(TextHeader)


    }, [OwnerGroupType])
  


    const columns = [
        { width: 100, accessor: "ItemNo", Header: "Item No.", widthPDF: 25 },
        {
            Header: "Item",
            Cell: e => { return e.original.SKUMaster_Code + " : " + e.original.SKUMaster_Name },
            CellPDF: e => { return e.SKUMaster_Code + " : " + e.SKUMaster_Name }, widthPDF: 40
        },
        { Header: "Order No.", accessor: "OrderNo", widthPDF: 20 },
        { Header: "Batch", accessor: "Batch", widthPDF: 20 },
        { width: 130, accessor: "Lot", Header: "Lot", widthPDF: 25 },
        //{ width: 120, accessor: "_sumQtyDisto", Header: "Actual Qty", widthPDF: 20 },
        { width: 120, accessor: "qtyrandom", Header: "Qty", Cell: e => getFormatQty(e.original), widthPDF: 20 },
        { width: 70, accessor: "UnitType_Code", Header: "Unit", widthPDF: 20 },
        {
            Header: "Audit Status", accessor: "AuditStatus",
            Cell: e => GetAuditStatus(e.original),
            CellPDF: e => GetAuditStatus(e),
            widthPDF: 30
        },
        { Header: "Vendor Lot", accessor: "Ref1", widthPDF: 25 },
        { Header: "Ref2", accessor: "Ref2", widthPDF: 20 },
        { Header: "Ref3", accessor: "Ref3", widthPDF: 20 },
        { Header: "Ref4", accessor: "Ref4", widthPDF: 20 },
        { Header: "Carton No", accessor: "CartonNo", widthPDF: 20 },
        { Header: "Incubation Day", accessor: "IncubationDay", widthPDF: 20 },
        { Header: "Product Date", accessor: "ProductionDate", widthPDF: 35 },
        { Header: "Expire Date", accessor: "ExpireDate", widthPDF: 35 },
        { Header: "ShelfLife Day", accessor: "ShelfLifeDay", widthPDF: 20 }
    ];


    const columnsDetailSOU = [
        { width: 100, accessor: "diItemNo", Header: "Item No.", widthPDF: 10 },
        //{ Header: "Doc Code", accessor: "dcCode", Cell: e => getDoccode(e.original), widthPDF: 15 },
        {
            width: 40, accessor: "status", Header: "Task", Cell: e => getStatusGR(e.original),
            widthPDF: 5,
            CellPDF: value => {
                if (value.status === 1 || value.status === 3) return "Y";
                else if (value.status === 0)
                    return "";
                else return null;
            }
        },
        { width: 100, accessor: "rootCode", Header: "Pallet", widthPDF: 10 },
        { width: 150, accessor: "packCode", Header: "Pack Code", widthPDF: 10 },
        { accessor: "packName", Header: "Pack Name", widthPDF: 20 },
        { Header: "Order No.", accessor: "diOrderNo", widthPDF: 10 },
        { Header: "Batch", accessor: "diBatch", widthPDF: 10 },
        { width: 130, accessor: "diLot", Header: "Lot", widthPDF: 10 },
        { width: 120, accessor: "_packQty", Header: "Qty", widthPDF: 10 },
        { width: 70, accessor: "UnitType_Code", Header: "Unit", widthPDF: 10 },
        {
            Header: "Audit Status", accessor: "diAuditStatus",
            Cell: e => GetAuditStatus(e.original),
            CellPDF: e => GetAuditStatus(e),
            widthPDF: 10
        },
        { Header: "Vendor Lot", accessor: "diRef1", widthPDF: 10 },
        { Header: "Ref2", accessor: "diRef2", widthPDF: 10 },
        { Header: "Ref3", accessor: "diRef3", widthPDF: 10 },
        { Header: "Ref4", accessor: "diRef4", widthPDF: 10 },
        { Header: "Carton No.", accessor: "diCartonNo", widthPDF: 10 },
        { Header: "Incubation Day", accessor: "diIncubationDay", widthPDF: 10 },
        {
            Header: "Product Date", accessor: "diProductionDate",
            Cell: e => getFormatDatePro(e.original), widthPDF: 15,
            CellPDF: e => getFormatDatePro(e)
        },
        {
            Header: "Expire Date", accessor: "diExpireDate",
            Cell: e => getFormatDateExp(e.original), widthPDF: 15,
            CellPDF: e => getFormatDateExp(e)
        },
        { Header: "ShelfLife Day", accessor: "diShelfLifeDay", widthPDF: 10 }
    ];

    const getFormatDatePro = (e) => {
        return moment(e.diProductionDate).format("DD/MM/YYYY");
    }

    const getFormatDateExp = (e) => {
        return moment(e.diExpireDate).format("DD/MM/YYYY");
    }
    const getDoccode = (e) => {
        return (
            <div style={{ display: "flex", padding: "0px", paddingLeft: "10px" }}>
                {e.dcCode}
                <AmRediRectInfo
                    api={"/issue/pickingdetail?docID=" + e.dcID}
                    history={props.history}
                    docID={""}
                >
                    {" "}
                </AmRediRectInfo>
            </div>
        );
    };

    const getFormatQty = (e) => {
        return e.qtyrandom + '%'
    }

    const optionDocItems = [{ optionName: "DocItem" }, { optionName: "DocType" }];

    const getStatusGR = value => {
        if (value.status === 1) return <CheckCircle style={{ color: "green" }} />;
        else if (value.status === 0)
            return <HighlightOff style={{ color: "red" }} />;
        else return null;
    };

    const getDocID = () => {
        const values = queryString.parse(props.location.search);
        var ID = values.docID.toString();
        return ID;
    };

    const GetAuditStatus = (value) => {
        return <div> <AmAuditStatus key={1} statusCode={value.AuditStatus} /></div>
    };
   
    return (
        <div>{docview}</div>
      
    );
};

export default PI_Detail;
