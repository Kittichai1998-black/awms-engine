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
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
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

  const [queryViewData, setQueryViewData] = useState(Query);
  const [dialog, setDialog] = useState(false);
  const [dataItems, setDataItems] = useState();
  const [dataSource, setDataSource] = useState([])
  const [valueDataRadio, setValueDataRadio] = useState(0);
  const [valueQtyDocItems, setValueQtyDocItems] = useState({});
  const [dataSourceGenPallet, setDataSourceGenPallet] = useState([])
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(999);
  const [genData, setGenData] = useState(false);

  useEffect(() => {
    getData()
    console.log("hguhgirug")
  }, [])
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

  const RanderEle = () => {
    if (props.data) {
      return props.data.map(y => {
        return {
          component: (data, cols, key) => {
            return (
              <div key={key}>
                {DataGenerateRadio()}
                {DataGeneratePopup()}
              </div>
            );
          }
        };
      });
    }
  };
  const handleRadioChange = (checked, val) => {
    setValueDataRadio(val)
    onHandleChangeGeneratePallet()
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
              checked={valueDataRadio === 0}
              onChange={(checked) => handleRadioChange(checked, 0)}
            />}
          label="Single"
        /><FormControlLabel value="1"
          control={
            <Radio color="primary"
            />}
          checked={valueDataRadio === 1}
          label="Multi"
          onChange={(checked) => handleRadioChange(checked, 1)} />
        <br />
      </div>
      <FormInline>{console.log(dataSource[0].MinInnerVolume)}
        <label style={{ fontWeight: "bold", width: "50px" }}>{"Min : "}</label>
        <AmInput id={"field"} style={{ width: "60px" }} type="input"
          defaultValue={dataSource[0].MinInnerVolume === null ? 1 : dataSource[0].MinInnerVolume}
          //onBlur={(value, element, event) => onHandleChangeInputQTY(value, element, event)}
          onKeyPress={(value, obj, element, event) => {
            if (event.key === "Enter")
              setMin(value)
            onHandleChangeGeneratePallet("minVolume", value)
          }}
        />
        <label style={{ width: "60px" }}>{"Volume"}</label>
      </FormInline>
      <FormInline>
        <label style={{ fontWeight: "bold", width: "50px" }}>{"Max : "}</label>
        <AmInput id={"field"} style={{ width: "60px" }} type="input"
          defaultValue={dataSource[0].MaxInnerVolume === null ? 999 : dataSource[0].MaxInnerVolume}
          //onBlur={(value, element, event) => onHandleChangeInputQTY(value, element, event)}
          onKeyPress={(value, obj, element, event) => {
            if (event.key === "Enter")
              setMax(value)
            onHandleChangeGeneratePallet("maxVolume", value)
          }}
        />
        <label style={{ width: "60px" }}>{"Volume"}</label>
      </FormInline>
      <br />
    </div>
  };
  const onHandleChangeGeneratePallet = (field, value) => {
    // console.log(value)
    // console.log(valueDataRadio)
    // console.log(props.data)
    // console.log(min)
    setGenData(true)
    var itemList = [];
    var item = {};
    props.data.forEach(ele => {
      item = {
        docItemID: ele.ID,
        lot: ele.Lot,
        orderNo: ele.OrderNo,
        code: ele.Code,
        vol: 150
      }
    });
    itemList.push(item)

    const dataSend = {
      mode: valueDataRadio,
      minVolume: parseInt(min),
      maxVolume: parseInt(max),
      supplierName: props.SouSupplierName,
      supplierCode: props.SouSupplierCode,
      Item: itemList
    }
    console.log(dataSend)
    Axios.post(window.apipath + "/v2/gen_pallet", dataSend).then((res) => {
      setDataSourceGenPallet(res.data)
    });


  };
  const onHandledataConfirm = (status, rowdata) => {
    if (status) {

      if (!genData) {
        var itemList = [];
        var item = {};
        props.data.forEach(ele => {
          item = {
            docItemID: ele.ID,
            lot: ele.Lot,
            orderNo: ele.OrderNo,
            code: ele.Code,
            vol: 150
          }
        });
        itemList.push(item)

        const dataSend = {
          mode: valueDataRadio,
          minVolume: 1,
          maxVolume: 999,
          supplierName: props.SouSupplierName,
          supplierCode: props.SouSupplierCode,
          Item: itemList
        }
        console.log(dataSend)
        Axios.post(window.apipath + "/v2/gen_pallet", dataSend).then((res) => {
          //setDataSourceGenPallet(res.data)
          onClickLoadPDF(res.data)
        });
      } else {
        onClickLoadPDF()
      }

      //onClickLoadPDF()
    } else {
      setDialog(false)
    }
    return null
  }
  const onClickLoadPDF = async (data) => {
    console.log(dataSourceGenPallet)

    try {

      await Axios.postload(window.apipath + "/v2/download/print_tag_code", data == null ? dataSourceGenPallet : data, "printcode.pdf").then();

    } catch (err) {
      console.log(err)
    }
  }
  return (
    <div>

      <AmEditorTable
        open={dialog}
        onAccept={(status, rowdata) => onHandledataConfirm(status, rowdata)}
        titleText={"Generate BarCode Detail"}
        data={props.data}
        columns={RanderEle()}
      />
      <AmButton
        style={{ marginRight: "5px" }}
        styleType="confirm"
        onClick={() => {
          console.log(props.data)
          // setDataItems(props.data)
          setDialog(true)

        }}
      >
        BARCODE
        </AmButton>

    </div>
  );
};
export default AmPrintBarCode;
