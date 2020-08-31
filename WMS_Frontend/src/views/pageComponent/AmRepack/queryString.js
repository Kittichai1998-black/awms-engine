import React from "react";
import queryString from "query-string";

function UnitTypeQuery() {
  return {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "UnitType",
    q: '[{ "f": "Status", "c":"=", "v": 1}]',
    f: "ID,Name,Code",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: "",
  }
}

export { UnitTypeQuery }

