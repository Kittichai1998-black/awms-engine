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
                //apiCreate={'/issue/pickingcreate?docID='}
                columns={columns}
                typeDoc={"counting"}
                typeDocNo={2004}
                docID={getDocID()}
                header={header}
                buttonBack={true}
                linkBack={"/picking/search"}
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
        //{ width: 100, accessor: "ItemNo", Header: "Item No.", widthPDF: 25 },
        {
            Header: "Item Code",
            Cell: e => { return e.original.SKUMaster_Code },
            CellPDF: e => { return e.SKUMaster_Code }, widthPDF: 40
        },
        {
            Header: "Item Name",
            Cell: e => { return e.original.SKUMaster_Name },
            CellPDF: e => { return e.SKUMaster_Name }, widthPDF: 40
        },
        { Header: " Control No.", accessor: "OrderNo", widthPDF: 20 },
        { width: 130, accessor: "Lot", Header: "Lot", widthPDF: 25 },
        { Header: "Vendor Lot", accessor: "Ref1", widthPDF: 25 },
        { width: 120, accessor: "Quantity", Header: "Request Quantity", widthPDF: 20, Cell: e => getFormatPrscen(e.original), widthPDF: 15,},
        { width: 70, accessor: "UnitType_Code", Header: "Unit", widthPDF: 20 },
        {
            Header: "Quality Status", accessor: "AuditStatus",
            Cell: e => GetAuditStatusIcon(e.original),
            CellPDF: e => GetAuditStatus(e),
            widthPDF: 30
        },
        { Header: "Remark", accessor: "remark", widthPDF: 20 },
        { Header: "Carton No.", accessor: "CartonNo", widthPDF: 20 },
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
        { Header: "Lot", width: 130, accessor: "diLot", widthPDF: 10 },
        { Header: "Vender Lot", width: 130, accessor: "diRef1", widthPDF: 10 },
        { Header: "Actual Quantity", accessor: "distoQty", widthPDF: 10, width: 120 },
        { Header: "Quantity Per Pallet", accessor: "distoQtyMax", widthPDF: 10, width: 120, },
        { width: 70, accessor: "distoUnitCode", Header: "Unit", widthPDF: 10 },
        {
            Header: "Quality Status", accessor: "diAuditStatus",
            Cell: e => GetAuditStatusIcon(e.original),
            CellPDF: e => GetAuditStatus(e),
            widthPDF: 10
        },
        { Header: "Vendor Lot", accessor: "diRef1", widthPDF: 10 },
        { Header: "Remark", accessor: "remark", widthPDF: 20 },
        { Header: "Carton No.", accessor: "diCartonNo", widthPDF: 10 },
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
    ];

    const getFormatDatePro = (e) => {
        if (e.diProductionDate) {
            return moment(e.diProductionDate).format("DD/MM/YYYY");
        }

    }

    const getFormatDateExp = (e) => {
        if (e.diExpireDate) {
            return moment(e.diExpireDate).format("DD/MM/YYYY");
        }
    }

    const getFormatPrscen = (e) => {
        var query = queryString.parse(e.Options) 
        if (query.qtyrandom) {
            return query.qtyrandom + '%'
        }
    }

    const getDoccode = (e) => {
        if (e.ID != 0) {
            let links;
            if (e.dcDocType_ID === 1001) {
                links = "/receive/putawaydetail?docID="

            } else if (e.dcDocType_ID === 1002) {
                links = "/issue/pickingdetail?docID="
            } 
            if (e.dcID) {
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
            }
        }
    };

    const GetAuditStatusIcon = (value) => {
        if (value.diAuditStatus != undefined) {
            return <div> <AmAuditStatus key={1} statusCode={value.diAuditStatus} /></div>
        } else if (value.AuditStatus != undefined) {
            return <div> <AmAuditStatus key={1} statusCode={value.AuditStatus} /></div>
        }
    };


    const getFormatQty = (e) => {
        let query = queryString.parse(e.Options)
        if (query.qtyrandom) {
            return query.qtyrandom + '%'
        }
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
