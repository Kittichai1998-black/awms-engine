import DocView from "../../../pageComponent/DocumentView";
import React, { useState, useEffect } from "react";
// import AmIconStatus from "../../../../components/AmIconStatus";
// import { Button } from "@material-ui/core";
// import AmStorageObjectStatus from "../../../../components/AmStorageObjectStatus";
import CheckCircle from "@material-ui/icons/CheckCircle";
import CheckCircleOutlineRoundedIcon from '@material-ui/icons/CheckCircleOutlineRounded';
import HighlightOff from "@material-ui/icons/HighlightOff";
import queryString from "query-string";
import AmRediRectInfo from "../../../../components/AmRedirectInfo";
import AmAuditStatus from '../../../../components/AmAuditStatus';
import IconButton from "@material-ui/core/IconButton";
import ErrorIcon from "@material-ui/icons/Error";
import WarningIcon from '@material-ui/icons/Warning';
import moment from "moment";
import AmPopup from "../../../../components/AmPopup";

const PI_Detail = props => {

    const [OwnerGroupType, setOwnerGroupType] = useState(1);
    const [docview, setdocview] = useState();
    const [header, setheader] = useState();

    const [dialogState, setDialogState] = useState({});


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
                typeDoc={"audit"}
                typeDocNo={2003}
                docID={getDocID()}
                header={header}
                buttonBack={true}
                linkBack={"/counting/search"}
                history={props.history}
                usePrintPDF={false}
            >
            </DocView>
            )
        }

    }, [header])
    useEffect(() => {

        var TextHeader = [
            [
                { label: "Doc No.", values: "Code" },
                { label: "Doc Date", values: "DocumentDate", type: "date" }
            ],
            [
                { label: "Process No.", value: "DocumentProcessTypeCode", values: "ReDocumentProcessTypeName" },
                { label: "Action Time", values: "ActionTime", type: "dateTime" }
            ],
            [
                { label: "ProductOwner", value: "ProductOwnerCode", values: "ProductOwnerName" },
                { label: "Des. Area", value: "DesAreaMasterCode", values: "DesAreaMasterName" }
            ],
            [
                { label: "Sou. Warehouse", value: "SouWarehouse", values: "SouWarehouseName" },
                { label: "Des. Warehouse", value: "DesWarehouse", values: "DesWarehouseName" }
            ],
            [
                { label: "Doc Status", values: "renderDocumentStatusIcon()", type: "function" },
                { label: "Remark", values: "Remark" }
            ]
        ];
        setheader(TextHeader)
    }, [OwnerGroupType])



    const columns = [
        { Header: "เลขที่ภาชนะ", accessor: "BaseCode" },
        {
            Header: "ชนิดราคา",
            Cell: e => { return e.original.SKUMaster_Code },
            CellPDF: e => { return e.SKUMaster_Code }, widthPDF: 40
        },
        { Header: "เลขที่ภาชนะ", accessor: "Code" },
        { Header: "ชนิดราคา", accessor: "Code" },
        { Header: "แบบ", accessor: "Ref2" },
        { Header: "ประเภทธนบัตร", accessor: "Ref3" },
        { Header: "สถาบัน", accessor: "Ref1" },
        { Header: "ศูนย์เงินสด", accessor: "Ref4" },
        { Header: "จำนวน", accessor: "Quantity", Cell: e => getFormatPrscen(e.original)},
        { Header: "หน่วยนับ", accessor: "BaseUnitType_Name" },
        { Header: "วันที่รับเข้า", accessor: "ProductionDate" },
        { Header: "Remark", accessor: "remark" },
    ];

    const columnsDetailSOU = [
        {
            Header: "สถานะ", accessor: "status", width: 40, Cell: e => getStatusGR(e.original),
            widthPDF: 5,
            CellPDF: value => {
                if (value.status === 1 || value.status === 3) return "Y";
                else if (value.status === 0)
                    return "";
                else return null;
            }
        },
        { Header: "เลขที่เอกสาร", accessor: "dcCode", Cell: e => getDoccode(e.original), widthPDF: 15 },
        { Header: "เลขที่ภาชนะ", accessor: "baseCode", widthPDF: 10, width: 150, },
        { Header: "แบบ", accessor: "diRef2" },
        { Header: "ประเภทธนบัตร", accessor: "diRef3" },
        { Header: "สถาบัน", accessor: "diRef1" },
        { Header: "ศูนย์เงินสด", accessor: "diRef4" },
        { Header: "จำนวนรับเข้า", accessor: "distoQty", widthPDF: 10, width: 120 },
        //{ Header: "Quantity Per Pallet", accessor: "distoQtyMax", widthPDF: 10, width: 120, },
        { Header: "หน่วยนับ", accessor: "distoUnitCode", widthPDF: 10, width: 70, },
        { Header: "หมายเหตุ", accessor: "remark", widthPDF: 10 },
        {
            Header: "วันที่รับเข้า", accessor: "diProductionDate",
            Cell: e => getFormatDatePro(e.original), widthPDF: 15,
            CellPDF: e => getFormatDatePro(e)
        }

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
        if (value.auditStatus != undefined) {
            return <div> <AmAuditStatus key={1} statusCode={value.auditStatus} /></div>
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
        if (value.status === 0)
            return <CheckCircleOutlineRoundedIcon style={{ color: "gray" }} />;
        else if (value.status === 1)
            return <CheckCircleOutlineRoundedIcon style={{ color: "orange" }} />;
        else if (value.status === 3)
            return <CheckCircleOutlineRoundedIcon style={{ color: "green" }} />;
        else return null;
    };

    const getOptError = (data) => {
        var qryStrOptions = queryString.parse(data.options);
        return <div style={{ textAlign: "center" }}>
            <label>{data.rootCode}</label>
            {qryStrOptions.err === null || qryStrOptions.err === undefined ? null : <IconButton
                aria-label="error"
                size="small"
                aria-label="info"
                style={{ marginLeft: "3px" }}
            >
                <WarningIcon
                    fontSize="small"
                    style={{ color: "#FFA726" }}
                    onClick={() =>
                        setDialogState({ type: "warning", content: qryStrOptions.err, state: true })
                    }
                />
            </IconButton>}

        </div>

    }
    const getDocID = () => {
        const values = queryString.parse(props.location.search);
        var ID = values.docID.toString();
        return ID;
    };

    const GetAuditStatus = (value) => {
        return <div> <AmAuditStatus key={1} statusCode={value.AuditStatus} /></div>
    };

    return (
        <>
            <AmPopup
                typePopup={dialogState.type}
                closeState={(e) => { setDialogState({ ...dialogState, state: false }) }}
                open={dialogState.state}
                content={dialogState.content}
            />
            {docview}
        </>

    );
};

export default PI_Detail;
