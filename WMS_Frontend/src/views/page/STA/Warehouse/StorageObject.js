import React, { useState, useEffect, useContext } from "react";
import AmIconStatus from "../../../../components/AmIconStatus";
import { Button } from "@material-ui/core";
import AmStorageObjectMulti from "../../../pageComponent/AmStorageObjectMulti";
import {
  apicall,
  createQueryString
} from "../../../../components/function/CoreFunction";
import AmEntityStatus from "../../../../components/AmEntityStatus";
import AmStorageObjectStatus from "../../../../components/AmStorageObjectStatus";
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
  const SKUMasterType = {
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
  const DocumentEventStatus = [
    { label: "NEW", value: "NEW" },
    { label: "AUDITING", value: "AUDITING" },
    { label: "AUDITED", value: "AUDITED" },
    { label: "RECEIVED", value: "RECEIVED" },
    { label: "RECEIVING", value: "RECEIVING" },
    { label: "PICKING", value: "PICKING" },
    { label: "PICKED", value: "PICKED" },
    { label: "HOLD", value: "HOLD" },
    { label: "PARTIAL", value: "PARTIAL" },
    { label: "RETURN", value: "RETURN" },
    { label: "REMOVED", value: "REMOVED" },
    { label: "QUALITY_CONTROL", value: "QUALITY_CONTROL" }
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
    { Header: "Pallet Code", accessor: "Pallet", width: 110 },
    { Header: "SI", accessor: "OrderNo", width: 120 },
    { Header: "Reorder", accessor: "SKU_Code", width: 200 },
    { Header: "Brand", accessor: "SKU_Name", width: 300 },
    { Header: "Size", accessor: "skuType", width: 100 },
    { Header: "Carton No.", accessor: "Carton_No", width: 120 },
    {
      Header: "Qty",
      accessor: "Qty",
      width: 100,
      type: "number",
      Cell: e => getNumberQty(e.original)
    },
    { Header: "Base_Unit", accessor: "Base_Unit", width: 100 },
    {
      Header: "Remark",
      accessor: "Remark",
      width: 150,
      Cell: e => getRemark(e.original)
    },
    { Header: "Warehouse", accessor: "Warehouse", width: 120 },
    { Header: "Area", accessor: "Area", width: 130 },
    { Header: "Location", accessor: "Location", width: 120 },
    {
      Header: "Received Date",
      accessor: "Receive_Time",
      width: 150,
      type: "datetime",
      dateFormat: "DD/MM/YYYY HH:mm"
    }
  ];

  const columns = [
    {
      field: "Option",
      type: "input",
      name: "Remark",
      placeholder: "Remark",
      required: true
    }
  ];
  const SKUGroupType = [
    { label: "FG", value: "FG" },
    { label: "WIP", value: "WIP" },
    { label: "EMP", value: "EMP" },
    { label: "RAW", value: "RAW" },
    { label: "STO", value: "STO" },
    { label: "DOC", value: "DOC" }
  ];
  const iniCols2 = [
    "SKU_Code",
    "SKU_Name",
    "Warehouse",
    "Area",
    "Location",
    "Batch",
    "OrderNo",
    "Qty",
    "Base_Unit"
  ];

  const getRemark = value => {
    if (value.Remark === null || value.Remark === "null") {
      return "";
    } else {
      return value.Remark;
    }
  };
  const getNumberQty = value => {
    return parseInt(value.Qty);
  };
  const getStatus = value => {
    if (value.Status === "NEW") {
      return <AmStorageObjectStatus key={value.Status} statusCode={10} />;
    } else if (value.Status === "RECEIVING") {
      return <AmStorageObjectStatus key={value.Status} statusCode={11} />;
    } else if (value.Status === "RECEIVED") {
      return <AmStorageObjectStatus key={value.Status} statusCode={12} />;
    } else if (value.Status === "AUDITING") {
      return <AmStorageObjectStatus key={value.Status} statusCode={13} />;
    } else if (value.Status === "AUDITED") {
      return <AmStorageObjectStatus key={value.Status} statusCode={14} />;
    } else if (value.Status === "PICKING") {
      return <AmStorageObjectStatus key={value.Status} statusCode={17} />;
    } else if (value.Status === "PICKED") {
      return <AmStorageObjectStatus key={value.Status} statusCode={18} />;
    } else if (value.Status === "HOLD") {
      return <AmStorageObjectStatus key={value.Status} statusCode={99} />;
    } else if (value.Status === "QUALITY_CONTROL") {
      return <AmStorageObjectStatus key={value.Status} statusCode={98} />;
    } else if (value.Status === "REMOVING") {
      return <AmStorageObjectStatus key={value.Status} statusCode={21} />;
    } else if (value.Status === "RETURN") {
      return <AmStorageObjectStatus key={value.Status} statusCode={96} />;
    } else if (value.Status === "REMOVED") {
      return <AmStorageObjectStatus key={value.Status} statusCode={22} />;
    } else if (value.Status === "PARTIAL") {
      return <AmStorageObjectStatus key={value.Status} statusCode={97} />;
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
      label: "Reorder",
      field: "SKU_Code",
      searchType: "input",
      placeholder: "Reorder"
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
      label: "Brand",
      field: "SKU_Name",
      searchType: "input",
      placeholder: "Brand"
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
      label: "SI",
      field: "OrderNo",
      searchType: "input",
      placeholder: "SI"
    },
    //SKUMasterType
    {
      label: "Size",
      field: "skuType",
      searchType: "dropdown",
      typeDropdow: "normal",
      name: "Size",
      dataDropDow: SKUMasterType,
      placeholder: "Size",
      fieldLabel: ["Code"],
      fieldDataKey: "Code"
    },
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
      label: "Remark",
      field: "Remark",
      searchType: "input",
      placeholder: "Remark"
    },
    {
      label: "Date From",
      field: "Receive_Time",
      searchType: "datepicker",
      typedate: "date",
      dateSearchType: "dateFrom"
    },
    {
      label: "Date To",
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
        //multi={true}
      />
    </div>
  );
};

export default StorageObject;
