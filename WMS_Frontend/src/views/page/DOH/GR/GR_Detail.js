import DocView from "../../../pageComponent/DocumentView";
import React, { useState, useEffect } from "react";
// import AmIconStatus from "../../../../components/AmIconStatus";
// import { Button } from "@material-ui/core";
// import AmStorageObjectStatus from "../../../../components/AmStorageObjectStatus";
import Circle from "@material-ui/icons/RadioButtonUnchecked";
import CheckCircleOutlineRoundedIcon from '@material-ui/icons/CheckCircleOutlineRounded';
import HighlightOff from "@material-ui/icons/HighlightOff";
import Grid from '@material-ui/core/Grid';
import queryString from "query-string";
import AmRediRectInfo from "../../../../components/AmRedirectInfo";
import AmCreateDoc from '../../../.././components/AmImportDocumentExcel';
import AmAuditStatus from '../../../../components/AmAuditStatus';
import moment from "moment";

const GR_Detail = props => {

    const [OwnerGroupType, setOwnerGroupType] = useState(1);
    const [header, setheader] = useState([]);

    useEffect(() => {

        var TextHeader = [
            [
                { label: "Doc No.", values: "Code" },
                { label: "Doc. Date", values: "DocumentDate", type: "date" }
            ],
            [
                { label: "Process No.", value: "DocumentProcessTypeCode", values: "ReDocumentProcessTypeName" },
                { label: "Action Time", values: "ActionTime", type: "dateTime" }
            ],
            [
                { label: "Des Area", value: "DesAreaMasterCode", values: "DesAreaMasterName" },
                { label: "Des. Warehouse", value: "DesWarehouse", values: "DesWarehouseName" },
            ],
            [
                { label: "Doc Status", getStatusText: "renderDocumentStatus()", values: "renderDocumentStatusIcon()", type: "function" },
                { label: "Remark", value: "Remark" }
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
            CellPDF: e => { return  e.SKUMaster_Name }, widthPDF: 40
        },
        { Header: "Order No.", accessor: "OrderNo", widthPDF: 20 },
        { Header: "Lot", accessor: "Lot",width: 130, widthPDF: 25 },
        { Header: "Batch", accessor: "Ref1", widthPDF: 25 },
        { width: 120, accessor: "_sumQtyDisto", Header: "Receive Quantity", widthPDF: 20 },
        { width: 120, accessor: "Quantity", Header: "Request Quantity", widthPDF: 20 },
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
        {
            Header: "Task", accessor: "status", width: 40, Cell: e => getStatusGR(e.original),
            widthPDF: 5,
            CellPDF: value => {
                if (value.status === 1 || value.status === 3) return "Y";
                else if (value.status === 0)
                    return "";
                else return null;
            }
        },
        { Header: "Doc NO.", accessor: "dcCode", Cell: e => getDoccode(e.original), widthPDF: 15 },
        { Header: "Pack Code", accessor: "packCode",  widthPDF: 10, width: 150,  },
        { Header: "Pack Name", accessor: "packName", widthPDF: 20 },
        { Header: "Pallet",width: 100, accessor: "rootCode", widthPDF: 10 },
        { Header: "Order No.", accessor: "diOrderNo", widthPDF: 10 },
        { Header: "Lot", width: 130, accessor: "diLot", widthPDF: 10 },
        { Header: "Batch", accessor: "diRef1", widthPDF: 10 },
        { Header: "Actual Quantity", accessor: "distoQty", widthPDF: 10, width: 120 },
        //{ Header: "Quantity Per Pallet", accessor: "distoQtyMax", widthPDF: 10, width: 120, },
        { Header: "Unit", accessor: "distoUnitCode", widthPDF: 10, width: 70, },
        {
            Header: "Quality Status", accessor: "diAuditStatus",
            Cell: e => GetAuditStatusIcon(e.original),
            CellPDF: e => GetAuditStatus(e),
            widthPDF: 10
        },
        { Header: "Remark", accessor: "remark", widthPDF: 10 },
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

    const getDoccode = (e) => {
        let links;
        if (e.dcDocType_ID) {
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
        }
    };


    const optionDocItems = [{ optionName: "DocItem" }, { optionName: "DocType" }];

    const getStatusGR = value => {
        if (value.status === 0)
            return <Circle style={{ color: "gray" }} />;
        else if (value.status === 1)
            return <CheckCircleOutlineRoundedIcon style={{ color: "orange" }} />;
        else if (value.status === 3)
            return <CheckCircleOutlineRoundedIcon style={{ color: "green" }} />;
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
            <DocView
                openSOU={true}
                openDES={false}
                optionDocItems={optionDocItems}
                columnsDetailSOU={columnsDetailSOU}
                //columnsDetailDES={columnsDetailDES}
                OnchageOwnerGroupType={(value) => { setOwnerGroupType(value) }}
                CreateputAway={true}
                TextBtnCreateputAway={'Create Putaway'}
                apiCreate={'/receive/putawaycreate?docID='}
                columns={columns}
                typeDoc={"received"}
                typeDocNo={1011}
                docID={getDocID()}
                header={header}
                buttonBack={true}
                linkBack={"/receive/search"}
                history={props.history}
                usePrintPDF={true}
            />

    );
};

export default GR_Detail;
