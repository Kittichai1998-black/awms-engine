import React, { useState, useEffect, useContext } from "react";
import AmIconStatus from "../../../components/AmIconStatus";
import { Button } from "@material-ui/core";
import AmStorageObjectMulti from "../../pageComponent/AmStorageObjectMulti";
import {
  apicall,
  createQueryString
} from "../../../components/function/CoreFunction";
import AmEntityStatus from "../../../components/AmEntityStatus";
import AmStorageObjectStatus from "../../../components/AmStorageObjectStatus";
import AmRedirectLog from "../../../components/AmRedirectLog";
const Axios = new apicall();

//======================================================================
const StorageObject = props => {
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
  const AreaMasterQuery = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "AreaMaster",
    q: '[{ "f": "Status", "c":"<", "v": 2}]',
    f: "*",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: ""
  };

  const AreaLocationMasterQuery = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "AreaLocationMaster",
    q: '[{ "f": "Status", "c":"<", "v": 2}]',
    f: "*",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: ""
  };
  const WarehouseQuery = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "Warehouse",
    q: '[{ "f": "Status", "c":"<", "v": 2}]',
    f: "*",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: ""
  };

  const DocumentEventStatus = [
    { label: "NEW", value: "NEW" },
    { label: "AUDITING", value: "AUDITING" },
    { label: "AUDITED", value: "AUDITED" },
    { label: "RECEIVED", value: "RECEIVED" },
    { label: "RECEIVING", value: "RECEIVING" },
    { label: "PICKING", value: "PICKING" },
    { label: "PICKED", value: "PICKED" },
    { label: "HOLD", value: "HOLD" }
  ];

  const iniCols = [
    {
      Header: "Status",
      accessor: "Status",
      fixed: "left",
      width: 50,
      sortable: false,
      Cell: e => getStatus(e.original)
    },
    { Header: "Pallet", accessor: "Pallet", width: 150 },
    {
      Header: window.project === "TAP" ? "Part NO." : "SKU Code",
      accessor: "SKU_Code",
      width: 200
    },
    {
      Header: window.project === "TAP" ? "Part Name" : "SKU Name",
      accessor: "SKU_Name",
      width: 300
    },
    { Header: "Warehouse", accessor: "Warehouse", width: 150 },
    { Header: "Area", accessor: "Area", width: 130 },
    { Header: "Location", accessor: "Location", width: 120 },
    { Header: "Lot", accessor: "Lot", width: 120 },
    {
      Header: "Qty",
      accessor: "Qty",
      width: 100
      // Cell: e => getNumberQty(e.original)
    },
    { Header: "Base Unit", accessor: "Base_Unit", width: 100 },
    {
      Header: "Weigth PalletPack",
      accessor: "Wei_PalletPack",
      width: 150,
      type: "number"
    },
    { Header: "Weigth Pack", accessor: "Wei_Pack", width: 120, type: "number" },
    {
      Header: "Weigth PackStd",
      accessor: "Wei_PackStd",
      width: 150,
      type: "number"
    },
    { Header: "Remark", accessor: "Remark", width: 150 },
    {
      Header: "Received Date",
      accessor: "Receive_Time",
      width: 150,
      type: "datetime",
      dateFormat: "DD/MM/YYYY HH:mm"
    },
    {
      width: 60,
      accessor: "",
      Header: "Log ",
      Cell: e => getRedirectLog(e.original)
    }
  ];
  const getRedirectLog = data => {
    return (
      <div
        style={{
          display: "flex",
          padding: "0px",
          paddingLeft: "10px"
        }}
      >
        {data.Code}
        <AmRedirectLog
          api={
            "/log/docitemstolog?id=" +
            data.ID +
            "&ParentStorageObject_ID=" +
            data.ID
          }
          history={props.history}
          docID={""}
          title={"Log DocItemSto"}
        >
          {" "}
        </AmRedirectLog>
      </div>
    );
  };

  const getNumberQty = value => {
    return parseInt(value.Qty);
  };
  const columns = [
    {
      field: "Option",
      type: "input",
      name: "Remark",
      placeholder: "Remark",
      required: true
    }
  ];

  const iniCols2 = [
    "SKU_Code",
    "SKU_Name",
    "Warehouse",
    "Area",
    "Location",
    "Batch",
    "Lot",
    "OrderNo",
    "Qty",
    "Base_Unit",
    "Wei_PalletPack",
    "Wei_Pack",
    "Wei_PackStd"
  ];

  const getStatus = value => {
    if (value.Status[0].props.children.key === "NEW") {
      return <AmStorageObjectStatus key={value.Status[0].props.children.key} statusCode={10} />;
    } else if (value.Status[0].props.children.key === "RECEIVING") {
      return <AmStorageObjectStatus key={value.Status[0].props.children.key} statusCode={11} />;
    } else if (value.Status[0].props.children.key === "RECEIVED") {
      return <AmStorageObjectStatus key={value.Status[0].props.children.key} statusCode={102} />;
    } else if (value.Status[0].props.children.key === "AUDITING") {
      return <AmStorageObjectStatus key={value.Status[0].props.children.key} statusCode={13} />;
    } else if (value.Status[0].props.children.key === "AUDITED") {
      return <AmStorageObjectStatus key={value.Status[0].props.children.key} statusCode={104} />;
    } else if (value.Status[0].props.children.key === "PICKING") {
      return <AmStorageObjectStatus key={value.Status[0].props.children.key} statusCode={17} />;
    } else if (value.Status[0].props.children.key === "PICKED") {
      return <AmStorageObjectStatus key={value.Status[0].props.children.key} statusCode={18} />;
    } else if (value.Status[0].props.children.key === "HOLD") {
      return <AmStorageObjectStatus key={value.Status[0].props.children.key} statusCode={99} />;
    } else if (value.Status[0].props.children.key === "QUALITY_CONTROL") {
      return <AmStorageObjectStatus key={value.Status[0].props.children.key} statusCode={98} />;
    } else if (value.Status[0].props.children.key === "REMOVING") {
      return <AmStorageObjectStatus key={value.Status[0].props.children.key} statusCode={21} />;
    } else if (value.Status[0].props.children.key === "REMOVED") {
      return <AmStorageObjectStatus key={value.Status[0].props.children.key} statusCode={22} />;
    } else {
      return null;
    }
  };
  const primarySearch = [
    {
      label: "Pallet",
      field: "Pallet",
      searchType: "input",
      placeholder: "Pallet"
    },
    {
      label: window.project === "TAP" ? "Part NO." : "SKU Code",
      field: "SKU_Code",
      searchType: "input",
      placeholder: window.project === "TAP" ? "Part NO." : "SKU Code"
    }
  ];

  const colsLocation = [
    {
      Header: "Code",
      accessor: "Code",
      fixed: "left",
      width: 100,
      sortable: true
    },
    {
      Header: "Name",
      accessor: "Name",
      sortable: true
    }
  ];
  const search = [
    {
      label: "Status",
      field: "Status",
      searchType: "status",
      typeDropdow: "normal",
      name: "Status",
      dataDropDow: DocumentEventStatus,
      placeholder: "Status"
    },
    {
      label: window.project === "TAP" ? "Part Name" : "SKU Name",
      field: "SKU_Name",
      searchType: "input",
      placeholder: window.project === "TAP" ? "Part Name" : "SKU Name"
    },
    {
      label: "Warehouse",
      field: "Warehouse",
      searchType: "dropdown",
      typeDropdow: "search",
      name: "Warehouse",
      dataDropDow: WarehouseQuery,
      placeholder: "Warehouse",
      fieldLabel: ["Code", "Name"],
      fieldDataKey: "Name"
    },
    {
      label: "Area",
      field: "Area",
      searchType: "dropdown",
      typeDropdow: "search",
      name: "Area",
      dataDropDow: AreaMasterQuery,
      placeholder: "Area",
      fieldLabel: ["Code", "Name"],
      fieldDataKey: "Name"
    },
    {
      label: "Location",
      field: "Location",
      searchType: "input",
      placeholder: "Location"
    },
    { label: "Lot", field: "Lot", searchType: "input", placeholder: "Lot" },

    { label: "Qty", field: "Qty", searchType: "input", placeholder: "Qty" },
    {
      label: "Unit Type",
      field: "Base_Unit",
      searchType: "dropdown",
      typeDropdow: "search",
      name: "Unit Type",
      dataDropDow: UnitTypeQuery,
      placeholder: "Unit Type",
      fieldLabel: ["Code", "Name"],
      fieldDataKey: "Code"
    },
    {
      label: "Wei PalletPack",
      field: "Wei_PalletPack",
      searchType: "input",
      placeholder: "Weigth PalletPack"
    },
    {
      label: "Weigth Pack",
      field: "Wei_Pack",
      searchType: "input",
      placeholder: "Weigth Pack"
    },
    {
      label: "Weigth PackStd",
      field: "Wei_PackStd",
      searchType: "input",
      placeholder: "Weigth PackStd"
    },
    {
      label: "Remark",
      field: "Remark",
      searchType: "input",
      placeholder: "Remark"
    },
    {
      label: "Date From: ",
      field: "Receive_Time",
      searchType: "datepicker",
      typedate: "date",
      dateSearchType: "dateFrom"
    },
    {
      label: "Date To: ",
      field: "Receive_Time",
      searchType: "datepicker",
      typedate: "date",
      dateSearchType: "dateTo"
    }
  ];
  return (
    <div>
      <AmStorageObjectMulti
        primarySearch={primarySearch}
        expensionSearch={search}
        tableQuery={"r_StorageObject"}
        iniCols={iniCols}
        cols={iniCols2}
        dataRemark={columns}
        table={"StorageObject"}
        selection={true}
        modifyRemark={true}
        export={false}
        modifyhold={true}
        modifyreceived={true}
        modifyQC={true}
        multi={true}
      />
    </div>
  );
};

export default StorageObject;
