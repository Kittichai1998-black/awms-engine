import React, { useState } from "react";
//import MasterData from "../../pageComponent/MasterData";
import AmEntityStatus from "../../../components/AmEntityStatus";

import AmMaster from "../../pageComponent/AmMasterData/AmMaster";
import { EntityEventStatus } from "../../../components/Models/EntityStatus";

//======================================================================
const SKUMaster = props => {
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
            colStyle:{textAlign:"center"},
            Cell: e => getStatus(e.original)
        },
        {
            Header: "SKU Code",
            accessor: "Code",
            width: 155
        },
        {
            Header: "SKU Name",
            accessor: "Name",
            width: 250
        },
        { Header: "SKU Type", accessor: "SKUMasterType_Name", width: 130 },
        {
            Header: "  ShelfLife (%)",
            accessor: "ShelfLifePercent",
            width: 100,
            Cell: e => setPercen(e),
        },
        {
            Header: "Gross Weight",
            accessor: "WeightKG",
            width: 120,
            type: "number"
        },
        { Header: "Unit Type", accessor: "UnitTypeCode", width: 100 },
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
            field: "Code",
            type: "input",
            name: "SKU Code",
            placeholder: "Code",
            required: true
        },
        {
            field: "Name",
            type: "input",
            name: "SKU Name",
            placeholder: "Name",
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
            field: "ShelfLifePercent",
            type: "input",
            inputType: "number",
            name: "ShelfLife (%)",
            placeholder: "Gross Weight",
            validate: /^[0-9\.]+$/
        },
        {
            field: "WeightKG",
            type: "input",
            inputType: "number",
            name: "Gross Weight",
            placeholder: "Gross Weight",
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
        }
    ];

    const columnsEdit = [
        {
            field: "Code",
            type: "input",
            name: "SKU Code",
            placeholder: "Code",
            validate: /^.+$/,
            required: true
        },
        {
            field: "Name",
            type: "input",
            name: "SKU Name",
            placeholder: "Name",
            validate: /^.+$/,
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
            validate: /^.+$/,
            fieldValue: "ID",
        },
        {
            field: "ShelfLifePercent",
            type: "input",
            inputType: "number",
            name: "ShelfLife (%)",
            placeholder: "Gross Weight",
            validate: /^[0-9\.]+$/
        },
        {
            field: "WeightKG",
            type: "input",
            inputType: "number",
            name: "Gross Weight",
            placeholder: "Gross Weight",
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
            field: "Status",
            type: "dropdown",
            typeDropDown: "normal",
            name: "Status",
            dataDropDown: EntityEventStatus,
            placeholder: "Status"
        }
    ];
    const primarySearch = [
        {
            field: "Code",
            type: "input",
            name: "SKU Code",
            placeholder: "Code",
            validate: /^.+$/
        },
        {
            field: "Name",
            type: "input",
            name: "SKU Name",
            placeholder: "Name",
            validate: /^.+$/
        }
    ];
    const columnsFilter = [
        {
            field: "SKUMasterType_Name",
            type: "dropdown",
            typeDropDown: "search",
            name: "SKU Type",
            dataDropDown: SKUMasterTypeQuery,
            placeholder: "SKU Type",
            fieldLabel: ["Code", "Name"],
            fieldDataKey: "Name"
        },
        {
            field: "ShelfLifePercent",
            type: "input",
            inputType: "number",
            name: "ShelfLife (%)",
            placeholder: "Gross Weight",
            validate: /^[0-9\.]+$/
        },
        {
            field: "WeightKG",
            type: "input",
            inputType: "number",
            name: "Gross Weight",
            placeholder: "Gross Weight",
            validate: /^[0-9\.]+$/
        },
        {
            field: "UnitTypeCode",
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
        if (value.Status) {
            return <AmEntityStatus statusCode={value.Status} />;
        } else {
            return null;
        }
    };

    const setPercen = (e) => {
        if (e.original.ShelfLifePercent) {
            return e.original.ShelfLifePercent + '%'
        }
    }
    return (
            <AmMaster
                columnsFilterPrimary={primarySearch}
                columnsFilter={columnsFilter}
                tableQuery={"SKUMaster"}
                table={"ams_SKUMaster"}
                dataAdd={columns}
                history={props.history}
                columns={iniCols}
                dataEdit={columnsEdit}
                tableType="view"
                height={500}
                pageSize={25}
                updateURL={window.apipath + "/v2/InsUpdDataAPI"}
            />
    );
};

export default SKUMaster;
