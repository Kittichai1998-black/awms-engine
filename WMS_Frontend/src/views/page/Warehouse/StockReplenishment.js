import React, { useState } from "react";
//import MasterData from "../../pageComponent/MasterData";
import AmEntityStatus from "../../../components/AmEntityStatus";

import AmMaster from "../../pageComponent/AmMasterData/AmMaster";
import { EntityEventStatus } from "../../../components/Models/EntityStatus";

//======================================================================
const StockReplenishment = props => {

    const UnitTypeQuery = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "UnitType",
        q:
            '[{ "f": "Status", "c":"<", "v": 2},{ "f": "ObjectType", "c":"=", "v": 2}]',
        f: "*",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: ""
    };

    const SKUMasterQuery= {
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

    const PackMasterQuery = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "PackMaster",
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
            fixed: "left",
            fixWidth: 162,
            filterType: "dropdown",
            filterConfig: {
                filterType: "dropdown",
                dataDropDown: EntityEventStatus,
                typeDropDown: "normal"
            },
            Cell: e => getStatus(e.original)
        },
        {
            Header: "SKU Code",
            accessor: "SKU_Code",
            width: 155
        },
        {
            Header: "SKU Name",
            accessor: "SKU_Name",
            width: 250
        },

        {
            Header: "Pack Code",
            accessor: "Pack_Code",
            width: 155
        },
        {
            Header: "Pack Name",
            accessor: "Pack_Name",
            width: 250
        },
        { Header: "Min Quantity", accessor: "MinQuantity", width: 100 },
        { Header: "Max Quantity", accessor: "MaxQuantity", width: 100 },
        { Header: "Unit Type", accessor: "UnitType_Code", width: 100 },
        { Header: "Start Date", accessor: "StartDate", width: 100, type: "datetime", dateFormat: "DD/MM/YYYY HH:mm"},
        { Header: "End Date", accessor: "EndDate", width: 100, type: "datetime", dateFormat: "DD/MM/YYYY HH:mm"},
        { Header: "Update By", accessor: "LastUpdateBy", width: 100 },
        {
            Header: "Update Time",
            accessor: "LastUpdateTime",
            width: 130,
            type: "datetime",
            dateFormat: "DD/MM/YYYY HH:mm"
        }
    ];
    const columns = [

        {
            field: "SKU_ID",
            type: "dropdown",
            typeDropDown: "search",
            name: "SKUMaster",
            dataDropDown: SKUMasterQuery,
            placeholder: "SKU",
            fieldLabel: ["Code", "Name"],
            fieldValue: "ID",
        },
        {
            field: "Pack_ID",
            type: "dropdown",
            typeDropDown: "search",
            name: "PackMaster",
            dataDropDown: PackMasterQuery,
            placeholder: "Pack",
            fieldLabel: ["Code", "Name"],
            fieldValue: "ID",
        },
        {
            field: "MinQuantity",
            type: "input",
            inputType: "number",
            name: "Min Quantity",
            placeholder: "Min Quantity",
            validate: /^[0-9\.]+$/
        },
        {
            field: "MaxQuantity",
            type: "input",
            inputType: "number",
            name: "Max Quantity",
            placeholder: "Max Quantity",
            validate: /^[0-9\.]+$/
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
        },
        {
            field: "StartDate",
            type: "date",
            name: "Start Date",

        },
        {
            field: "EndDate",
            type: "date",
            name: "End Date",

        }
    ];

    const columnsEdit = [

        {
            field: "SKU_ID",
            type: "dropdown",
            typeDropDown: "search",
            name: "SKUMaster",
            dataDropDown: SKUMasterQuery,
            placeholder: "SKU",
            fieldLabel: ["Code", "Name"],
            fieldValue: "ID",
        },
        {
            field: "Pack_ID",
            type: "dropdown",
            typeDropDown: "search",
            name: "PackMaster",
            dataDropDown: PackMasterQuery,
            placeholder: "Pack",
            fieldLabel: ["Code", "Name"],
            fieldValue: "ID",
        },
        {
            field: "MinQuantity",
            type: "input",
            inputType: "number",
            name: "Min Quantity",
            placeholder: "Min Quantity",
            validate: /^[0-9\.]+$/
        },
        {
            field: "MaxQuantity",
            type: "input",
            inputType: "number",
            name: "Max Quantity",
            placeholder: "Max Quantity",
            validate: /^[0-9\.]+$/
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
        },
        {
            field: "StartDate",
            type: "date",
            name: "Start Date",

        },
        {
            field: "EndDate",
            type: "date",
            name: "End Date",
        }
    ];
    //const primarySearch = [
    //    {
    //        field: "Code",
    //        type: "input",
    //        name: "SKU Code",
    //        placeholder: "Code",
    //        validate: /^.+$/
    //    },
    //    {
    //        field: "Name",
    //        type: "input",
    //        name: "SKU Name",
    //        placeholder: "Name",
    //        validate: /^.+$/
    //    }
    //];
    //const columnsFilter = [
    //    {
    //        field: "SKUMasterType_Name",
    //        type: "dropdown",
    //        typeDropDown: "search",
    //        name: "SKU Type",
    //        dataDropDown: SKUMasterTypeQuery,
    //        placeholder: "SKU Type",
    //        fieldLabel: ["Code", "Name"],
    //        fieldDataKey: "Name"
    //    },
    //    {
    //        field: "WeightKG",
    //        type: "input",
    //        inputType: "number",
    //        name: "Gross Weight",
    //        placeholder: "Gross Weight",
    //        validate: /^[0-9\.]+$/
    //    },
    //    {
    //        field: "UnitTypeCode",
    //        type: "dropdown",
    //        typeDropDown: "search",
    //        name: "Unit Type",
    //        dataDropDown: UnitTypeQuery,
    //        placeholder: "Unit Type",
    //        fieldLabel: ["Code", "Name"],
    //        fieldDataKey: "Code"
    //    },
    //    {
    //        field: "Status",
    //        type: "dropdown",
    //        typeDropDown: "normal",
    //        name: "Status",
    //        dataDropDown: EntityEventStatus,
    //        placeholder: "Status"
    //    },
    //    {
    //        field: "LastUpdateBy",
    //        type: "input",
    //        name: "Update By",
    //        placeholder: "Update By"
    //    },
    //    {
    //        field: "LastUpdateTime",
    //        type: "dateFrom",
    //        name: "Update From",
    //        placeholder: "Update Time From"
    //    },
    //    {
    //        field: "LastUpdateTime",
    //        type: "dateTo",
    //        name: "Update To",
    //        placeholder: "Update Time To"
    //    }
    //];
    const getStatus = value => {
        if (value.Status) {
            return <AmEntityStatus statusCode={value.Status} />;
        } else {
            return null;
        }
    };

    return (
        <div>
            <AmMaster
                //columnsFilterPrimary={primarySearch}
                //columnsFilter={columnsFilter}
                tableQuery={"StockBalance"}
                table={"ams_StockBalance"}
                dataAdd={columns}
                history={props.history}
                columns={iniCols}
                dataEdit={columnsEdit}
                tableType="view"
                height={500}
                pageSize={25}
                updateURL={window.apipath + "/v2/InsUpdDataAPI"}
            />
        </div>
    );
};

export default StockReplenishment;
