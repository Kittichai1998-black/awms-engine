import React from "react";
//import MasterData from "../../pageComponent/MasterData";
import AmEntityStatus from "../../../components/AmEntityStatus";
import AmMaster from "../../pageComponent/AmMasterData/AmMaster";
import { EntityEventStatus } from "../../../components/Models/EntityStatus";
import PrintIcon from '@material-ui/icons/Print';
import AmToolTip from "../../../components/AmToolTip";
import IconButton from "@material-ui/core/IconButton";
import { apicall } from '../../../components/function/CoreFunction'
const Axios = new apicall();

//======================================================================
const BaseMaster = props => {
  const BaseMasterTypeQuery = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "BaseMasterType",
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
    q: '[{ "f": "Status", "c":"<", "v": 2},{ "f": "ID", "c":"=", "v": 2}]',
    f: "*",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: ""
  };
  const ObjectSizeQuery = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "ObjectSize",
    q:
      '[{ "f": "Status", "c":"<", "v": 2},{ "f": "ObjectType", "c":"=", "v": 1}]',
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
      sortable: false,
      filterType: "dropdown",
      colStyle: { textAlign: "center" },
      filterConfig: {
        filterType: "dropdown",
        dataDropDown: EntityEventStatus,
        typeDropDown: "normal"
      },
      Cell: e => getStatus(e.original)
    },
    { Header: "Code", accessor: "Code", width: 120 },
    { Header: "Name", accessor: "Name", width: 150 },
    { Header: "Base Type", accessor: "BaseMasterType_Code", width: 200 },
    { Header: "Size", accessor: "ObjectSize_Code", width: 200 },
    { Header: "Unit Type", accessor: "UnitType_Code", width: 100 },
    { Header: "WeightKG", accessor: "WeightKG", width: 100, type: "number" },
    { Header: "Remark", accessor: "Description", width: 120 },
    { Header: "Update By", accessor: "LastUpdateBy", width: 100 },
    {
      Header: "Update Time",
      accessor: "LastUpdateTime",
      width: 120,
      type: "datetime",
      dateFormat: "DD/MM/YYYY HH:mm"
    },
  ];
  const columns = [
    // {
    //   field: "Checkbox",
    //   type: "checkbox",
    //   name: "Checkbox",
    //   placeholder: "",
    // },
    // {
    //   field: "CodeStart",
    //   type: "input",
    //   name: "Code Start",
    //   placeholder: "Code",
    //   disableCustom: true,

    // },
    // {
    //   field: "CodeEnd",
    //   type: "input",
    //   name: "Code End",
    //   placeholder: "Code",
    //   disableCustom: true,
    // },
    {
      field: "Code",
      type: "input",
      name: "Code",
      placeholder: "Code",
      disableCustom: true,
    },
    {
      field: "Name",
      type: "input",
      name: "Name",
      placeholder: "Name",
      required: true
    },
    {
      field: "WeightKG",
      type: "input",
      name: "WeightKG",
      placeholder: "WeightKG",
      validate: /^[0-9\.]+$/
    },
    {
      field: "BaseMasterType_ID",
      type: "dropdown",
      typeDropDown: "search",
      name: "Base Type",
      dataDropDown: BaseMasterTypeQuery,
      placeholder: "Base Type",
      fieldLabel: ["Code", "Name"],
      required: true
    },
    {
      field: "ObjectSize_ID",
      type: "dropdown",
      typeDropDown: "search",
      name: "Size",
      dataDropDown: ObjectSizeQuery,
      placeholder: "Size",
      fieldLabel: ["Code", "Name"],
      required: true
    },
    {
      field: "UnitType_ID",
      type: "dropdown",
      typeDropDown: "search",
      name: "Unit Type",
      dataDropDown: UnitTypeQuery,
      placeholder: "Unit Type",
      fieldLabel: ["Code", "Name"],
      required: true
    },
    {
        field: "Description",
        type: "input",
        name: "Remark",
        placeholder: "Remark",
    }
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
      field: "WeightKG",
      type: "input",
      name: "WeightKG",
      placeholder: "WeightKG",
      validate: /^[0-9\.]+$/
    },
    {
      field: "BaseMasterType_ID",
      type: "dropdown",
      typeDropDown: "search",
      name: "Base Type",
      dataDropDown: BaseMasterTypeQuery,
      placeholder: "Base Type",
      fieldLabel: ["Code", "Name"],
      fieldValue: "ID",
      required: true
    },
    {
      field: "ObjectSize_ID",
      type: "dropdown",
      typeDropDown: "search",
      name: "Size",
      dataDropDown: ObjectSizeQuery,
      placeholder: "Size",
      fieldLabel: ["Code", "Name"],
      fieldValue: "ID",
      required: true
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
      required: true
    },
    {
      field: "Status",
      type: "dropdown",
      typeDropDown: "normal",
      fieldValue: "value",
      name: "Status",
      dataDropDown: EntityEventStatus,
      placeholder: "Status"
    },
    {
        field: "Description",
        type: "input",
        name: "Remark",
        placeholder: "Remark",
    }
  ];
  const primarySearch = [
    { field: "Code", type: "input", name: "Code", placeholder: "Code" },
    { field: "Name", type: "input", name: "Name", placeholder: "Name" }
  ];
  const columnsFilter = [
    {
      field: "WeightKG",
      type: "input",
      name: "WeightKG",
      placeholder: "WeightKG",
      validate: /^[0-9\.]+$/
    },
    {
      field: "BaseMasterType_Code",
      type: "dropdown",
      typeDropDown: "search",
      name: "Base Type",
      dataDropDown: BaseMasterTypeQuery,
      placeholder: "Base Type",
      fieldLabel: ["Code", "Name"],
      fieldDataKey: "Code"
    },
    {
      field: "ObjectSize_Code",
      type: "dropdown",
      typeDropDown: "search",
      name: "Size",
      dataDropDown: ObjectSizeQuery,
      placeholder: "Size",
      fieldLabel: ["Code", "Name"],
      fieldDataKey: "Code"
    },
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


  const handleClickPrintbarcode = async (value) => {
    try {
      let reqjson = {
        "layoutType": 0,
        "listsCode": [
          {
            "code": value.Code
          }
        ]
      }

      await Axios.postload(window.apipath + "/v2/download/print_tag_code", reqjson, "printcode.pdf", "preview").then();

    } catch (err) {
      console.log(err)
    }
  }

  const customActions = [
    {
      label: <label style={{ marginBottom: 0 }}><PrintIcon fontSize="small" style={{ marginRight: 5 }} />{"Print Barcode"}</label>,
      action: (data, custom) => { onPrintBarcode(data); custom(true) }
    },
  ];
  const onPrintBarcode = async (dataSel) => {
    try {
      let listCode = [];
      if (dataSel && dataSel.length > 0) {
        dataSel.forEach(x => {
          listCode.push({ "code": x.Code });
        });
        let reqjson = {
          "layoutType": 0,
          "listsCode": listCode
        }
        await Axios.postload(window.apipath + "/v2/download/print_tag_code", reqjson, "printbarcode.pdf", "preview").then();
      }
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <>
      {/* <MasterData
        columnsFilterPrimary={primarySearch}
        columnsFilter={columnsFilter}
        tableQuery={"BaseMaster"}
        table={"ams_BaseMaster"}
        dataAdd={columns}
        iniCols={iniCols}
        dataEdit={columnsEdit}
        history={props.history}
        //======= MultyBase  ========
        prefix={2}
        baseLength={10}
        checked={isLoad}
      /> */}
      <AmMaster
        columnsFilterPrimary={primarySearch}
        columnsFilter={columnsFilter}
        tableQuery={"BaseMaster"}
        table={"ams_BaseMaster"}
        dataAdd={columns}
        history={props.history}
        columns={iniCols}
        dataEdit={columnsEdit}
        tableType="view"
        pageSize={25}
        height={500}
        updateURL={window.apipath + "/v2/InsUpdDataAPI"}
        customAction={customActions}
        selection={"checkbox"}
        selectionData={(sel) => { }}
        codeInclude={true}
        linkLog={"/masterlog/palletlog?id="}
      />
    </>
  );
};

export default BaseMaster;
