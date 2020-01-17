import React, { useState, useEffect } from "react";
import AmCreateDocument from "../../../../components/AmCreateDocumentNew";
import {
  apicall,
  createQueryString
} from "../../../../components/function/CoreFunction";
import queryString from "query-string";
// import axios from "axios";
// import Clone from "../../../../components/function/Clone";
const Axios = new apicall();

const CreateDocPI = props => {
  const [dataWarehouse, setDataWarehouse] = useState("");
  const [dataMovementType, setDataMovementType] = useState("");
  const [dataTest, setDataTest] = useState([]);
  const [table, setTable] = useState(null);
  useEffect(() => {
    Axios.get(createQueryString(WarehouseQuery)).then(row => {
      if (row.data.datas) {
        setDataWarehouse(row.data.datas[0].Name);
      }
    });

    Axios.get(createQueryString(MovementTypeQuery)).then(res => {
      if (res.data.datas) {
        setDataMovementType(res.data.datas[0].Name);
      }
    });
  }, []);

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
            texts: "FG_PHYSICAL_COUNT_WM ",
            valueTexts: "1041"
          },
          { label: "Action Time", type: "dateTime", key: "actionTime" }
        ],
        [
          {
            label: "Source Warehouse",
            type: "labeltext",
            key: "souWarehouseID",
            texts: dataWarehouse,
            valueTexts: "1"
          },
          {
            label: "Destination Warehouse",
            type: "labeltext",
            key: "desWarehouseID",
            texts: dataWarehouse,
            valueTexts: "1"
          }
        ],
        [
          { label: "Doc Status", type: "labeltext", key: "", texts: "New" },
          { label: "Remark", type: "input", key: "remark", search: true }
        ]
        //[{ Header: "SKU Items", accessor: 'SKUItems', type: "dropdown", pair: "SKUIDs", idddl: "skuitems", queryApi: SKUMaster, fieldLabel: ["Code", "Name"] },{ label: "", type: "", key: "",texts: "" },]
      ];
      setDataTest(headerCreates);
    }
  }, [dataWarehouse, dataMovementType]);

  useEffect(() => {
    if (dataTest.length > 0) {
      setTable(
        <AmCreateDocument
          addList={addList}
          headerCreate={dataTest}
          columns={columns}
          columnEdit={columnEdit}
          apicreate={apicreate}
          createDocType={"audit"}
          history={props.history}
          apiRes={apiRes}
        />
      );
    }
  }, [dataTest]);

  const getCarton = value => {
    var qryStr = queryString.parse(value.Options);
    return qryStr["carton_no"];
  };

  const columsFindpopUpPALC = [
    {
      Header: "Pallet Code",
      accessor: "palletcode",
      width: 110,
      style: { textAlign: "center" }
    },

    { Header: "SKU Item", accessor: "SKUItems", width: 400 },

    {
      Header: "Lot",
      accessor: "lot",
      width: 70,
      style: { textAlign: "center" }
    },
    {
      Header: "Location",
      accessor: "LocationCode",
      width: 90,
      style: { textAlign: "center" }
    },
    {
      Header: "Quantity",
      accessor: "Quantity",
      width: 90,
      style: { textAlign: "center" }
    },
    {
      Header: "Unit",
      accessor: "BaseUnitCode",
      width: 70,
      style: { textAlign: "center" }
    }
    // {
    //   Header: "Remark",
    //   accessor: "remark",
    //   width: 110,
    //   style: { textAlign: "center" }
    // }
  ];

  const PalletCode = {
    queryString: window.apipath + "/v2/SelectDataViwAPI/",
    t: "PalletSto",
    q:
      '[{"f":"Status" , "c":"=" , "v":"1"},{"f": "EventStatus" , "c":"in" , "v": "12,97,96,98"}]', //เงื่อนไข '[{ "f": "Status", "c":"<", "v": 2}]'
    f:
      "ID,palletcode,Code,Batch,Name,Quantity,UnitCode,BaseUnitCode,LocationCode,LocationName,SKUItems,srmLine,OrderNo as orderNo,Options",
    g: "",
    s: "[{'f':'ID','od':'ASC'}]",
    sk: 0,
    l: 20,
    all: ""
  };

  const addList = {
    queryApi: PalletCode,
    columns: columsFindpopUpPALC,
    search: [
      { accessor: "palletcode", placeholder: "Pallet Code" },

      { accessor: "Code", placeholder: "SKU Item" },
      {
        accessor: "lot",
        placeholder: "Lot"
      },
      //{ accessor: "Size", placeholder: "Size" },
      { accessor: "LocationCode", placeholder: "Location" }
      //{ accessor: "remark", placeholder: "Remark" }
    ]
  };

  const SKUMaster = {
    queryString: window.apipath + "/v2/SelectDataViwAPI/",
    t: "SKUMaster",
    q: '[{ "f": "Status", "c":"<", "v": 2}]',
    f:
      "ID,Code,Name,UnitTypeCode,concat(Code, ':' ,Name) as SKUItem, ID as SKUID,concat(Code, ':' ,Name) as SKUItems, ID as SKUIDs,Code as skuCode",
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

  const AreaLocationMaster = {
    queryString: window.apipath + "/v2/SelectDataViwAPI/",
    t: "AreaLocationMaster",
    q: '[{ "f": "Status", "c":"<", "v": 2}]',
    f: "ID,Code AS locationcode,Name,Code",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: ""
  };
  const MovementTypeQuery = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "MovementType",
    q: '[{ "f": "Status", "c":"<", "v": 2},{ "f": "ID", "c":"=", "v": 1041}]',
    f: "ID,Code,Name",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: ""
  };

  const columsFindpopUp = [
    {
      Header: "Code",
      accessor: "Code",
      fixed: "left",
      width: 130,
      sortable: true
    },
    { Header: "Name", accessor: "Name", width: 200, sortable: true }
  ];

  const columnEdit = [
    {
      Header: "Pallet Code",
      accessor: "palletcode",
      type: "findPopUp",
      idddl: "palletcode",
      queryApi: PalletCode,
      fieldLabel: ["palletcode"],
      columsddl: columsFindpopUpPALC
    },
    {
      Header: "Location",
      accessor: "locationcode",
      type: "findPopUp",
      pair: "locationcode",
      idddl: "locationcode",
      queryApi: AreaLocationMaster,
      fieldLabel: ["Code", "Name"],
      columsddl: columsFindpopUp
    },
    {
      Header: "SKU Item",
      accessor: "SKUItems",
      type: "findPopUp",
      pair: "skuCode",
      idddl: "skuitems",
      queryApi: SKUMaster,
      fieldLabel: ["SKUItems"],
      columsddl: columsFindpopUp
    },
    { Header: "Lot", accessor: "lot", type: "input" },
    {
      Header: "Counting (%)",
      accessor: "qtyrandom",
      type: "inputNum",
      TextInputnum: "%"
    },
    {
      Header: "Unit",
      accessor: "unitType",
      type: "text"
    }
  ];
  const columns = [
    { Header: "Pallet Code", accessor: "palletcode", width: 100 },
    { Header: "Location", accessor: "locationcode", width: 100 },
    { Header: "SKU Item", accessor: "SKUItems" },
    // { Header: "SKU Code", accessor: "skuCode" },
    // { Header: "Brand", accessor: "skuName" },
    { Header: "Lot", accessor: "lot", width: 100 },
    { Header: "Counting (%)", accessor: "qtyrandom", width: 100 },
    { Header: "Unit", accessor: "unitType", type: "unitType", width: 70 }
  ];

  const apicreate = "/v2/CreateADDocAPI/"; //API ���ҧ Doc
  const apiRes = "/counting/detail?docID="; //path ˹����������´ �͹����ѧ����Դ

  return table;
};

export default CreateDocPI;