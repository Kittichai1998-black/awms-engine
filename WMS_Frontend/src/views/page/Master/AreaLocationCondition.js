import React from "react";
import AmEntityStatus from "../../../components/AmEntityStatus";
import AmMaster from "../../pageComponent/AmMasterData/AmMaster";
import { EntityEventStatus } from "../../../components/Models/EntityStatus";

//======================================================================
const AreaLocationCondition = props => {

    const AreaMasterQuery = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "AreaLocationCondition",
        q: '[{ "f": "Status", "c":"<", "v": 2}]',
        f: "*",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: ""
    };
    const UnitTypeQuery = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "UnitType",
        q: '[{ "f": "Status", "c":"<", "v": 2}]',
        f: "*",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: ""
    };


    const SKUMasterQuery = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "SKUMaster",
        q: '[{ "f": "Status", "c":"<", "v": 2}]',
        f: "*",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: ""
    };

    const SKUMasterTypeQuery = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "SKUMasterType",
        q: '[{ "f": "Status", "c":"<", "v": 2}]',
        f: "*",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: ""
    };



    const EntityEventStatus = [
        { label: "INACTIVE", value: 0 },
        { label: "ACTIVE", value: 1 }
    ];

    const iniCols = [
        {
            Header: "Status",
            accessor: "Status",
            fixed: "left",
            fixWidth: 162,
            sortable: false,
            filterType: "dropdown",
            filterConfig: {
                filterType: "dropdown",
                dataDropDown: EntityEventStatus,
                typeDropDown: "normal"
            },
            Cell: e => getStatus(e.original)
        },
        { Header: "Priority", accessor: "Priority"},   
        { Header: "Bank", accessor: "LocationBankNumRange" },
        { Header: "Bay", accessor: "LocationBayNumRange" },
        { Header: "Level", accessor: "LocationLvNumRange"},
        { Header: "SKU Code", accessor: "SKU_Code" },
        { Header: "SKU Name", accessor: "SKU_Name" },
        { Header: "SKUType", accessor: "SKUType_Name" },
        { Header: "Unit Type", accessor: "UnitType_Code"},
        { Header: "Update By", accessor: "LastUpdateBy", width: 100 },
        {
            Header: "Update Time",
            accessor: "LastUpdateTime",
            width: 120,
            type: "datetime",
            dateFormat: "DD/MM/YYYY HH:mm"
        }
    ];
    const columns = [
        {
            field: "Priority",
            type: "input",
            name: "Priority",
            placeholder: "Priority",
            validate: /^[0-9\.]+$/,
            required: true
        },
        {
            field: "Bank",
            type: "input",
            name: "Bank",
            placeholder: "Bank",
            validate: /^[0-9\.]+$/
        },
        {
            field: "Bay",
            type: "input",
            name: "Bay",
            placeholder: "Bay",
            validate: /^[0-9\.]+$/
        },
        {
            field: "Level",
            type: "input",
            name: "Level",
            placeholder: "Level",
            validate: /^[0-9\.]+$/
        },
        {
            field: "SKUMaster_ID",
            type: "dropdown",
            typeDropDown: "search",
            name: "SKU Master",
            dataDropDown: SKUMasterQuery,
            placeholder: "SKU Master",
            fieldLabel: ["Code", "Name"],
            required: true
        }, 
        {
            field: "SKUMasterType_ID",
            type: "dropdown",
            typeDropDown: "search",
            name: "SKU Type",
            dataDropDown: SKUMasterTypeQuery,
            placeholder: "SKU Type",
            fieldLabel: ["Code", "Name"],
            fieldValue: "ID",
        },
        {
            field: "UnitType_ID",
            type: "dropdown",
            typeDropDown: "search",
            name: "Unit Type",
            dataDropDown: UnitTypeQuery,
            placeholder: "Unit Type",
            fieldLabel: ["Code", "Name"],
            fieldValue: "ID",
        }  
    ];

    const columnsEdit = [
        {
            field: "Priority",
            type: "input",
            name: "Priority",
            placeholder: "Priority",
            validate: /^[0-9\.]+$/,
            required: true
        },
    
        {
            field: "LocationBankNumRange",
            type: "input",
            name: "Bank",
            placeholder: "Bank",
            validate: /^[0-9\.]+$/
        },
        {
            field: "LocationBayNumRange",
            type: "input",
            name: "Bay",
            placeholder: "Bay",
            validate: /^[0-9\.]+$/
        },
        {
            field: "LocationLvNumRange",
            type: "input",
            name: "Level",
            placeholder: "Level",
            validate: /^[0-9\.]+$/
        },
        {
            field: "SKU_Code",
            type: "input",
            name: "SKU Code",
            placeholder: "SKU Code",
            validate: /^[0-9\.]+$/
        },
        {
            field: "SKU_Name",
            type: "input",
            name: "SKU Name",
            placeholder: "SKU Name",
            validate: /^[0-9\.]+$/
        },
        {
            field: "SKUType_Name",
            type: "dropdown",
            typeDropDown: "search",
            name: "SKU Type",
            dataDropDown: SKUMasterTypeQuery,
            placeholder: "SKU Type",
            fieldLabel: ["Code", "Name"],
            validate: /^.+$/,
            fieldValue: "ID",
        },
        {
            field: "UnitType_Code",
            type: "dropdown",
            typeDropDown: "search",
            name: "Unit Type",
            dataDropDown: UnitTypeQuery,
            placeholder: "Unit Type",
            fieldLabel: ["Code", "Name"],
            fieldValue: "ID",
            required: true
        },     
          {
            field: "Status",
            type: "dropdown",
            typeDropDown: "normal",
            name: "Status",
            dataDropDown: EntityEventStatus,
            placeholder: "Status"
        }
    ];
    const columnsFilterPri = [
        { field: "Code", type: "input", name: "Code", placeholder: "Code" },
        { field: "Name", type: "input", name: "Name", placeholder: "Name" }
    ];
    const columnsFilter = [
        {
            field: "AreaCode",
            type: "dropdown",
            typeDropDown: "search",
            name: "Area Code",
            dataDropDown: AreaMasterQuery,
            placeholder: "Area Code",
            fieldLabel: ["Code", "Name"],
            fieldDataKey: "Code"
        },
        { field: "Gate", type: "input", name: "Gate", placeholder: "Gate" },
        { field: "Bank", type: "input", name: "Bank", placeholder: "Bank" },
        { field: "Bay", type: "input", name: "Bay", placeholder: "Bay" },
        { field: "Level", type: "input", name: "Level", placeholder: "Level" },
        {
            field: "UnitType_Code",
            type: "dropdown",
            typeDropDown: "search",
            name: "Unit Type",
            dataDropDown: UnitTypeQuery,
            placeholder: "Unit Type",
            fieldLabel: ["Code", "Name"],
            fieldDataKey: "Code"
        },
        {
            field: "Status",
            type: "status",
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
        <div>
            {/* <MasterData
        columnsFilter={columnsFilter}
        columnsFilterPrimary={columnsFilterPri}
        tableQuery={"AreaLocationMaster"}
        table={"ams_AreaLocationMaster"}
        dataAdd={columns}
        iniCols={iniCols}
        dataEdit={columnsEdit}
        history={props.history}
      /> */}
            <AmMaster
                columnsFilterPrimary={columnsFilterPri}
                columnsFilter={columnsFilter}
                tableQuery={"AreaLocationCondition"}
                table={"ams_AreaLocationCondition"}
                dataAdd={columns}
                history={props.history}
                columns={iniCols}
                dataEdit={columnsEdit}
                tableType="view"
                pageSize={25}
                updateURL={window.apipath + "/v2/InsUpdDataAPI"}
            />
        </div>
    );
};

export default AreaLocationCondition;
