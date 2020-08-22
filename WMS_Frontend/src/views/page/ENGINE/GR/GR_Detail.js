import DocView from "../../../pageComponent/DocumentView";
import React, { useState, useEffect } from "react";
// import AmIconStatus from "../../../../components/AmIconStatus";
// import { Button } from "@material-ui/core";
// import AmStorageObjectStatus from "../../../../components/AmStorageObjectStatus";
import CheckCircle from "@material-ui/icons/CheckCircle";
 import CheckCircleOutlineRoundedIcon from '@material-ui/icons/CheckCircleOutlineRounded';
import HighlightOff from "@material-ui/icons/HighlightOff";
import queryString from "query-string";
import AmRediRectInfo from "../../../../components/AmRedirectInfo"
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
                apiCreate={'/putaway/create?docID='}
                columns={columns}
                typeDoc={"received"}
                typeDocNo={1011}
                docID={getDocID()}
                header={header}
                buttonBack={true}
                linkBack={"/receive/search"}
                history={props.history}
            >
            </DocView>
            )
        }

    }, [header])

    useEffect(() => {
        if (OwnerGroupType !== undefined) {
            console.log(OwnerGroupType)
            var DataprocessType;
            if (OwnerGroupType === 1) {
                DataprocessType = { label: "Source Warehouse", values: "SouWarehouseName" }
            } else if (OwnerGroupType === 2) {
                DataprocessType = { label: "Source Customer", values: "SouCustomerName" }
            } else if (OwnerGroupType === 3) {
                DataprocessType = { label: "Source Supplier", values: "SouSupplierName" }
            } else {
                DataprocessType = { label: "Source Warehouse", values: "SouWarehouseName" }
            }
        }
        var TextHeader = [
            [
                { label: "Document No.", values: "Code" },
                { label: "Document Date", values: "DocumentDate", type: "date" }
            ],
            [
                { label: "Process No.", values: "DocumentProcessTypeName" },
                { label: "Action Time", values: "ActionTime", type: "dateTime" }
            ],
            [
                DataprocessType,
                { label: "Destination Warehouse", values: "DesWarehouseName" }
            ],
            [
                { label: "Doc Status", values: "renderDocumentStatus()", type: "function" },
                { label: "Remark", values: "Remark" }
            ]
        ];
        setheader(TextHeader)
    }, [OwnerGroupType])


    const columns = [
        { width: 100, accessor: "ItemNo", Header: "Item No." },
        {
            Header: "Item",
            Cell: e => { return e.original.SKUMaster_Code + " : " + e.original.SKUMaster_Name }
        },
        { Header: "OrderNo", accessor: "OrderNo" },
        { Header: "Batch", accessor: "Batch" },
        { width: 130, accessor: "Lot", Header: "Lot" },
        { width: 120, accessor: "_sumQtyDisto", Header: "Acual Qty" },
        { width: 120, accessor: "Quantity", Header: "Qty" },
        { width: 70, accessor: "UnitType_Code", Header: "Unit" },
        { Header: "Audit Status", accessor: "AuditStatus", Cell: e => GetAuditStatus(e.original) },
        { Header: "Vendor Lot", accessor: "Ref1" },
        { Header: "Ref2", accessor: "Ref2" },
        { Header: "Ref3", accessor: "Ref3" },
        { Header: "Ref4", accessor: "Ref4" },
        { Header: "CartonNo", accessor: "CartonNo" },
        { Header: "IncubationDay", accessor: "IncubationDay" },
        { Header: "ProductDate", accessor: "ProductionDate" },
        { Header: "ExpireDate", accessor: "ExpireDate" },
        { Header: "ShelfLifeDay", accessor: "ShelfLifeDay" }
    ];




    const columnsDetailSOU = [
        { width: 100, accessor: "diItemNo", Header: "Item No." },
        { Header: "Doc Code", accessor: "dcCode", Cell: e => getDoccode(e.original) },
        { width: 40, accessor: "status", Header: "Task", Cell: e => getStatusGR(e.original) },
        { width: 100, accessor: "rootCode", Header: "Pallet" },
        { width: 150, accessor: "packCode", Header: "Pack Code" },
        { accessor: "packName", Header: "Pack Name" },
        { Header: "OrderNo", accessor: "diOrderNo" },
        { Header: "Batch", accessor: "diBatch" },
        { width: 130, accessor: "diLot", Header: "Lot" },
        { width: 120, accessor: "_packQty", Header: "Qty" },
        { width: 70, accessor: "UnitType_Code", Header: "Unit" },
        { Header: "Audit Status", accessor: "AuditStatus" },
        { Header: "Vendor Lot", accessor: "diRef1" },
        { Header: "Ref2", accessor: "diRef2" },
        { Header: "Ref3", accessor: "diRef3" },
        { Header: "Ref4", accessor: "diRef4" },
        { Header: "CartonNo", accessor: "diCartonNo" },
        { Header: "IncubationDay", accessor: "diIncubationDay" },
        { Header: "ProductDate", accessor: "diProductionDate", Cell: e => getFormatDatePro(e.original)},
        { Header: "ExpireDate", accessor: "diExpireDate", Cell: e => getFormatDateExp(e.original)},
        { Header: "ShelfLifeDay", accessor: "diShelfLifeDay" }
    ];

    const getFormatDatePro = (e) => {
        return moment(e.diProductionDate).format("DD/MM/YYYY");
    }

    const getFormatDateExp = (e) => {
        return moment(e.diExpireDate).format("DD/MM/YYYY");
    }

    const getDoccode = (e) => {
        console.log(e)
        return (
            <div style={{ display: "flex", padding: "0px", paddingLeft: "10px" }}>
                {e.dcCode}
                <AmRediRectInfo
                    api={"/putaway/detail?docID=" + e.dcID}
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
            return <CheckCircleOutlineRoundedIcon style={{ color: "orange" }} />;
        else return null;
    };

    const GetAuditStatus = (value) => {
        if (value.AuditStatus === 0) {
            return "QUARANTINE"
        } else if (value.AuditStatus === 1) {
            return "PASS"
        }  else if (value.AuditStatus === 2) {
            return "NOTPASS"
        } else if (value.AuditStatus === 9) {
            return "HOLD"
        }
    };

    const getDocID = () => {
        const values = queryString.parse(props.location.search);
        var ID = values.docID.toString();
        return ID;
    };


    
    return (
        <div>{docview}</div>

    );
};

export default GR_Detail;
