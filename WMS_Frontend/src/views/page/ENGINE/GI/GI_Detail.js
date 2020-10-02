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

const GR_Detail = props => {

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
                CreateputAway={true}
                TextBtnCreateputAway={"Create Picking"}
                apiCreate={'/issue/pickingcreate?docID='}
                columns={columns}
                typeDoc={"issued"}
                typeDocNo={1012}
                docID={getDocID()}
                header={header}
                buttonBack={true}
                linkBack={"/issue/search"}
                history={props.history}
                usePrintPDF={true}
            >
            </DocView>
            )
        }

    }, [header])

    useEffect(() => {
        if (OwnerGroupType !== undefined) {
            var DataprocessType;
            if (OwnerGroupType === 1) {
                DataprocessType = [{ label: "Sou. Warehouse", value: "SouWarehouse", values: "SouWarehouseName" },
                { label: "Des. Warehouse", values: "DesWarehouseName" }]
            } else if (OwnerGroupType === 2) {
                DataprocessType = [{ label: "Sou. Customer", value: "SouCustomer", values: "SouCustomerName" },
                    { label: "Des. Customer", value: "DesCustomer", values: "DesCustomerName" }]
            } else if (OwnerGroupType === 3) {
                DataprocessType = [{ label: "Sou. Supplier", value: "SouSupplier", values: "SouSupplierName" },
                    { label: "Des. Supplier", value: "DesSupplier", values: "DesSupplierName" }]
            } else {
                DataprocessType = [{ label: "Sou. Warehouse", value: "SouWarehouse", values: "SouWarehouseName" },
                    { label: "Des. Warehouse", value: "DesWarehouse", values: "DesWarehouseName" }]
            }

        }

        var TextHeader = [
            [
                { label: "Doc No.", values: "Code" },
                { label: "Doc Date", values: "DocumentDate", type: "date" }
            ],
            [
                { label: "Process No.", value: "DocumentProcessTypeCode", values: "ReDocumentProcessTypeName" },
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
        //{ width: 100, accessor: "ItemNo", Header: "Item No.", widthPDF: 25 },
        {
            Header: "Item Code",
            Cell: e => { return e.original.SKUMaster_Code},
            CellPDF: e => { return e.SKUMaster_Code}, widthPDF: 40
        },
        {
            Header: "Item Name",
            Cell: e => { return e.original.SKUMaster_Name },
            CellPDF: e => { return e.SKUMaster_Name }, widthPDF: 40
        },
        { Header: " Control No.", accessor: "OrderNo", widthPDF: 20 },
        //{ Header: "Batch", accessor: "Batch", widthPDF: 20 },
        { width: 130, accessor: "Lot", Header: "Lot", widthPDF: 25 },
        { Header: "Vendor Lot", accessor: "Ref1", widthPDF: 25 },
        { width: 120, accessor: "_sumQtyDisto", Header: "Picking Quantity", widthPDF: 20 },
        { width: 120, accessor: "Quantity", Header: "Request Quantity", widthPDF: 20 },
        { width: 70, accessor: "UnitType_Code", Header: "Unit", widthPDF: 20 },
        {
            Header: "Quality Status", accessor: "AuditStatus",
            Cell: e => GetAuditStatusIcon(e.original),
            CellPDF: e => GetAuditStatus(e),
            widthPDF: 30
        }, 
        { Header: "Remark", accessor: "remark", widthPDF: 20 },
        { Header: "MFG.Date", accessor: "ProductionDate", widthPDF: 35 },
        { Header: "Expire Date", accessor: "ExpireDate", widthPDF: 35 },
    ];


    const columnsDetailSOU = [
       // { width: 100, accessor: "diItemNo", Header: "Item No.", widthPDF: 10 },
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
        { Header: "Doc NO.", accessor: "dcCode", Cell: e => getDoccode(e.original), widthPDF: 15 },     
        { width: 100, accessor: "rootCode", Header: "Pallet", widthPDF: 10 },
        { width: 150, accessor: "packCode", Header: "Pack Code", widthPDF: 10 },
        { accessor: "packName", Header: "Pack Name", widthPDF: 20 },
        { Header: "Control No.", accessor: "diOrder No.", widthPDF: 10 },
        { width: 130, accessor: "diLot", Header: "Lot", widthPDF: 10 },
        { Header: "Vendor Lot", accessor: "diRef1", widthPDF: 10 },
        { Header: "Actual Quantity", accessor: "distoQty", widthPDF: 10, width: 120 },
        { Header: "Quantity Per Pallet", accessor: "distoQtyMax", widthPDF: 10, width: 120, },
        { width: 70, accessor: "distoUnitCode", Header: "Unit", widthPDF: 10 },
        {
            Header: "Quality Status", accessor: "diAuditStatus",
            Cell: e => GetAuditStatusIcon(e.original),
            CellPDF: e => GetAuditStatus(e),
            widthPDF: 10
        },
        { Header: "Remark", accessor: "remark", widthPDF: 20 },
        {
            Header: "MFG.Date", accessor: "diProductionDate",
            Cell: e => getFormatDatePro(e.original), widthPDF: 15,
            CellPDF: e => getFormatDatePro(e)
        },
        {
            Header: "Expire Date", accessor: "diExpireDate",
            Cell: e => getFormatDateExp(e.original), widthPDF: 15,
            CellPDF: e => getFormatDateExp(e)
        },
        //{ Header: "ShelfLife (%)", accessor: "diShelfLifeDay", widthPDF: 10 }
    ];

    const getFormatDatePro = (e) => {
        return moment(e.diProductionDate).format("DD/MM/YYYY");
    }

    const getFormatDateExp = (e) => {
        return moment(e.diExpireDate).format("DD/MM/YYYY");
    }
    const getDoccode = (e) => {
        let links;
        if (e.dcDocType_ID === 1001) {
            links = "/receive/putawaydetail?docID="

        } else if (e.dcDocType_ID === 1002) {
            links = "/issue/pickingdetail?docID="
        }
        return (
            <div style={{ display: "flex", padding: "0px", paddingLeft: "10px" }}>
                {e.dcCode}
                <AmRediRectInfo
                    api={links + e.dcID}
                    history={props.history}
                    docID={""}
                >
                    {" "}
                </AmRediRectInfo>
            </div>

        );
    };


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
        if (value.AuditStatus === 0 || value.diAuditStatus === 0) {
            return "QUARANTINE"
        } else if (value.AuditStatus === 1 || value.diAuditStatus === 1) {
            return "PASSED"
        } else if (value.AuditStatus === 2 || value.diAuditStatus === 2) {
            return "REJECTED"
        } else if (value.AuditStatus === 9 || value.diAuditStatus === 9) {
            return "HOLD"
        }
    };

    const GetAuditStatusIcon = (value) => {
        if (value.diAuditStatus != undefined) {
            return <div> <AmAuditStatus key={1} statusCode={value.diAuditStatus} /></div>
        } else if (value.AuditStatus != undefined) {
            return <div> <AmAuditStatus key={1} statusCode={value.AuditStatus} /></div>
        }
    };

    return (
        <div>{docview}</div>
      
    );
};

export default GR_Detail;
