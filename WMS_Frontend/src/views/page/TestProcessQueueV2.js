import React, { useState, useEffect } from "react";
import AmProcessQueue from "../pageComponent/AmProcessQueue/AmProcessQueue";

const ProcessQueue = () => {
  const columnsDocument = [{"accessor":"Code", "Header":"Code", "sortable":true}];
  const colDocumentItem = [
    {"accessor":"Code", "Header":"Code", "sortable":false, "width":400},
    {"accessor":"Name", "Header":"Name", "sortable":false, "width":400},
    {"accessor":"Qty", "Header":"Qty", "sortable":false, "width":60},
    {"accessor":"Unit", "Header":"Unit", "sortable":false, "width":60},
];
  
  const documentQuery = {
    queryString: window.apipath + "/v2/SelectDataTrxAPI/",
    t: "Document",
    q:
      '[{ "f": "Status", "c":"<", "v": 2},{ "f": "DocumentType_ID", "c":"=", "v": 1002}]',
    f: "*",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: ""
  };

  return <AmProcessQueue 
    documentPopup={columnsDocument} 
    documentQuery={documentQuery}
    documentItemDetail={colDocumentItem}
  />
}

export default ProcessQueue;