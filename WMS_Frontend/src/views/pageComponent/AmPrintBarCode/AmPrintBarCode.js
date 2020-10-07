import _ from "lodash";
import queryString from "query-string";
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import {
  apicall,
  createQueryString, IsEmptyObject
} from "../../../components/function/CoreFunction";
import AmButton from "../../../components/AmButton";
import AmInput from "../../../components/AmInput";
import AmEditorTable from "../../../components/table/AmEditorTable";
import { DataGenerateElePopDisplay } from "../AmPrintBarCode/RanderElePopDisplay";
import { DataGenerateElePalletListDisplay } from "../AmPrintBarCode/RanderEleListPalletDisplay ";
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import AmDialogs from "../../../components/AmDialogs";

const Axios = new apicall();

const LabelH = styled.label`
  font-weight: bold;
  width: 200px;
`;
const LabelD = styled.label`
font-size: 10px
  width: 50px;
`;
const InputDiv = styled.div``;
const FormInline = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  label {
    margin: 5px 0 5px 0;
    margin-left: 5px;
  }
  input {
    vertical-align: middle;
  }
  @media (max-width: 800px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const AmPrintBarCode = props => {
  const { t } = useTranslation();


  const Query = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "ObjectSize",
    q: '[{ "f": "ObjectType", "c":"=", "v": 1}]',
    f: "*",
    g: "",
    s: '[{"f":"ID","od":"asc"}]',
    sk: 0,
    l: 100,
    all: ""
  };

  //const [queryViewData, setQueryViewData] = useState(Query);
  const [dialog, setDialog] = useState(false);
  const [dataItemsSend, setDataItemsSend] = useState();
  const [dataSource, setDataSource] = useState([])
  const [valueDataRadio, setValueDataRadio] = useState(1);
  const [valueQty, setValueQty] = useState({ min: 1, max: 999 });
  const [dataSourceGenPallet, setDataSourceGenPallet] = useState([])
  const [genData, setGenData] = useState(false);
  const [dialogState, setDialogState] = useState({});


  useEffect(() => {

    getData()
  }, [])

  useEffect(() => {
    setDialog(props.open)
    //genDataPalletList()
  }, [props.open])
  useEffect(() => {

    genDataPalletList()
  }, [props.open])
  function getData() {
    const Query = {
      queryString: window.apipath + "/v2/SelectDataMstAPI/",
      t: "ObjectSize",
      q: '[{ "f": "ObjectType", "c":"=", "v": 1}]',
      f: "*",
      g: "",
      s: '[{"f":"ID","od":"asc"}]',
      sk: 0,
      l: 100,
      all: ""
    };

    var queryStr = createQueryString(Query)
    Axios.get(queryStr).then(res => {
      setDataSource(res.data.datas)
    });

  }
  const genDataPalletList = () => {

    var itemList = [];
    var item = {};
    if (props.data !== undefined) {
      props.data.forEach(ele => {
        item = {
          docItemID: ele.ID,
          lot: ele.SKUMasterTypeName === "Pack Material" || ele.SKUMasterTypeName === "Other" ? ele.Ref1 : ele.Lot,
          orderNo: ele.OrderNo,
          code: ele.Code,
          name: ele.SKUMaster_Name,
          unit: ele.UnitType_Code,
          skuType: ele.SKUMasterTypeName,
          vol: ele.Volume * ele.Quantity,
          skuType: ele.SKUMasterTypeName,
          expdate: ele.ExpireDate,
          prodDate: ele.ProductionDate,
          quantity: ele.Quantity,
          volsku: ele.Volume
        }
        itemList.push(item)
      });


      const dataSend = {
        mode: valueDataRadio,
        docID: props.docID,
        minVolume: 1,
        maxVolume: 10000,
        supplierName: props.SouSupplierName,
        supplierCode: props.SouSupplierCode,
        remark: props.Remark,
        Item: itemList
      }
      // console.log(dataSend)
      setDataItemsSend(dataSend)
      Axios.post(window.apipath + "/v2/gen_pallet", dataSend).then((res) => {
        // console.log(res.data)
        if (res.data._result.status === 1) {
          setDataItemsSend(res.data)
        } else {
          setDialogState({ type: "error", content: res.data._result.message, state: true })
        }

      });
      return null;
    }
  };
  const RanderEle = () => {
    if (props.data) {

      const columns = [{ field: "Code" }]
      return columns.map(y => {
        return {
          component: (data, cols, key) => {
            return (
              <div >
                {DataGenerateRadio()}
                {DataGeneratePopup()}
                <br />
                {DataGenerateElePalletListDisplay(dataItemsSend)}
              </div>
            );
          }
        };
      });

    }
  };
  const handleRadioChange = (checked, val) => {
    setValueDataRadio(val)
    onHandleChangeGeneratePallet(valueQty, val)
    return null;
  };
  const DataGeneratePopup = () => {
    return DataGenerateElePopDisplay(props.data)
  };
  const DataGenerateRadio = () => {

    return <div style={{ marginBottom: "10px", border: "solid", borderColor: "#9E9E9E" }}>
      <div style={{ textAlign: "center" }}>
        <FormControlLabel value="0"
          control={
            <Radio color="primary"
              checked={valueDataRadio === 1}
              onChange={(checked) => handleRadioChange(checked, 1)}
            />}
          label={t("Single")}
        /><FormControlLabel value="1"
          control={
            <Radio color="primary"
            />}
          checked={valueDataRadio === 0}
          label={t("Multi")}
          onChange={(checked) => handleRadioChange(checked, 0)} />
        <br />
      </div>
      {/* <FormInline>
        <label style={{ fontWeight: "bold", width: "50px" }}>{t("Min") + " : "}</label>
        <AmInput id={"field"} style={{ width: "60px" }} type="number" disabled={true}
          defaultValue={dataSource[0].MinInnerVolume === null ? 1 : dataSource[0].MinInnerVolume}
          onKeyPress={(value, obj, element, event) => {
            if (event.key === "Enter") {

              if (value === "")
                setDialogState({ type: "warning", content: "กรุณากรอกข้อมูล MinVolume", state: true })

              onHandleChangeGeneratePallet({ min: value }, valueDataRadio)
            }
          }}
          onBlur={(e) => {
            if (e !== undefined && e !== null)
              onHandleChangeGeneratePallet({ min: e }, valueDataRadio)
          }}
        />
        <label style={{ width: "60px" }}>{t("Volume")}</label>
      </FormInline>
      <FormInline>
        <label style={{ fontWeight: "bold", width: "50px" }}>{t("Max") + " : "}</label>
        <AmInput id={"field"} style={{ width: "60px" }} type="number"
          defaultValue={dataSource[0].MaxInnerVolume === null ? 999 : dataSource[0].MaxInnerVolume}
          onKeyPress={(value, obj, element, event) => {
            if (event.key === "Enter") {

              if (value === "")
                setDialogState({ type: "warning", content: "กรุณากรอกข้อมูล MaxVolume", state: true })

              onHandleChangeGeneratePallet({ max: value }, valueDataRadio)
            }

          }}
          onBlur={(e) => {
            if (e !== undefined && e !== null)
              onHandleChangeGeneratePallet({ max: e }, valueDataRadio)
          }}
        />
        <label style={{ width: "60px" }}>{"Volume"}</label>
      </FormInline> */}
      <br />
    </div>
  };
  const onHandleChangeGeneratePallet = (value, mode) => {
    // console.log(value)
    setValueQty({ min: 1, max: 10000 })
    setGenData(true)
    var itemList = [];
    var item = {};

    props.data.forEach(ele => {
      item = {
        docItemID: ele.ID,
        lot: ele.SKUMasterTypeName === "Pack Material" || ele.SKUMasterTypeName === "Other" ? ele.Ref1 : ele.Lot,
        orderNo: ele.OrderNo,
        code: ele.Code,
        name: ele.SKUMaster_Name,
        unit: ele.UnitType_Code,
        skuType: ele.SKUMasterTypeName,
        vol: ele.Volume * ele.Quantity,
        skuType: ele.SKUMasterTypeName,
        expdate: ele.ExpireDate,
        prodDate: ele.ProductionDate,
        quantity: ele.Quantity,
        volsku: ele.Volume


      }
      itemList.push(item)
    });

    // console.log(valueQty)
    const dataSend = {
      mode: mode,
      docID: props.docID,
      minVolume: 1,
      maxVolume: 10000,
      // minVolume: valueQty === undefined ? 1 : (valueQty.min === undefined ? 1 : (value.min !== undefined ? parseInt(value.min) : 1)),
      // maxVolume: valueQty === undefined ? 10000 : (valueQty.max === undefined ? 10000 : (value.max !== undefined ? parseInt(value.max) : 999)),
      supplierName: props.SouSupplierName,
      supplierCode: props.SouSupplierCode,
      Item: itemList
    }
    // console.log(dataSend)
    Axios.post(window.apipath + "/v2/gen_pallet", dataSend).then((res) => {
      // console.log(res.data)
      setDataSourceGenPallet(res.data)
      setDataItemsSend(res.data)
    });


  };
  const onHandledataConfirm = (status, rowdata) => {
    if (status) {
      if (!genData) {
        onClickLoadPDF(dataItemsSend)
      } else {
        onClickLoadPDF()
      }
    } else {
      setDialog(false)
      props.onClose(false)
      Clear()
    }

  }
  const onClickLoadPDF = async (data) => {

    try {
      // console.log(data)
      // console.log(dataSourceGenPallet)
      await Axios.postload(window.apipath + "/v2/download/print_tag_code", data == undefined ? dataSourceGenPallet : data, "printcode.pdf").then();
      setDialog(false)
      setDialogState({ type: "success", content: "Success", state: true })
      Clear()
      props.onClose(false)
    } catch (err) {
      setDialogState({ type: "error", content: err.message, state: true })
      Clear()
      props.onClose(false)
    }
  }

  const Clear = () => {
    setDataItemsSend()
    setValueQty({ min: 1, max: 999 })
    setValueDataRadio(1)
    setGenData(false)
  }


  return (
    <div>
      {console.log(props.data)}
      <AmDialogs
        typePopup={dialogState.type}
        onAccept={(e) => { setDialogState({ ...dialogState, state: false }) }}
        open={dialogState.state}
        content={dialogState.content} />
      <AmEditorTable
        open={dialog}
        onAccept={(status, rowdata) => onHandledataConfirm(status, rowdata)}
        titleText={t("Generate QRCode Detail")}
        data={props.data}
        columns={RanderEle()}
      />

      {/* <AmButton
        style={{ marginRight: "5px" }}
        styleType="confirm"
        onClick={() => {
          if (props.data.length === 0) {
            setDialogState({ type: "warning", content: "กรุณาเลือกข้อมูล", state: true })
          } else {
            genDataPalletList()
            setDialog(true)
          }
        }}
      >
        QRCODE AUTO
        </AmButton> */}

    </div>
  );
};
export default AmPrintBarCode;
