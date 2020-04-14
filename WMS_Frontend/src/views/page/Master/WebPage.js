import React, { useState, useEffect, useContext } from "react";
import MasterData from "../../pageComponent/MasterData";
import AmMasterData from "../../pageComponent/MasterData";
import AmIconStatus from "../../../components/AmIconStatus";
import { Button } from "@material-ui/core";
import styled from "styled-components";
import AmInput from "../../../components/AmInput";
import Clone from "../../../components/function/Clone";
import AmButton from "../../../components/AmButton";
import Grid from "@material-ui/core/Grid";
import {
    apicall,
    createQueryString
} from "../../../components/function/CoreFunction";
import AmEntityStatus from "../../../components/AmEntityStatus";
const Axios = new apicall();

const WebPage = props => {
  
    const EntityEventStatus = [
        { label: "INACTIVE", value: 0 },
        { label: "ACTIVE", value: 1 }
    ];
    const PermissionQuery = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "Permission",
        q:
            '[{ "f": "Status", "c":"<", "v": 2}]',
        f: "*",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: ""
    };
    const WebPageGroupQuery = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "WebPageGroup",
        q:
            '[{ "f": "Status", "c":"<", "v": 2}]',
        f: "*",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: ""
    };
    const iniCols = [
        {
            Header: "",
            accessor: "Status",
            fixed: "left",
            width: 35,
            sortable: false,
            Cell: e => getStatus(e.original)
        },
        { Header: "Code", accessor: "Code", fixed: "left", width: 120 },
        { Header: "Name", accessor: "Name", width: 200 },
        { Header: "Seq No.", accessor: "Seq", width: 70 },
        { Header: "Path Level 1", accessor: "PathLV1", width: 100 },
        { Header: "Path Level 2", accessor: "PathLV2", width: 120 },
        { Header: "Path Level 3", accessor: "PathLV3", width: 120 },
        // { Header: "Description", accessor: "Description", width: 150 },
        { Header: "Web Page Group", accessor: "WebPageGroup_Code", width: 170 },
        { Header: "Permission", accessor: "Permission_Code", width: 300 },
        { Header: "Update By", accessor: "LastUpdateBy", width: 100 },
        {
            Header: "Update Time",
            accessor: "LastUpdateTime",
            width: 150,
            type: "datetime",
            dateFormat: "DD/MM/YYYY HH:mm"
        }
    ];

    const columnsAdd = [
        {
            field: "Code",
            type: "input",
            name: "Code",
            placeholder: "Code",
            required: true
        },
        {
            field: "Name",
            type: "input",
            name: "Name",
            placeholder: "Name",
            required: true
        },
        {
            field: "Seq",
            type: "input",
            inputType: "number",
            name: "Seq No.",
            placeholder: "Seq No.",
            required: true
        },
        {
            field: "PathLV1",
            type: "input",
            name: "Path Level 1",
            placeholder: "Path Level 1",
        },
        {
            field: "PathLV2",
            type: "input",
            name: "Path Level 2",
            placeholder: "Path Level 2",
        },
        {
            field: "PathLV3",
            type: "input",
            name: "Path Level 3",
            placeholder: "Path Level 3",
        },
        // {
        //     field: "Description",
        //     type: "input",
        //     name: "Description",
        //     placeholder: "Description",
        // },
        {
            field: "WebPageGroup",
            type: "dropdow",
            typeDropdow: "search",
            name: "WebPageGroup",
            dataDropDow: WebPageGroupQuery,
            fieldLabel: ["Code", "Name"],
            placeholder: "Web Page Group"
        },
    ];
    const columnsEdit = [
        {
            field: "Code",
            type: "input",
            name: "Code",
            placeholder: "Code",
            validate: /^.+$/,
            required: true
        },
        {
            field: "Name",
            type: "input",
            name: "Name",
            placeholder: "Name",
            validate: /^.+$/,
            required: true
        },
        {
            field: "Seq",
            type: "input",
            // inputType: "number",
            name: "Seq",
            placeholder: "Seq",
            validate: /^[0-9\.]+$/,
            required: true
        },
        {
            field: "PathLV1",
            type: "input",
            name: "Path Level 1",
            placeholder: "Path Level 1",
        },
        {
            field: "PathLV2",
            type: "input",
            name: "Path Level 2",
            placeholder: "Path Level 2",
        },
        {
            field: "PathLV3",
            type: "input",
            name: "Path Level 3",
            placeholder: "Path Level 3",
        },
        // {
        //     field: "Description",
        //     type: "input",
        //     name: "Description",
        //     placeholder: "Description",
        // },
        {
            field: "WebPageGroup_ID",
            type: "dropdow",
            typeDropdow: "search",
            name: "WebPageGroup",
            dataDropDow: WebPageGroupQuery,
            fieldLabel: ["Code", "Name"],
            placeholder: "Web Page Group"
        },
        {
            field: "Permission_ID",
            type: "dropdow",
            typeDropdow: "search",
            name: "Permission",
            dataDropDow: PermissionQuery,
            fieldLabel: ["Code"],
            placeholder: "Permission"
        },
        {
            field: "Status",
            type: "status",
            typeDropdow: "normal",
            name: "Status",
            dataDropDow: EntityEventStatus,
            placeholder: "Status"
        }
    ];
    const primarySearch = [
        {
            field: "Code",
            type: "input",
            name: "Code",
            placeholder: "Code"
        },
        {
            field: "Name",
            type: "input",
            name: "Name"
        }
    ];
    const columnsFilter = [
        {
            field: "Seq",
            type: "input",
            // inputType: "number",
            name: "Seq No.",
            placeholder: "Seq No.",
            required: true
        },
        {
            field: "PathLV1",
            type: "input",
            name: "Path Level 1",
            placeholder: "Path Level 1",
        },
        {
            field: "PathLV2",
            type: "input",
            name: "Path Level 2",
            placeholder: "Path Level 2",
        },
        {
            field: "PathLV3",
            type: "input",
            name: "Path Level 3",
            placeholder: "Path Level 3",
        },
        {
            field: "WebPageGroup_Code",
            type: "dropdow",
            typeDropdow: "search",
            name: "WebPageGroup",
            dataDropDow: WebPageGroupQuery,
            fieldLabel: ["Code", "Name"],
            fieldDataKey: "Code",
            placeholder: "Web Page Group"
        },
        {
            field: "Permission_Code",
            type: "dropdow",
            typeDropdow: "search",
            name: "Permission",
            dataDropDow: PermissionQuery,
            fieldLabel: ["Code"],
            fieldDataKey: "Code",
            placeholder: "Permission"
        },
        {
            field: "Status",
            type: "status",
            typeDropdow: "normal",
            name: "Status",
            dataDropDow: EntityEventStatus,
            placeholder: "Status"
        },
        {
            field: "LastUpdateBy",
            type: "input",
            name: "Update By",
            placeholder: "Update By"
        },
        {
            field: "LastUpdateTime",
            type: "dateFrom",
            name: "Update From",
            placeholder: "Update Time From"
        },
        {
            field: "LastUpdateTime",
            type: "dateTo",
            name: "Update To",
            placeholder: "Update Time To"
        }
    ];
    const getStatus = value => {
        if (value.Status === "0" || value.Status === 0) {
            return <AmEntityStatus key={0} statusCode={0} />;
        } else if (value.Status === "1" || value.Status === 1) {
            return <AmEntityStatus key={1} statusCode={1} />;
        } else if (value.Status === "2" || value.Status === 2) {
            return <AmEntityStatus key={2} statusCode={2} />;
        } else {
            return null;
        }
    };
    return (
        <div>
            <AmMasterData
                columnsFilterPrimary={primarySearch}
                columnsFilter={columnsFilter}
                tableQuery={"WebPage"}
                table={"ams_WebPage"}
                dataAdd={columnsAdd}
                iniCols={iniCols}
                dataEdit={columnsEdit}
                history={props.history}
            />
        </div>
    );
}

export default WebPage;