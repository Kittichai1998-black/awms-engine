import React, { Component, useEffect, useState } from "react";
import { AmEditorTable } from "../../../../components/table";
import {
  apicall,
  createQueryString
} from "../../../../components/function/CoreFunction";
import AmDialogs from "../../../../components/AmDialogs";
import AmCreateDocument from "./AmCreateDocument";
import AmButton from "../../../../components/AmButton";
import AmInput from "../../../../components/AmInput";
import Grid from "@material-ui/core/Grid";
import styled from "styled-components";
import _ from "lodash";
import { array } from "prop-types";
const Axios = new apicall();
const InputDiv = styled.div``;
const FormInline = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  label {
    margin: 10px 0 10px 0;
  }
  input {
    vertical-align: middle;
  }
  @media (max-width: 800px) {
    flex-direction: column;
    align-items: stretch;
  }
`;
const LabelH = styled.label`
  font-weight: bold;
  width: 200px;
`;

const AmCreateDocumentR5 = props => {
  const [sapResponse, setSAPResponse] = useState([]);
  const [editData, setEditData] = useState({});
  const [editPopup, setEditPopup] = useState(false);
  const [sapReq, setSAPReq] = useState([]);
  const [headerData, setHeaderData] = useState([]);
  const [openError, setOpenError] = useState(false);
  const [textError, setTextError] = useState("");
  const [refID, setRefID] = useState("");
  const [groupMVT, setGroupMVT] = useState([]);
  const [groupValueMVT, setGroupValueMVT] = useState("");

  const headerCreates = [
    [
      { label: "Document No.", type: "labeltext", key: "sapdoc", texts: "-" },
      { label: "Document Date", type: "dateTime", key: "documentDate" }
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
        texts: "Warehouse1/ASRS",
        valueTexts: 1
      }
    ],
    [
      { label: "Doc Status", type: "labeltext", key: "", texts: "New" },
      {
        label: "Mode",
        type: "labeltext",
        key: "ref1",
        texts: "R5-DO เบิกสินค้าเพื่อ Load เข้าพื้นที่ Pre-load",
        valueTexts: "R05"
      }
    ]
  ];

  var columnsModify = [
    {
      Header: "Delivery Order",
      accessor: "VBELN_VL",
      width: 170
    },
    {
      Header: "Material",
      accessor: "MATNR",
      width: 150
    },
    {
      Header: "Batch",
      accessor: "CHARG"
    },
    {
      Header: "Quantity",
      accessor: "BDMNG"
    },
    {
      Header: "Unit",
      accessor: "MEINS"
    },
    {
      Header: "MVT",
      accessor: "BWLVS"
    },
    {
      Header: "UR",
      accessor: "BESTQ_UR"
    },
    {
      Header: "QI",
      accessor: "BESTQ_QI"
    },
    {
      Header: "Blocked",
      accessor: "BESTQ_BLK"
    }
  ];

  const apicreate = "/v2/CreateGIDocAPI/"; //API สร้าง Doc
  const apiRes = "/issue/detail?docID=";

  const sapConnectorR5 = postData => {
    Axios.post(window.apipath + "/v2/SAPZWMRF003R5API", postData).then(res => {
      if (res.data._result.status === 1) {
        res.data.datas.forEach(x => {
          x.MATNR = x.MATNR.replace(/^0+/, '');
        });

        setSAPResponse(res.data.datas);
      } else {
        console.log(res.data._result.message);
        setOpenError(true);
        setTextError(res.data._result.message);
      }
    });
  };

  const onHandleEditConfirm = (status, rowdata) => {
    if (status) {
      var postData = {};
      sapReq.forEach(x => {
        if (x !== undefined) {
          postData[x.field] = x.value;
        }
      });
      postData["_token"] = localStorage.getItem("Token");
      sapConnectorR5(postData);
    }
    setEditPopup(false);
    setSAPReq([]);
    setRefID("");
  };

  const onChangeEditor = (field, value) => {
    let DataValue = sapReq.map(x => {
      if (x !== undefined) {
        if (x.field !== field) {
          return x;
        }
      }
    });
    DataValue.push({ field: field, value: value });
    setSAPReq(DataValue);
  };

  const editorList = [
    {
      field: "Delivery Order Number",
      component: (data, cols, key) => {
        return (
          <div key={key}>
            <FormInline>
              {" "}
              <LabelH> {"Delivery Order Number :"} </LabelH>
              <InputDiv>
                <AmInput
                  defaultValue={data ? data.Name2 : ""}
                  onChange={value => {
                    onChangeEditor("VBELN_VL", value);
                  }}
                />
              </InputDiv>{" "}
            </FormInline>
          </div>
        );
      }
    },
    {
      field: "Delivery Item",
      component: (data, cols, key) => {
        return (
          <div key={key}>
            <FormInline>
              {" "}
              <LabelH> {"Delivery Item :"} </LabelH>
              <InputDiv>
                <AmInput
                  defaultValue={data ? data.Name2 : ""}
                  onChange={value => {
                    onChangeEditor("POSNR", value);
                  }}
                />
              </InputDiv>{" "}
            </FormInline>
          </div>
        );
      }
    },
    {
      field: "Material Number",
      component: (data, cols, key) => {
        return (
          <div key={key}>
            <FormInline>
              {" "}
              <LabelH> {"Material Number :"} </LabelH>
              <InputDiv>
                <AmInput
                  defaultValue={data ? data.Name2 : ""}
                  onChange={value => {
                    onChangeEditor("MATNR", value);
                  }}
                />
              </InputDiv>{" "}
            </FormInline>
          </div>
        );
      }
    },
    {
      field: "Batch Number",
      component: (data, cols, key) => {
        return (
          <div key={key}>
            <FormInline>
              {" "}
              <LabelH> {"Batch Number :"} </LabelH>
              <InputDiv>
                <AmInput
                  defaultValue={data ? data.Name2 : ""}
                  onChange={value => {
                    onChangeEditor("CHARG", value);
                  }}
                />
              </InputDiv>{" "}
            </FormInline>
          </div>
        );
      }
    }
  ];
  var dataResultMVT = "";
  const CreateDocument = () => {
    let DataValueItem = "";
    let DataValueRefID = "";
    sapResponse.map((item, idx) => {
      DataValueItem = item.BWLVS;
      DataValueRefID = item.VBELN_VL;
      groupMVT.push(DataValueItem);
      var dataGroup = groupMVT.filter((x, i, a) => a.indexOf(x) == i);
      dataGroup.forEach(x => {
        strMVT = x + ",";
      });
      var l = strMVT.length;
      dataResultMVT = strMVT.substring(0, l - 1);
      console.log(dataResultMVT);
    });
    let document = {
      actionTime:
        headerData.actionTime === undefined ? null : headerData.actionTime,
      forCustomerID:
        headerData.forCustomerID === undefined
          ? null
          : headerData.forCustomerID,
      forCustomerCode:
        headerData.forCustomerCode === undefined
          ? null
          : headerData.forCustomerCode,
      batch: headerData.batch === undefined ? null : headerData.batch,
      lot: headerData.lot === undefined ? null : headerData.lot,
      orderno: headerData.orderno === undefined ? null : headerData.orderno,
      souSupplierID:
        headerData.souSupplierID === undefined
          ? null
          : headerData.souSupplierID,
      souCustomerID:
        headerData.souCustomerID === undefined
          ? null
          : headerData.souCustomerID,
      souBranchID:
        headerData.souBranchID === undefined ? null : headerData.souBranchID,
      souAreaMasterID:
        headerData.souAreaMasterID === undefined
          ? null
          : headerData.souAreaMasterID,
      souSupplierCode:
        headerData.souSupplierCode === undefined
          ? null
          : headerData.souSupplierCode,
      souCustomerCode:
        headerData.souCustomerCode === undefined
          ? null
          : headerData.souCustomerCode,
      souBranchCode:
        headerData.souBranchCode === undefined
          ? null
          : headerData.souBranchCode,
      souWarehouseID:
        headerData.souWarehouseID === undefined ? 1 : headerData.souWarehouseID,
      souAreaMasterCode:
        headerData.souAreaMasterCode === undefined
          ? null
          : headerData.souAreaMasterCode,
      desBranchID:
        headerData.desBranchID === undefined ? null : headerData.desBranchID,
      desWarehouseID:
        headerData.desWarehouseID === undefined
          ? null
          : headerData.desWarehouseID,
      desAreaMasterID:
        headerData.desAreaMasterID === undefined
          ? null
          : headerData.desAreaMasterID,
      desBranchCode:
        headerData.desBranchCode === undefined
          ? null
          : headerData.desBranchCode,
      desCustomerID:
        headerData.desCustomerID === undefined
          ? null
          : headerData.desCustomerID,
      desSupplierID:
        headerData.desSupplierID === undefined
          ? null
          : headerData.desSupplierID,
      desWarehouseCode:
        headerData.issueItems === undefined ? null : headerData.issueItems,
      desAreaMasterCode:
        headerData.desAreaMasterCode === undefined
          ? null
          : headerData.desAreaMasterCode,
      documentDate:
        headerData.documentDate === undefined ? null : headerData.documentDate,
      movementTypeID:
        headerData.movementTypeID === undefined
          ? null
          : headerData.movementTypeID,
      ref1: "R05",
      ref2: dataResultMVT,
      refID: DataValueRefID,
      remark: headerData.remark === undefined ? null : headerData.remark,
      receiveItems:
        headerData.receiveItems === undefined ? null : headerData.receiveItems
    };
    var strMVT = "";
    let documentItem = sapResponse.map((item, idx) => {
      // let DataValueItem = item.BWLVS;
      // groupMVT.push(DataValueItem);
      // var dataGroup = groupMVT.filter((x, i, a) => a.indexOf(x) == i);
      // dataGroup.forEach(x => {
      //   strMVT = x + ",";
      // });
      // var l = strMVT.length;
      // var dataResultMVT = strMVT.substring(0, l - 1);
      // console.log(dataResultMVT);
      var matnr = parseInt(item.MATNR).toString();
      let options =
        "bestq_ur=" +
        item.BESTQ_UR +
        "&bestq_qi=" +
        item.BESTQ_QI +
        "&bestq_blk=" +
        item.BESTQ_BLK +
        // "&bwlvs=" +
        // item.BWLVS +
        "&lgtyp=" +
        item.LGTYP +
        "&vbeln_vl=" +
        item.VBELN_VL +
        "&posnr=" +
        item.POSNR +
        "&vbeln=" +
        item.VBELN;

      return {
        ID: null,
        skuCode: matnr,
        packCode: matnr,
        quantity: item.BDMNG,
        unitType: item.MEINS,
        batch: item.CHARG,
        refID: item.VBELN_VL,
        ref1: "R05",
        ref2: item.BWLVS,
        options: options
      };
    });

    document.issueItems = documentItem;

    let documentData = {
      document: document,
      docItem: documentItem
    };
    return documentData;
  };

  const customAdd = () => {
    return (
      <AmEditorTable
        style={{ width: "600px", height: "500px" }}
        titleText={"Load"}
        open={editPopup}
        onAccept={(status, rowdata) => onHandleEditConfirm(status, rowdata)}
        data={editData}
        columns={editorList}
      />
    );
  };

  return (
    <div>
      <AmDialogs
        typePopup={"error"}
        onAccept={e => {
          setOpenError(e);
        }}
        open={openError}
        content={textError}
      ></AmDialogs>

      <AmCreateDocument
        headerCreate={headerCreates} //ข้อมูลตรงด้านบนตาราง
        //columnsModifi={columnsModifi} //ใช้เฉพาะหน้าที่ต้องทำปุ่มเพิ่มขึ้นมาใหม่
        columns={[]} //colums
        columnEdit={[]} //ข้อมูลที่จะแก้ไขใน popUp
        apicreate={apicreate} //api ที่จะทำการสร้างเอกสาร
        createDocType={"custom"} //createDocType มี audit issue recive
        history={props.history} //ส่ง porps.history ไปทุกรอบ
        apiRes={apiRes} //หน้ารายละเอียดเอกสาร
        //btnProps={btnAdd}  //ปุ่มที่ส่งเข้าไป
        //dataSource={dataSou} //ข้อมูลที่จัดการจากปุ่มที่ส่งเข้าไป
        // dataCreate={} //dataที่จะส่งไปสร้างเอกสาร

        //customEditData={(editData)=> setEditData(editData)}
        customAddBtnRender={
          <AmButton
            className="float-right"
            styleType="add"
            style={{ width: "150px" }}
            onClick={() => setEditPopup(true)}
          >
            Load
          </AmButton>
        }
        customAddComponentRender={customAdd()}
        customDataSource={sapResponse}
        customTableColumns={columnsModify}
        customDocumentData={CreateDocument()}
        customGetHeaderData={headerData => setHeaderData(headerData)}
      />

      <div />
    </div>
  );
};

export default AmCreateDocumentR5;
