import React, { Component, useState, useEffect } from "react";
import AmCreateDocument from "../../../../components/AmCreateDocument";
import {
  apicall,
  createQueryString
} from "../../../../components/function/CoreFunction";
import DocView from "../../../pageComponent/DocumentView";//css
const Axios = new apicall();

const CreateDocSUP = props => {
  const [dataWarehouse, setDataWarehouse] = useState("");
  const [dataMovementType, setDataMovementType] = useState("");
  const [table, setTable] = useState(null);

  useEffect(() => {
    Axios.get(createQueryString(WarehouseQuery)).then(row => {
      if (row.data.datas) {
        setDataWarehouse(row.data.datas[0].Name);
      }
    });
    Axios.get(createQueryString(MovementTypeQuery)).then(res => {
      if (res.data.datas) {
        console.log(res.data.datas[0].Name);
        setDataMovementType(res.data.datas[0].Name);
      }
    });
  }, []);

  // const getURL = ()=>{
  //     const values = queryString.parse(props.location.search)

  //     setDataType(values.MVT.toString())
  // }

  useEffect(() => {
    // getURL()
    if (dataWarehouse !== "" && dataMovementType !== "") {
      var headerCreates = [
        [
          { label: "Document No.", type: "labeltext", key: "", texts: "-" },
          { label: "Document Date", type: "date", key: "documentDate" }
        ],
        [
          {
            label: "Movement Type",
            type: "labeltext",
            key: "movementTypeID",
            texts: dataMovementType,
            valueTexts: "1013"
          },
          { label: "Action Time", type: "dateTime", key: "actionTime" }
        ],
        [
          {
            label: "Source Supplier",
            key: "souSupplierID",
            type: "dropdown",
            pair: "ID",
            idddl: "souSupplierID",
            queryApi: SupplierQuery2,
            fieldLabel: ["Code", "Name"]
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
          { label: "", type: "", key: "" }
        ]
        //[{ Header: "SKU Items", accessor: 'SKUItems', type: "dropdown", pair: "SKUIDs", idddl: "skuitems", queryApi: SKUMaster, fieldLabel: ["Code", "Name"] },{ label: "", type: "", key: "",texts: "" },]
      ];
      // setDataTest(headerCreates)
      if (headerCreates.length > 0) {
        setTable(
          <AmCreateDocument
            headerCreate={headerCreates}
            columns={columns}
            columnEdit={columnEdit}
            apicreate={apicreate}
            createDocType={"receive"}
            history={props.history}
            apiRes={apiRes}
          />
        );
      }
    }
  }, [dataWarehouse, dataMovementType]);

  // useEffect(()=> {
  //    console.log(dataTest)
  //     if(dataTest.length > 0  ){
  //         setTable(<AmCreateDocument
  //             headerCreate={dataTest}
  //             columns={columns}
  //             columnEdit={columnEdit}
  //             apicreate={apicreate}
  //             createDocType={"issue"}
  //             history={props.history}
  //             apiRes={apiRes}
  //         >
  //         </AmCreateDocument>)
  //     }
  // },[dataTest,props.location.search])

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
  const SupplierQuery2 = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "Supplier",
    q: '[{ "f": "Status", "c":"<", "v": 2},]',
    f: "ID,Code,Name",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: ""
  };

  const MovementTypeQuery = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "MovementType",
    q: '[{ "f": "Status", "c":"<", "v": 2},{ "f": "ID", "c":"=", "v": 1013}]',
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
    {
      Header: "Name",
      accessor: "Name",
      width: 200,
      sortable: true
    }
  ];

  const columnEdit = [
    // { Header: "Pallet Code", accessor: "palletcode", type: "input" },
    {
      Header: "SKU Code",
      accessor: "SKUItems",
      type: "findPopUp",
      pair: "skuCode",
      idddl: "skuitems",
      queryApi: SKUMaster,
      fieldLabel: ["Code", "Name"],
      columsddl: columsFindpopUp
    },
    { Header: "Batch", accessor: "batch", type: "input" },
    { Header: "Qty/Pallet", accessor: "perpallet", type: "inputNum" },
    { Header: "Quantity", accessor: "quantity", type: "inputNum" },
    { Header: "Example", type: "text", texts: "Qty/Pallet = 20" },
    { Header: "", type: "text", texts: "Quantity = 40" },
    { Header: "Result", type: "text", texts: "Pallet A = 20" },
    { Header: "", type: "text", texts: "Pallet B = 20" }
  ];

  const columns = [
    // { Header: "Pallet Code", accessor: "palletcode", width: 100 },
    { Header: "SKU Item", accessor: "SKUItems" },
    { Header: "Batch", accessor: "batch", width: 100 },
    { Header: "Qty/Pallet", accessor: "perpallet", width: 100 },
    { Header: "Quantity", accessor: "quantity", width: 70 },
    { Header: "Unit", accessor: "unitType", type: "unitType", width: 70 }
  ];

  const apicreate = "/v2/CreateGRDocumentAPI2/"; //API ���ҧ Doc
  const apiRes = "/receive/detail?docID="; //path ˹����������´ �͹����ѧ����Դ

  return <div>{table}</div>;
};

export default CreateDocSUP;
