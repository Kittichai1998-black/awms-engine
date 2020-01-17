import React, { useState, useEffect } from "react";

import AmCreateDocument from "../../../../components/AmCreateDocumentNew";

import {
  apicall,
  createQueryString
} from "../../../../components/function/CoreFunction";
import DocView from "../../../pageComponent/DocumentView"; //css
import AmDialogs from "../../../../components/AmDialogs";
// import Axios from 'axios'
const Axios = new apicall();
const CreateDocGRFG = props => {
  const [dataWarehouse, setDataWarehouse] = useState("");
  const [dataHeader, setDataHeader] = useState([]);
  const [table, setTable] = useState(null);
  const [openError, setOpenError] = useState(false);
  const [textError, setTextError] = useState("");
  //get api set dataWarehouse
  useEffect(() => {
    //==========================================================
    Axios.get(createQueryString(DocumentQuery)).then(row => {
      //console.log(row.data.datas.length);
      if (row.data.datas.length > 0) {
        setOpenError(true);
        setTextError("Document is Working");
        setTimeout(() => props.history.push("/receive/search"), 1000);
      }
    });
    //==========================================================
    Axios.get(createQueryString(WarehouseQuery)).then(row => {
      if (row.data.datas && row.data.datas.length > 0) {
        setDataWarehouse(row.data.datas[0]);
      }
    });
  }, []);

  //set headerCreate check state dataWarehouse
  useEffect(() => {
    if (dataWarehouse !== "") {
      const headerCreates = [
        [
          { label: "Document No.", type: "labeltext", key: "", texts: "-" },
          { label: "Document Date", type: "date", key: "documentDate" }
        ],
        [
          {
            label: "Movement Type",
            type: "labeltext",
            key: "movementTypeID",
            texts: "STO_TRANSFER",
            valueTexts: "5010"
          },
          { label: "Action Time", type: "dateTime", key: "actionTime" }
        ],
        [
          {
            label: "Source Warehouse",
            type: "labeltext",
            key: "souWarehouseID",
            texts: dataWarehouse.Name,
            valueTexts: dataWarehouse.ID
          },
          {
            label: "Destination Warehouse",
            type: "labeltext",
            key: "desWarehouseID",
            texts: dataWarehouse.Name,
            valueTexts: dataWarehouse.ID
          }
        ],
        [
          { label: "Doc Status", type: "labeltext", key: "", texts: "NEW" },
          { label: "Remark", type: "input", key: "remark" }
        ]
      ];
      setDataHeader(headerCreates);
    }
  }, [dataWarehouse]);

  useEffect(() => {
    if (dataHeader.length > 0) {
      setTable(
        <AmCreateDocument
          //addList={addList}
          headerCreate={dataHeader}
          columns={columns}
          columnEdit={columnEdit}
          apicreate={apicreate}
          createDocType={"receive"}
          history={props.history}
          apiRes={apiRes}
        />
      );
    }
  }, [dataHeader]);

  const SKUMaster = {
    queryString: window.apipath + "/v2/SelectDataViwAPI/",
    t: "SKUMaster",
    q: '[{ "f": "Status", "c":"<", "v": 2}]',
    f:
      "ID,Code,Name,UnitTypeCode, ID as SKUID,concat(Code, ' : ' ,Name) as SKUItems, ID as SKUIDs,Code as skuCode",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: ""
  };

  const WarehouseQuery = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "Warehouse",
    q: '[{ "f": "Status", "c":"<", "v": 2},{ "f": "ID", "c":"=", "v": 1}]',
    f: "ID,Code,Name",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: ""
  };

  const DocumentQuery = {
    queryString: window.apipath + "/v2/SelectDatatrxAPI/",
    t: "Document",
    q:
      '[{ "f": "Status", "c":"<", "v": 2},{ "f": "Status", "c":"in", "v": "0,1"},{ "f": "MovementType_ID", "c":"=", "v":5010}]',
    f: "ID,Code,Status,MovementType_ID",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: ""
  };

  const columsFindpopUpSKU = [
    {
      Header: "Code",
      accessor: "Code",
      fixed: "left",
      width: 100,
      sortable: true
    },
    { Header: "Name", accessor: "Name", width: 250, sortable: true }
  ];

  const columnEdit = [
    {
      Header: "SKU Item",
      accessor: "SKUItems",
      type: "findPopUp",
      pair: "skuCode",
      idddl: "skuitems",
      queryApi: SKUMaster,
      fieldLabel: ["SKUItems"],
      columsddl: columsFindpopUpSKU
    },
    { Header: "Lot", accessor: "lot", type: "input" },
    { Header: "Quantity", accessor: "quantity", type: "inputNum" },
    {
      Header: "Unit",
      accessor: "unitType",
      type: "text"
    }
  ];

  const columns = [
    { id: "row", Cell: row => row.index + 1, width: 35 },
    { Header: "Pallet Code", accessor: "palletcode", width: 110 },
    { Header: "SKU Item", accessor: "SKUItems" },
    { Header: "Lot", accessor: "lot", width: 100 },
    { Header: "Quantity", accessor: "quantity", width: 90 },
    { Header: "Unit", accessor: "unitType", width: 70 }
  ];

  const apicreate = "/v2/CreateGRDocAPI/"; //API สร้าง Doc
  const apiRes = "/receive/detail?docID="; //path หน้ารายละเอียด ตอนนี้ยังไม่เปิด
  return (
    <div>
      {" "}
      {table}
      <AmDialogs
        typePopup={"error"}
        onAccept={e => {
          setOpenError(e);
        }}
        open={openError}
        content={textError}
      ></AmDialogs>
    </div>
  );
};
export default CreateDocGRFG;
