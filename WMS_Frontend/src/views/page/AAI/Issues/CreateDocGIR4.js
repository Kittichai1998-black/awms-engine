import React, { useState, useRef, createRef } from "react";

import { AmEditorTable } from "../../../../components/table";

import { apicall } from "../../../../components/function/CoreFunction";

import AmCreateDocument from "./AmCreateDocument";
import AmButton from "../../../../components/AmButton";
import AmInput from "../../../../components/AmInput";
import styled from "styled-components";
import AmFindPopup from "../../../../components/AmFindPopup";
// import { createQueryString } from '../../../../components/function/CoreFunction2'
import AmDialogs from "../../../../components/AmDialogs";
import AmAux from "../../../../components/AmAux";
import Radio from "@material-ui/core/Radio";
import FormControlLabel from "@material-ui/core/FormControlLabel";

const Axios = new apicall();

const FormInline = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  label {
    margin: 5px 5px 5px 0;
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

const InputDiv = styled.div`
  margin: 5px;
  @media (max-width: 800px) {
    margin: 0;
  }
`;

export default props => {
  const [sapResponse, setSAPResponse] = useState([]);
  const [headerData, setHeaderData] = useState([]);
  const [editPopup, setEditPopup] = useState(false);
  const [editData, setEditData] = useState(
    {}
    // {
    //     LGTYP: "C00",
    //     LGBER: "001",
    //     LGPLA: "C00"
    // }
  );
  const [dialogError, setDialogError] = useState({
    status: false,
    type: "error",
    message: null
  });

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
        texts: "R4-เบิกพาเลทเต็มและรับคืนภายหลัง",
        valueTexts: "R04"
      }
    ]
  ];

  // const BaseCode = {
  //     queryString: window.apipath + "/v2/SelectDataTrxAPI/",
  //     t: "StorageObject",
  //     q: '[{ "f": "ParentStorageObject_ID", "c":"is not null"}]', //เงื่อนไข '[{ "f": "Status", "c":"<", "v": 2}]'
  //     f: "Code",
  //     g: "Code",
  //     s: "[{'f':'Code','od':'ASC'}]",
  //     sk: 0,
  //     l: 100,
  //     all: ""
  // }

  // const columsFindpopUpPalletCode = [
  //     {
  //         Header: 'SU No.',
  //         accessor: 'Code',
  //         fixed: 'left',
  //         // width: 130,
  //         sortable: true
  //     }
  // ];

  const columnEdit = [
    {
      Header: "Reservation Number",
      accessor: "RSNUM",
      type: "input",
      sub_type: "number"
    },
    { Header: "SU No.", accessor: "LENUM", type: "input" },
    // { Header: "SU No.", accessor: 'Code', type: "findPopUp", idddl: "SUCode", queryApi: BaseCode, fieldLabel: ["Code"], columsddl: columsFindpopUpPalletCode, placeholder: "Select SU" },
    {
      Header: "Available Stock",
      accessor: "BESTQ_UR",
      type: "radio",
      value: ["Y", "N"],
      labelHeader: ["Yes", "No"]
    },
    {
      Header: "Stock in Quality Control",
      accessor: "BESTQ_QI",
      type: "radio",
      value: ["Y", "N"],
      labelHeader: ["Yes", "No"]
    },
    {
      Header: "Blocked Stock",
      accessor: "BESTQ_BLK",
      type: "radio",
      value: ["Y", "N"],
      labelHeader: ["Yes", "No"]
    }
  ];

  const ref = useRef(columnEdit.map(() => createRef()));

  var columnsModify = [
    { Header: "SU No.", accessor: "LENUM" },
    { Header: "Reservation", accessor: "RSNUM" },
    { Header: "Material", accessor: "MATNR" },
    // { Header: 'Batch', accessor: 'CHARG' },
    { Header: "Quantity", accessor: "BDMNG" },
    { Header: "Unit", accessor: "MEINS" },
    { Header: "Dest. Styp.", accessor: "LGTYP" },
    { Header: "BIN", accessor: "LGPLA" },
    { Header: "MVT", accessor: "BWLVS" },
    { Header: "UR", accessor: "BESTQ_UR" },
    { Header: "QI", accessor: "BESTQ_QI" },
    { Header: "Blocked", accessor: "BESTQ_BLK" }
  ];

  const apicreate = "/v2/CreateGIDocAPI/"; //API สร้าง Doc
  const apiRes = "/issue/detail?docID=";

  const sapConnectorR4 = postData => {
    Axios.post(window.apipath + "/v2/SAPZWMRF003R4API", postData).then(res => {
      if (res.data._result.status) {
        if (!res.data.datas[0].ERR_MSG) {
          res.data.datas.forEach((row, i) => {
            if (row.LENUM) res.data.datas[i].LENUM = postData.LENUM;
          });
          setSAPResponse(res.data.datas);
        } else {
          setDialogError({
            status: true,
            message: res.data.datas[0].ERR_MSG
          });
        }
      } else {
        setDialogError({
          status: true,
          message: res.data._result.message
        });
      }
    });
  };

  const onHandleEditConfirm = (status, rowdata) => {
    if (status) {
      // let postData = {}
      // postData.RSNUM = rowdata.RSNUM
      // postData.LENUM = rowdata.Code
      // postData.BESTQ_BLK = rowdata.BESTQ_BLK
      // postData.BESTQ_QI = rowdata.BESTQ_QI
      // postData.BESTQ_UR = rowdata.BESTQ_UR
      rowdata._token = localStorage.getItem("Token");
      sapConnectorR4(rowdata);
    }
    setEditData({});
    setEditPopup(false);
  };

  const editorListcolunm = () => {
    if (columnEdit) {
      return columnEdit.map((row, index) => {
        return {
          field: row.accessor,
          component: (data = null, cols, key) => {
            return <div key={key}>{getTypeEditor(row, index, data, cols)}</div>;
          }
        };
      });
    }
  };
  const getTypeEditor = (row, index, data, cols) => {
    if (row.type === "input") {
      return (
        <FormInline>
          <LabelH>{row.Header} : </LabelH>
          <InputDiv>
            <AmInput
              style={row.style ? row.style : { width: "300px" }}
              type={row.sub_type ? row.sub_type : null}
              defaultValue={row.defultValue ? row.defultValue : ""}
              inputRef={ref.current[index]}
              validate={true}
              msgError="Error"
              regExp={row.validate ? row.validate : ""}
              onChange={value => {
                onChangeEditor(row.accessor, value);
              }}
            />
          </InputDiv>
        </FormInline>
      );
    } else if (row.type === "findPopUp") {
      return (
        <FormInline>
          <LabelH>{row.Header} : </LabelH>
          <InputDiv>
            <AmFindPopup
              id={row.idddl}
              popupref={ref.current[index]}
              placeholder={row.placeholder ? row.placeholder : "Select"}
              // fieldDataKey="ID" //ฟิล์ดดColumn ที่ตรงกับtable ในdb
              labelPattern=" : " //สัญลักษณ์ที่ต้องการขั้นระหว่างฟิล์ด
              fieldLabel={row.fieldLabel} //ฟิล์ดที่ต้องการเเสดงผลใน ช่อง input
              // valueData={valueFindPopupin[idddl]} //ค่า value ที่เลือก
              labelTitle="Search of Code" //ข้อความแสดงในหน้าpopup
              queryApi={row.queryApi} //object query string
              // defaultValue={row.data ? data[accessor] : ""}
              columns={row.columsddl} //array column สำหรับแสดง table
              width={row.width ? row.width : 300}
              ddlMinWidth={row.width ? row.width : 100}
              onChange={(value, dataObject, inputID, fieldDataKey) =>
                onChangeEditor(
                  row.accessor,
                  dataObject ? dataObject[row.accessor] : null,
                  dataObject
                )
              }
            />
          </InputDiv>
        </FormInline>
      );
    } else if (row.type === "radio") {
      return (
        <FormInline>
          <LabelH>{row.Header} : </LabelH>
          <InputDiv>
            {row.value.map((x, idx) => {
              return (
                <FormControlLabel
                  key={idx}
                  value={x}
                  name={row.accessor}
                  checked={editData[row.accessor] === x}
                  onChange={e => onChangeEditor(row.accessor, e.target.value)}
                  control={<Radio color="primary" />}
                  label={row.labelHeader[idx]}
                />
              );
            })}
          </InputDiv>
        </FormInline>
      );
    }
  };

  const onChangeEditor = (field, value, valueObject) => {
    if (value) {
      editData[field] = value;
    } else {
      delete editData[field];
    }
    setEditData({ ...editData });
  };

  const CreateDocument = () => {
    let MVTgroup = sapResponse
      .map(row => row.BWLVS)
      .filter((val, i, obj) => obj.indexOf(val) === i)
      .join();
    let RSNUMgroup = sapResponse
      .map(row => row.RSNUM)
      .filter((val, i, obj) => obj.indexOf(val) === i)
      .join();
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
      ref1: "R04",
      ref2: MVTgroup,
      refID: RSNUMgroup,
      remark: headerData.remark === undefined ? null : headerData.remark,
      receiveItems:
        headerData.receiveItems === undefined ? null : headerData.receiveItems
    };

    let documentItem = sapResponse.map((item, idx) => {
      let options =
        "bestq_ur=" +
        item.BESTQ_UR +
        "&bestq_qi=" +
        item.BESTQ_QI +
        "&bestq_blk=" +
        item.BESTQ_BLK +
        "&lgpla=" +
        item.LGPLA +
        "&rsnum=" +
        item.RSNUM +
        "&lenum=" +
        item.LENUM +
        "&basecode=" +
        item.LENUM +
        "&lgtyp=" +
        item.LGTYP;
      return {
        ID: null,
        skuCode: item.MATNR,
        packCode: item.MATNR,
        quantity: item.BDMNG,
        unitType: item.MEINS,
        // batch: item.CHARG,
        ref1: "R04",
        ref2: item.BWLVS,
        refID: item.RSNUM,
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
        columns={editorListcolunm()}
      />
    );
  };

  return (
    <AmAux>
      <AmDialogs
        typePopup={dialogError.type}
        content={dialogError.message}
        onAccept={e => {
          setDialogError(e);
        }}
        open={dialogError.status}
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
    </AmAux>
  );
};
