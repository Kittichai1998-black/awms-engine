import React, { useState, useEffect, useRef } from "react";
import { withStyles } from "@material-ui/core/styles";
import {
  apicall,
  createQueryString,
  Clone,
  IsEmptyObject
} from "../../../components/function/CoreFunction";
import AmDialogs from "../../../components/AmDialogs";
import AmButton from "../../../components/AmButton";
import AmInput from "../../../components/AmInput";
import {
  indigo,
  deepPurple,
  lightBlue,
  red,
  grey,
  green
} from "@material-ui/core/colors";
import Paper from "@material-ui/core/Paper";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import StepContent from "@material-ui/core/StepContent";
import Typography from "@material-ui/core/Typography";
import _ from "lodash";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import styled from "styled-components";
import queryString from "query-string";
import { useTranslation } from "react-i18next";
import AmRadioGroup from "../../../components/AmRadioGroup";
import AmDropdown from '../../../components/AmDropdown'
import { DataGenerateElePalletListDisplay } from "../AmMappingPallet/RanderEleListPalletDisplay ";
const Axios = new apicall();

const styles = theme => ({
  root: {
    // maxWidth: '100%',
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"'
    ].join(",")
  },
  paperContainer: {
    maxWidth: "450px",
    width: "100%",
    minWidth: "300px",
    padding: theme.spacing(2, 1)
  },
  stepperContainer: {
    padding: "10px"
  },
  buttonAuto: {
    margin: theme.spacing(),
    width: "auto",
    lineHeight: 1
  },
  button: {
    marginTop: theme.spacing(),
    marginRight: theme.spacing()
  },
  actionsContainer: {
    marginBottom: theme.spacing(2),
    textAlign: "end"
  },
  resetContainer: {
    textAlign: "center"
  },
  tb: {
    fontSize: "18px"
  },
  tbhead: {
    fontWeight: "bold",
    verticalAlign: "top"
  },
  tbdetail: {
    width: "265px",
    whiteSpace: "initial"
  },
  print_size: {
    width: "400px",
    height: "600px",
    padding: "5px 12px",
    backgroundColor: "#ffffff"
  },
  print_title: {
    fontSize: "20px",
    paddingBottom: "5px",
    fontWeight: "bold",
    width: "100px"
  },
  print_detail: {
    fontSize: "36px",
    fontWeight: "bold",
    width: "300px",
    whiteSpace: "initial"
  },
  print_detail2: {
    fontSize: "26px",
    fontWeight: "bold",
    whiteSpace: "initial",
    width: "375px"
  },
  print_footer: {
    fontSize: "12px"
  },
  tb_bottom: {
    verticalAlign: "bottom",
    textAlign: "center"
  },
  tr_bottom: { verticalAlign: "bottom" },
  tr_top: { verticalAlign: "top" },
  divLine: {
    // borderBottom: '2px solid #000000',
    marginTop: 45
  }
});
const FormInline = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  label {
    margin: 5px 0 5px 0;
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
  width: 70px;
  paddingleft: 20px;
`;
const LabelH1 = styled.label`
  font-weight: bold;
  width: 90px;
  paddingleft: 20px;
`;
const DivHidden = styled.div`
  overflow: hidden;
  height: 0;
`;
const StorageObjectViw = {
  queryString: window.apipath + "/v2/SelectDataViwAPI/",
  t: "r_StorageObject",
  q: "",
  f: "*",
  g: "",
  s: "[{'f':'ID','od':'desc'}]",
  sk: 0,
  l: 1,
  all: ""
};
const WarehouseQuery = {
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
const AreaMasterQuery = {
  queryString: window.apipath + "/v2/SelectDataMstAPI/",
  t: "AreaMaster",
  q: '[{ "f": "Status", "c":"=", "v": 1}]',
  f: "Name,Code,ID as areaID",
  g: "",
  s: "[{'f':'ID','od':'asc'}]",
  sk: 0,
  l: 100,
  all: "",
}
const DocumentProcessTypeQuery = {
  queryString: window.apipath + "/v2/SelectDataMstAPI/",
  t: "DocumentProcessType",
  q: '[{ "f": "Status", "c":"=", "v": 1}]',
  f: "ID as processType,Name,Code",
  g: "",
  s: "[{'f':'ID','od':'asc'}]",
  sk: 0,
  l: 100,
  all: "",
}

const AmMappingPallet = props => {
  const { t } = useTranslation();
  const { classes } = props;

  const [valueInput, setValueInput] = useState({});

  const [datas, setDatas] = useState(null);
  const [dataShow, setDataShow] = useState(null);
  const [revNo, setRevNo] = useState(null);

  const [showDialog, setShowDialog] = useState(null);
  const [stateDialog, setStateDialog] = useState(false);
  const [msgDialog, setMsgDialog] = useState("");
  const [typeDialog, setTypeDialog] = useState("");

  const [activeStep, setActiveStep] = useState(0);
  const steps = getSteps();
  const [labelBarcode, setLabelBarcode] = useState(null);
  const [isLoad, setIsLoad] = useState(false);

  const [table, setTable] = useState();
  const [docID, setDocID] = useState("");
  const [palletCode, setPalletCode] = useState("");
  const [warehouseID, setWarehouseID] = useState(1);

  const [valueEdit, setValueEdit] = useState(0);
  const [eleDetailPallet, setEleDetailPallet] = useState();
  const [docName, setDocName] = useState("");
  const [option, setOption] = useState();
  const [dataPallet, setDataPallet] = useState();
  const [dataDoc, setDataDoc] = useState();
  const [areaLocationMasterQuery, setAreaLocationMasterQuery] = useState()
  const alertDialogRenderer = (message, type, state) => {
    setMsgDialog(message);
    setTypeDialog(type);
    setStateDialog(state);
  };
  useEffect(() => {
    if (msgDialog && stateDialog && typeDialog) {
      setShowDialog(
        <AmDialogs
          typePopup={typeDialog}
          content={msgDialog}
          onAccept={e => {
            setStateDialog(e);
          }}
          open={stateDialog}
        />
      );
    } else {
      setShowDialog(null);
    }
  }, [stateDialog, msgDialog, typeDialog]);
  useEffect(() => { }, [valueInput]);
  const onHandleChangeInput = (value, dataObject, inputID, fieldDataKey
  ) => {
    console.log(fieldDataKey)
    console.log(value)
    console.log(dataObject)
    console.log(inputID)
    if (fieldDataKey === "areaID") {
      // let query = AreaLocationMasterQuery.q ? JSON.parse(AreaLocationMasterQuery.q) : ""
      // query.push({ f: "AreaMaster_ID", c: "=", v: value })
      // AreaLocationMasterQuery.q = JSON.stringify(query)
      const AreaLocationMasterQuery = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "AreaLocationMaster",
        q: '[{ "f": "Status", "c":"=", "v": 1},{ "f": "ObjectSize_ID", "c":"=", "v": 1},{ "f": "AreaMaster_ID", "c":"=", "v":' + valueInput.areaID + '}]',
        f: "Code,ID as locaionID,Name",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: "",
      }
      console.log(AreaLocationMasterQuery);
      setAreaLocationMasterQuery(AreaLocationMasterQuery)
    }
    valueInput[fieldDataKey] = value;


  };

  const onHandleChangeInputPalletCode = (keydata, value, obj, element, event) => {
    console.log(value)
    console.log(obj)
    console.log(event)
    console.log(keydata)
    valueInput[keydata] = value;
    if (keydata === "PalletCode") {
      setPalletCode(value);
      GetPalletSto(value);
    }

  };
  function getSteps() {
    var warehouseID = "";
    if (valueInput) {
      if (valueInput.warehouseID) {
        warehouseID = valueInput.warehouseID;
      }
    }
    return [
      { label: "Warehouse", value: warehouseID },
      { label: "DocProcessType", value: null },
      { label: "Pallet", value: null },
      { label: "Area&Location", value: null },
      { label: "Barcode", value: null },
      { label: "Detail", value: null }
    ];
  }
  const GetPalletSto = code => {
    if (code) {
      const Query = {
        queryString: window.apipath + "/v2/SelectDataViwAPI/",
        t: "r_StorageObject",
        q: '[{ "f": "Status", "c":"=", "v":"NEW"},{ "f": "Pallet", "c":"=", "v":"' + code + '"}]',
        f: "*",
        g: "",
        s: "[{'f':'Pallet','od':'asc'}]",
        sk: 0,
        l: 1,
        all: ""
      };
      var queryStr = createQueryString(Query)
      Axios.get(queryStr).then(res => {
        console.log(res.data.datas.length)
        if (!IsEmptyObject(res.data.datas)) {
          if (res.data.datas.length !== 0) {
            console.log(res.data.datas[0].AreaID)

            valueInput["areaID"] = res.data.datas[0].AreaID
            valueInput["locaionID"] = res.data.datas[0].LocationID
          }

        }
      });
    } else {
      alertDialogRenderer("Barcode Pallet must be value", "error", true);
    }
  };
  function getStepContent(step) {
    switch (step) {
      case 0:
        return (
          <div>
            <AmDropdown
              placeholder="Select"
              fieldDataKey="warehouseID" //ฟิล์ดดColumn ที่ตรงกับtable ในdb 
              fieldLabel={["Name"]} //ฟิล์ดที่ต้องการเเสดงผลใน optionList และ ช่อง input
              labelPattern=" : " //สัญลักษณ์ที่ต้องการขั้นระหว่างฟิล์ด
              ddlMinWidth={300} //กำหนดความกว้างของกล่อง dropdown
              queryApi={WarehouseQuery}
              defaultValue={1}
              onChange={(value, dataObject, inputID, fieldDataKey) => onHandleChangeInput(value, dataObject, inputID, fieldDataKey)}
              ddlType={"search"} //รูปแบบ Dropdown 
            />
          </div>
        );
      case 1:
        //return dataShow;
        return <AmDropdown
          placeholder="Select"
          fieldDataKey="processType" //ฟิล์ดดColumn ที่ตรงกับtable ในdb 
          fieldLabel={["Name"]} //ฟิล์ดที่ต้องการเเสดงผลใน optionList และ ช่อง input
          labelPattern=" : " //สัญลักษณ์ที่ต้องการขั้นระหว่างฟิล์ด                        
          ddlMinWidth={300} //กำหนดความกว้างของกล่อง dropdown
          queryApi={DocumentProcessTypeQuery}
          onChange={(value, dataObject, inputID, fieldDataKey) => onHandleChangeInput(value, dataObject, inputID, fieldDataKey)}
          ddlType={"search"} //รูปแบบ Dropdown 
        />
      case 2:
        //return dataShow;
        return <AmInput
          id={"PalletCode"}
          placeholder="Pallet code"
          type="input"
          style={{ width: "100%" }}
          onChange={(value, obj, element, event) =>
            onHandleChangeInput(value, null, "PalletCode", null, event)
          }
          onBlur={(e) => {
            if (e !== undefined && e !== null)
              console.log(e)
            onHandleChangeInputPalletCode("PalletCode", e, null, null, null)
          }}
          onKeyPress={(value, obj, element, event) => {
            if (event.key === "Enter") {
              onHandleChangeInputPalletCode("PalletCode", value, obj, element, event)
              //onBlur={(e) => { if (e !== undefined && e !== null)
              // if (value === "")
              //   setDialogState({ type: "warning", content: "กรุณากรอกข้อมูล MaxVolume", state: true })
            }

          }}
        />
      case 3:
        //return dataShow;
        // console.log(valueInput.areaID)
        // console.log(valueInput.locaionID)
        var dataLoc = null;
        if (valueInput.areaID != undefined) {
          const AreaLocationMasterQuery = {
            queryString: window.apipath + "/v2/SelectDataMstAPI/",
            t: "AreaLocationMaster",
            q: '[{ "f": "Status", "c":"=", "v": 1},{ "f": "ObjectSize_ID", "c":"=", "v": 1},{ "f": "AreaMaster_ID", "c":"=", "v":' + valueInput.areaID + '}]',
            f: "Code,ID as locaionID,Name",
            g: "",
            s: "[{'f':'ID','od':'asc'}]",
            sk: 0,
            l: 100,
            all: "",
          }
          console.log(AreaLocationMasterQuery);
          dataLoc = AreaLocationMasterQuery
          console.log(dataLoc)
        }

        return <div><AmDropdown
          placeholder="Select"
          fieldDataKey="areaID" //ฟิล์ดดColumn ที่ตรงกับtable ในdb 
          fieldLabel={["Name"]} //ฟิล์ดที่ต้องการเเสดงผลใน optionList และ ช่อง input
          labelPattern=" : " //สัญลักษณ์ที่ต้องการขั้นระหว่างฟิล์ด
          ddlMinWidth={300} //กำหนดความกว้างของกล่อง dropdown
          queryApi={AreaMasterQuery}
          defaultValue={valueInput.areaID === undefined ? null : valueInput.areaID}
          onChange={(value, dataObject, inputID, fieldDataKey) => onHandleChangeInput(value, dataObject, inputID, fieldDataKey)}
          ddlType={"search"} //รูปแบบ Dropdown 
        />
          {console.log(dataLoc)}
          <AmDropdown
            placeholder="Select"
            fieldDataKey="locaionID" //ฟิล์ดดColumn ที่ตรงกับtable ในdb 
            fieldLabel={["Name"]} //ฟิล์ดที่ต้องการเเสดงผลใน optionList และ ช่อง input
            labelPattern=" : " //สัญลักษณ์ที่ต้องการขั้นระหว่างฟิล์ด
            ddlMinWidth={300} //กำหนดความกว้างของกล่อง dropdown
            queryApi={dataLoc !== null && dataLoc !== undefined ? dataLoc : areaLocationMasterQuery}
            defaultValue={valueInput.locaionID === undefined ? null : valueInput.locaionID}
            onChange={(value, dataObject, inputID, fieldDataKey) => onHandleChangeInput(value, dataObject, inputID, fieldDataKey)}
            ddlType={"search"} //รูปแบบ Dropdown 
          /></div>
      case 4:
        //return dataShow;
        // var x = getData()
        console.log(dataPallet)
        if (dataPallet !== undefined) {
          return (<div>
            <Card>
              <CardContent>
                <div>
                  <FormInline>
                    <LabelH>Pallet:</LabelH>
                    {dataPallet.bsto.code}
                  </FormInline>
                  {/* {dataPallet.datas === null ? null : dataDoc.datas.map((x, index) => {
                    return (
                      <div key={index}>
                        <FormInline>
                          <LabelH>Item :</LabelH>
                          {x.pstoCode}
                        </FormInline>
                        <FormInline>
                          <LabelH>Lot :</LabelH>
                          {x.lot}
                        </FormInline>
                        <FormInline>
                          <LabelH>Batch :</LabelH>
                          {x.batch}
                        </FormInline>
                        <FormInline>
                          <LabelH>Qty : </LabelH>{x.addQty} {x.unitTypeCode}

                        </FormInline>
                      </div>
                    );
                  })} */}
                </div>
              </CardContent>
            </Card>
            <AmInput
              id={"barcode"}
              placeholder="barcode"
              type="input"
              style={{ width: "100%" }}
              onChange={(value, obj, element, event) =>
                onHandleChangeInput(value, null, "barcode", null, event)
              }
              onBlur={(e) => {
                if (e !== undefined && e !== null)
                  console.log(e)
                onHandleChangeInputPalletCode("barcode", e, null, null, null)
              }}
              onKeyPress={(value, obj, element, event) => {
                if (event.key === "Enter") {
                  onHandleChangeInputPalletCode("barcode", value, obj, element, event)
                  // if (value === "")
                  //   setDialogState({ type: "warning", content: "กรุณากรอกข้อมูล MaxVolume", state: true })
                }

              }}
            /></div>)
        } else {
          return (<div>
            <Card>
              <CardContent>
                <div>
                  <FormInline>
                    <LabelH>Pallet:</LabelH>
                    {valueInput.palletCode}
                  </FormInline>

                </div>
              </CardContent>
            </Card>
            <AmInput
              id={"barcode"}
              placeholder="barcode"
              type="input"
              style={{ width: "100%" }}
              onChange={(value, obj, element, event) =>
                onHandleChangeInput(value, null, "barcode", null, event)
              }
              onBlur={(e) => {
                if (e !== undefined && e !== null)
                  console.log(e)
                onHandleChangeInputPalletCode("barcode", e, null, null, null)
              }}
              onKeyPress={(value, obj, element, event) => {
                if (event.key === "Enter") {
                  onHandleChangeInputPalletCode("barcode", value, obj, element, event)
                }

              }}
            /></div>)
        }

      case 5:
        //return dataShow;
        if (dataDoc !== undefined) {
          return (<div>
            <Card>
              <CardContent>
                <div>
                  <FormInline>
                    <LabelH>GR Doc :</LabelH>
                    {dataDoc.grCode}
                  </FormInline>
                  <FormInline>
                    <LabelH>PA Doc :</LabelH>
                    {dataDoc.putawayCode}
                  </FormInline>
                  {dataDoc.datas === null ? null : dataDoc.datas.map((x, index) => {
                    return (
                      <div key={index}>
                        <FormInline>
                          <LabelH>Item :</LabelH>
                          {x.pstoCode}
                        </FormInline>
                        <FormInline>
                          <LabelH>Lot :</LabelH>
                          {x.lot}
                        </FormInline>
                        <FormInline>
                          <LabelH>Batch :</LabelH>
                          {x.batch}
                        </FormInline>
                        <FormInline>
                          <LabelH>Qty : </LabelH>{x.addQty} {x.unitTypeCode}

                        </FormInline>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>)
        }

      default:
        return "Unknown step";
    }
  }
  function getData(type) {
    let postdata = {
      processType: valueInput.processType,
      bstoCode: valueInput.PalletCode,
      warehouseID: valueInput.warehouseID,
      areaID: valueInput.areaID,
      locationID: null,
      pstos: []
    };
    if (dataDoc !== undefined) {

      dataDoc.datas.forEach(element => {
        console.log(element)
        postdata.pstos.push(element)
      });

    }
    console.log(dataDoc)
    Axios.post(window.apipath + "/v2/scan_mapping_sto", postdata).then(res => {
      if (res.data.bsto !== undefined) {
        console.log(res.data.bsto);
        setDataPallet(res.data)
        if (type === "confirm")
          setActiveStep(4);
      }
    })
  }
  function getDataDocByPallet() {
    console.log(valueInput.barcode)
    Axios.get(window.apipath + `/v2/GetDocByQRCodeAPI?qr=${valueInput.barcode}`).then(res => {
      console.log(res);
      if (res.data._result.status) {
        console.log(res.data);
        setDataDoc(res.data)
      }

    })
  }
  const handleNext = index => {
    if (index === 0) {
      console.log(valueInput.warehouseID)
      console.log(warehouseID)
      if (valueInput.warehouseID === undefined)
        valueInput.warehouseID = warehouseID
      setActiveStep(prevActiveStep => prevActiveStep + 1);
      //GetPalletSto(valueInput.PalletCode);
    } else if (index === 1) {
      //setIsLoad(true); 
      console.log(valueInput.processType)
      if (valueInput.processType) {
        setActiveStep(prevActiveStep => prevActiveStep + 1);
      }
      else {
        alertDialogRenderer("ProcessType must be value", "error", true);
      }

    } else if (index === 2) {
      //setIsLoad(true); 
      if (valueInput.PalletCode) {
        setActiveStep(prevActiveStep => prevActiveStep + 1);
      }
      else {
        alertDialogRenderer("PalletCode must be value", "error", true);
      }

    } else if (index === 3) {
      //setIsLoad(true); 
      if (valueInput.areaID) {
        getData()
        setActiveStep(prevActiveStep => prevActiveStep + 1);
      }
      else {
        alertDialogRenderer("Area must be value", "error", true);
      }

    } else if (index === 4) {
      //setIsLoad(true); 
      console.log(valueInput.barcode)
      if (valueInput.barcode) {
        getDataDocByPallet()
        setActiveStep(prevActiveStep => prevActiveStep + 1);
      }
      else {
        alertDialogRenderer("Barcode must be value", "error", true);
      }

    }
  };

  function handleReset() {
    //setActiveStep(0);
    setActiveStep(activeStep - 1);
    setValueInput({});
    setDataShow(null);
    // setTmp();
    // setLabelBarcode(null);
  }



  const onPutdata = () => {

  };

  return (
    <div className={classes.root}>
      {stateDialog ? (showDialog ? showDialog : null) : null}
      <Paper className={classes.paperContainer}>
        <Stepper
          activeStep={activeStep}
          orientation="vertical"
          className={classes.stepperContainer}
        >
          {steps.map((row, index) => (
            <Step key={row.label}>
              <StepLabel>
                <Typography variant="h6">
                  {t(row.label)}
                  {row.value ? " : " : ""}
                  <label
                    style={{
                      fontWeight: "bolder",
                      textDecorationLine: "underline",
                      textDecorationColor: indigo[700]
                    }}
                  >
                    {row.value}
                  </label>
                </Typography>
              </StepLabel>
              <StepContent>
                {getStepContent(index)}
                <div className={classes.actionsContainer}>
                  <div>{console.log("sss =" + activeStep)}
                    {activeStep == 0 ? null : (
                      <AmButton
                        styleType="delete_clear"
                        onClick={handleReset}
                        className={classes.button}
                      >
                        {t("Clear")}
                      </AmButton>
                    )}
                    {activeStep === steps.length - 1 ? (
                      <AmButton
                        styleType="confirm"
                        onClick={() => {
                          // onPutdata();
                          getData("confirm")
                        }}
                        className={classes.button}
                      >
                        {t("Confirm")}
                      </AmButton>
                    ) : (
                        <AmButton
                          styleType="confirm"
                          onClick={() => handleNext(index)}
                          className={classes.button}
                        >
                          {t("Next")}
                        </AmButton>
                      )}
                  </div>
                </div>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>
      <br />
      <DivHidden>{labelBarcode ? labelBarcode : null}</DivHidden>
    </div>
  );
};

export default withStyles(styles)(AmMappingPallet);
