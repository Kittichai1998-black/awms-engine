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
                TextBtnCreateputAway={'Creare PutAway'}
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
            >
            </DocView>
            )
        }

    }, [header])

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
                { label: "Product Owner", value: "ProductOwnerCode", values: "ProductOwnerName" },
                { label: "Des Area", value: "DesAreaMasterCode", values: "DesAreaMasterName" }
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
        { Header: "?????????????????????????????????", accessor: "BaseCode" },
        {
            Header: "????????????????????????",
            Cell: e => { return e.original.SKUMaster_Code },
            CellPDF: e => { return e.SKUMaster_Code }, widthPDF: 40
        },
        { Header: "?????????????????????????????????", accessor: "Code" },
        { Header: "????????????????????????", accessor: "Code" },
        { Header: "?????????", accessor: "Ref2" },
        { Header: "????????????????????????????????????", accessor: "Ref3" },
        { Header: "??????????????????", accessor: "Ref1" },
        { Header: "?????????????????????????????????", accessor: "Ref4" },
        { Header: "???????????????", accessor: "Quantity" },
        { Header: "????????????????????????", accessor: "BaseUnitType_Name" },
        { Header: "???????????????????????????????????????", accessor: "ProductionDate" },
        { Header: "Remark", accessor: "remark" },
    ];




    const columnsDetailSOU = [
        {
            Header: "???????????????", accessor: "status", width: 40, Cell: e => getStatusGR(e.original),
            widthPDF: 5,
            CellPDF: value => {
                if (value.status === 1 || value.status === 3) return "Y";
                else if (value.status === 0)
                    return "";
                else return null;
            }
        },
        { Header: "????????????????????????????????????", accessor: "dcCode", Cell: e => getDoccode(e.original), widthPDF: 15 },
        { Header: "?????????????????????????????????", accessor: "baseCode", widthPDF: 10, width: 150, },
        { Header: "?????????", accessor: "diRef2" },
        { Header: "????????????????????????????????????", accessor: "diRef3" },
        { Header: "??????????????????", accessor: "diRef1" },
        { Header: "?????????????????????????????????", accessor: "diRef4" },
        { Header: "????????????????????????????????????", accessor: "distoQty", widthPDF: 10, width: 120 },
        //{ Header: "Quantity Per Pallet", accessor: "distoQtyMax", widthPDF: 10, width: 120, },
        { Header: "????????????????????????", accessor: "distoUnitCode", widthPDF: 10, width: 70, },
        { Header: "????????????????????????", accessor: "remark", widthPDF: 10 },
        {
            Header: "???????????????????????????????????????", accessor: "diProductionDate",
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
        console.log(value.diAuditStatus)
        if (value.diAuditStatus != undefined) {
            return <div> <AmAuditStatus key={1} statusCode={value.diAuditStatus} /></div>
        } else if (value.AuditStatus != undefined) {
            return <div> <AmAuditStatus key={1} statusCode={value.AuditStatus} /></div>
        }
    };


    const getDocID = () => {
        const values = queryString.parse(props.location.search);
        var ID = values.docID.toString();
        return ID;
    };



    return (
        <div>
            <div>{docview}</div>
        </div>

    );
};

export default GR_Detail;
