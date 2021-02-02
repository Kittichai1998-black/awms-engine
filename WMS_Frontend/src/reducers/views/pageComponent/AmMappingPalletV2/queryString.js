import React from "react";
import queryString from "query-string";

function WarehouseQuery() {
  return {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "Warehouse",
    q: '[{ "f": "Status", "c":"=", "v": 1}]',
    f: "ID as warehouseID,Name,Code",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: "",
  }
}
function AreaMasterQuery() {
  return {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "AreaMaster",
    q: '[{ "f": "Status", "c":"=", "v": 1},{ "f": "AreaMasterType_ID", "c":"=", "v": 30}]',
    f: "Name,Code,ID as areaID",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: "",
  }
}
function DocumentProcessTypeQuery() {
  return {
    queryString: window.apipath + "/v2/SelectDataViwAPI/",
    t: "DocumentProcessTypeMap",
    q: '[{ "f": "Status", "c":"=", "v": 1},{ "f": "DocumentType_ID", "c":"=", "v": 1011}]',
    f: "ID,DocumentProcessType_ID as processType,ReProcessType_Name as Name,Code",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: "",
  }
}
export { WarehouseQuery, AreaMasterQuery, DocumentProcessTypeQuery }

