import React, { useState, useEffect, useContext } from "react";

import {
    apicall,
    createQueryString
} from "../../../../components/function/CoreFunction";
import AmSearchDocument from "../../../pageComponent/AmSearchDocumentV2/AmSearchDocumentV2";

import AmDocumentStatus from "../../../../components/AmDocumentStatus";
import AmRediRectInfo from "../../../../components/AmRedirectInfo";
import IconButton from "@material-ui/core/IconButton";
import ErrorIcon from "@material-ui/icons/Error";
import { useTranslation } from 'react-i18next'
import AmPopup from "../../../../components/AmPopup";
import { DocumentEventStatus } from "../../../../components/Models/DocumentEventStatus";
import { DataGeneratePopup, DataGenerateStatus } from "../../../pageComponent/AmSearchDocumentV2/SetPopup";
const Axios = new apicall();

//======================================================================
const DocumentSearch = props => {
    const { t } = useTranslation()
    const [dialogState, setDialogState] = useState({});
    const MVTQuery = {
        queryString: window.apipath + "/v2/SelectDataViwAPI/",
        t: "DocumentProcessTypeMap",
        q: '[{ "f": "Status", "c":"=", "v": 1},{ "f": "DocumentType_ID", "c":"=", "v": 1002}]',
        f: "ID,Code,ReProcessType_Name as Name",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: "",
    }
    const productOwner = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "ProductOwner",
        q: '[{ "f": "Status", "c":"<", "v": 2},{ "f": "ID", "c":"in", "v":"' + localStorage.getItem("User_ProductOwner") + '"}]',
        f: "*",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: ""
    };
    const GeneratePopup = (data) => {
        var dataGenerate = DataGeneratePopup(data)
        var dataGenerateStatus = DataGenerateStatus(data)

        return <div style={{ textAlign: "center" }}>
            <AmDocumentStatus key={dataGenerateStatus[0].status} statusCode={dataGenerateStatus[0].statusValue} />{" "}
            {dataGenerate[0].label !== "error" ? null : <IconButton
                aria-label="error"
                size="small"
                aria-label="info"
                style={{ marginLeft: "3px" }}
            >
                <ErrorIcon
                    fontSize="small"
                    style={{ color: "#E53935" }}
                    onClick={() =>
                        setDialogState({ type: "error", content: dataGenerate[0].value, state: true })
                    }
                />
            </IconButton>}

        </div>

    };
    const iniCols = [

        {
            Header: t("Status"), accessor: "EventStatus", width: 150,
            filterType: "dropdown",
            filterConfig: {
                filterType: "dropdown",
                dataDropDown: DocumentEventStatus,
                typeDropDown: "normal",
                widthDD: 150,
            },
            Cell: dataRow => GeneratePopup(dataRow.original)
        },
        { Header: t("Doc No."), accessor: "Code", width: 150, sortable: false, Cell: dataRow => getRedirect(dataRow.original) },
        {
            Header: t("Process No."),
            accessor: "ReDocumentProcessTypeName",
            width: 200,
            sortable: false,
            filterType: "dropdown",
            filterConfig: {
                filterType: "dropdown",
                fieldLabel: ["Code", "Name"],
                dataDropDown: MVTQuery,
                typeDropDown: "normal",
                widthDD: 250,
            },
        },
        {
            Header: t('Product Owner'), accessor: 'ProductOwnerCode',
            width: 100, sortable: false, filterType: "dropdown",
            filterConfig: {
                fieldDataKey: "Code",
                filterType: "dropdown",
                fieldLabel: ["Code", "Name"],
                dataDropDown: productOwner,
                typeDropDown: "normal",
                widthDD: 180,
            },
        },
        { Header: t("Sou. Warehouse"), accessor: "SouWarehouseName", filterable: false, width: 150 },
        { Header: t("Des. Warehouse"), accessor: "DesWarehouseName", filterable: false, width: 150 },
        {
            Header: t("Doc. Date"),
            accessor: "DocumentDate",
            width: 150,
            type: "datetime",
            filterType: "datetime",
            filterConfig: {
                filterType: "datetime",
            },
            dateFormat: "DD/MM/YYYY"
            , customFilter: { field: "DocumentDate" }
        },
        {
            Header: t("Action Time"),
            accessor: "ActionTime",
            width: 150,
            type: "datetime",
            filterType: "datetime",
            filterConfig: {
                filterType: "datetime",
            },
            dateFormat: "DD/MM/YYYY HH:mm", customFilter: { field: "ActionTime" }
        },
        {
            Header: t("Create Time"), accessor: "Created", width: 200,
            filterType: "datetime",
            filterConfig: {
                filterType: "datetime",
            },
            dateFormat: "DD/MM/YYYY HH:mm", customFilter: { field: "CreateTime" }
        },
        {
            Header: t("Modify Time"), accessor: "LastUpdate", width: 200,
            filterable: false,
        }
    ];


    const getRedirect = data => {
        return (
            <div style={{ display: "flex", padding: "0px", paddingLeft: "10px" }}>
                {data.Code}
                <AmRediRectInfo
                    api={"/issue/pickingdetail?docID=" + data.ID}
                    history={props.history}
                    docID={""}
                >
                    {" "}
                </AmRediRectInfo>
            </div>
        );
    };

    return (
        <>
            <AmPopup
                typePopup={dialogState.type}
                closeState={(e) => { setDialogState({ ...dialogState, state: false }) }}
                open={dialogState.state}
                content={dialogState.content}
            />

            <AmSearchDocument
                iniCols={iniCols}
                docTypeCode="1002"
                buttonClose={true}
                buttonReject={false}
                apiReject={"/v2/reject_document"}
                apiClose={"/v2/closed_document_manual"}
            />
        </>
    );
};

export default DocumentSearch;
