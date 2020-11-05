import React from "react";
//import MasterData from "../../pageComponent/MasterData";
import AmEntityStatus from "../../../components/AmEntityStatus";
import AmMaster from "../../pageComponent/AmMasterData/AmMaster";
import {EntityEventStatus} from "../../../components/Models/EntityStatus";

const WebPage = props => {

    const PermissionQuery = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "Permission",
        q: '[{ "f": "Status", "c":"<", "v": 2}]',
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
        q: '[{ "f": "Status", "c":"<", "v": 2}]',
        f: "*",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: ""
    };
    const iniCols = [
        {
            Header: "Status",
            accessor: "Status",
            fixWidth: 162,
            sortable: false,
            filterType:"dropdown",
            colStyle:{textAlign:"center"},
            filterConfig:{
              filterType:"dropdown",
              dataDropDown:EntityEventStatus,
              typeDropDown:"normal",
              width:120
            },
            Cell: e => getStatus(e.original)
          },
        { Header: "Code", accessor: "Code", width: 120 },
        { Header: "Name", accessor: "Name", width: 200 },
        { Header: "Seq No.", accessor: "Seq", width: 70 },
        { Header: "Path Level 1", accessor: "PathLV1", width: 100 },
        { Header: "Path Level 2", accessor: "PathLV2", width: 120 },
        { Header: "Path Level 3", accessor: "PathLV3", width: 120 },
        { Header: "Icon", accessor: "Icon", width: 150 },
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
            required: true
        },
        {
            field: "PathLV2",
            type: "input",
            name: "Path Level 2",
            placeholder: "Path Level 2",
            required: true
        },
        {
            field: "PathLV3",
            type: "input",
            name: "Path Level 3",
            placeholder: "Path Level 3",
        },
        {
            field: "Icon",
            type: "input",
            name: "Icon",
            placeholder: "Icon",
        },
        {
            field: "WebPageGroup_ID",
            type: "dropdown",
            typeDropDown: "search",
            name: "WebPageGroup_ID",
            dataDropDown: WebPageGroupQuery,
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
        {
            field: "Icon",
            type: "input",
            name: "Icon",
            placeholder: "Icon",
        },
        {
            field: "WebPageGroup_ID",
            type: "dropdown",
            typeDropDown: "search",
            name: "WebPageGroup",
            dataDropDown: WebPageGroupQuery,
            fieldLabel: ["Code", "Name"],
            placeholder: "Web Page Group"
        },
        {
            field: "Permission_ID",
            type: "dropdown",
            typeDropDown: "search",
            name: "Permission",
            dataDropDown: PermissionQuery,
            fieldLabel: ["Code"],
            placeholder: "Permission"
        },
        // {
        //     field: "Status",
        //     type: "status",
        //     typeDropDown: "normal",
        //     name: "Status",
        //     dataDropDown: EntityEventStatus,
        //     placeholder: "Status"
        // }
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
            type: "dropdown",
            typeDropDown: "search",
            name: "WebPageGroup",
            dataDropDown: WebPageGroupQuery,
            fieldLabel: ["Code", "Name"],
            fieldDataKey: "Code",
            placeholder: "Web Page Group"
        },
        {
            field: "Permission_Code",
            type: "dropdown",
            typeDropDown: "search",
            name: "Permission",
            dataDropDown: PermissionQuery,
            fieldLabel: ["Code"],
            fieldDataKey: "Code",
            placeholder: "Permission"
        },
        {
            field: "Status",
            type: "dropdown",
            typeDropDown: "normal",
            name: "Status",
            dataDropDown: EntityEventStatus,
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
            <AmMaster
                columnsFilterPrimary={primarySearch}
                columnsFilter={columnsFilter}
                tableQuery={"WebPage"}
                table={"ams_WebPage"}
                dataAdd={columnsAdd}
                history={props.history}
                columns={iniCols}
                dataEdit={columnsEdit}
                tableType="view"
                height={500}
                pageSize={25}
                updateURL={window.apipath + "/v2/InsUpdDataAPI"}
            />
    );
}

export default WebPage;