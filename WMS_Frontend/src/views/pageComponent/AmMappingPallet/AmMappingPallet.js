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
import BoxIcon from "@material-ui/icons/Widgets";
import ItemIcon from "@material-ui/icons/AddShoppingCart";
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
  width: 40px;
  paddingleft: 20px;
`;
const LabelH2 = styled.label`
  font-weight: bold;
  width: 70px;
  paddingleft: 20px;
`;
const LabelH1 = styled.label`
  font-weight: bold;
  width: 100px;
  paddingleft: 20px;
`;
const LabelHText = styled.label`
  width: 60px;
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
  q: '[{ "f": "Status", "c":"=", "v": 1},{ "f": "AreaMasterType_ID", "c":"=", "v": 30}]',
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

  const [showDialog, setShowDialog] = useState(null);
  const [stateDialog, setStateDialog] = useState(false);
  const [msgDialog, setMsgDialog] = useState("");
  const [typeDialog, setTypeDialog] = useState("");

  const [activeStep, setActiveStep] = useState(0);
  const steps = getSteps();
  const [labelBarcode, setLabelBarcode] = useState(null);
  const [isLoad, setIsLoad] = useState(false);

  const [flagConfirm, setFlagConfirm] = useState(false);
  const [docID, setDocID] = useState("");
  const [palletCode, setPalletCode] = useState("");
  const [warehouseID, setWarehouseID] = useState(1);

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

    if (fieldDataKey === "areaID") {
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
      setAreaLocationMasterQuery(AreaLocationMasterQuery)
    }
    valueInput[fieldDataKey] = value;


  };

  const onHandleChangeInputPalletCode = (keydata, value, obj, element, event) => {
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
      { label: "Warehouse", value: null },
      { label: "DocProcessType", value: null },
      { label: "Pallet", value: valueInput.PalletCode === undefined ? null : valueInput.PalletCode },
      { label: "Area&Location", value: null },
      { label: "Barcode", value: null },
      { label: "Detail", value: null }
    ];
  }
  const GetPalletSto = code => {
    if (code) {
      const Query = {
        queryString: window.apipath + "/v2/SelectDataTrxAPI/",
        t: "StorageObject",
        q: '[{ "f": "Status", "c":"=", "v":"1"},{ "f": "Code", "c":"=", "v":"' + code + '"}]',
        f: "*",
        g: "",
        s: "[{'f':'Code','od':'asc'}]",
        sk: 0,
        l: 1,
        all: ""
      };
      var queryStr = createQueryString(Query)
      Axios.get(queryStr).then(res => {
        if (!IsEmptyObject(res.data.datas)) {
          if (res.data.datas.length !== 0) {
            valueInput["areaID"] = res.data.datas[0].AreaMaster_ID
            valueInput["locaionID"] = res.data.datas[0].AreaLocationMaster_ID
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
              onHandleChangeInputPalletCode("PalletCode", e, null, null, null)
          }}
          onKeyPress={(value, obj, element, event) => {
            if (event.key === "Enter") {
              onHandleChangeInputPalletCode("PalletCode", value, obj, element, event)
            }

          }}
        />
      case 3:
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
          dataLoc = AreaLocationMasterQuery
        }

        return <div><FormInline>
          <LabelH1>Area :</LabelH1><AmDropdown
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
        </FormInline>
          <FormInline>
            <LabelH1>AreaLocation :</LabelH1>
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
            />
          </FormInline></div>
      case 4:
        if (dataPallet !== undefined && dataPallet !== null) {
          return (<div>
            <Card>
              <CardContent>
                <div>
                  <FormInline>
                    {/* <LabelH>Pallet:</LabelH> */}
                    <BoxIcon style={{ color: "#795548" }} />{" "}
                    {dataPallet.bsto.code}
                  </FormInline>
                  {dataPallet.bsto.mapstos === null ? null : dataPallet.bsto.mapstos.map((x, index) => {
                    return (
                      <div key={index} syle={{ marginLeft: "30px" }} >
                        <FormInline >
                          <LabelH style={{ marginLeft: "10px" }}><ItemIcon /></LabelH><LabelHText>{x.code}</LabelHText>
                          <LabelH style={{ marginLeft: "5px" }}>Qty : </LabelH><LabelHText>{x.baseQty} {x.unitCode}</LabelHText>
                          <LabelH style={{ marginLeft: "5px" }}>Lot  : </LabelH><LabelHText>{x.lot}</LabelHText>
                        </FormInline>
                      </div>
                    );
                  })}
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
                  onHandleChangeInputPalletCode("barcode", e, null, null, null)
              }}
              onKeyPress={(value, obj, element, event) => {
                if (event.key === "Enter") {
                  onHandleChangeInputPalletCode("barcode", value, obj, element, event)
                }

              }}
            /></div>)
        } else {
          if (valueInput.palletCode !== undefined) {
            return (<div>
              <Card>
                <CardContent>
                  <div>
                    <FormInline>
                      {/* <LabelH>Pallet:</LabelH> */}
                      <BoxIcon style={{ color: "#795548" }} />{" "}
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
                    onHandleChangeInputPalletCode("barcode", e, null, null, null)
                }}
                onKeyPress={(value, obj, element, event) => {
                  if (event.key === "Enter") {
                    onHandleChangeInputPalletCode("barcode", value, obj, element, event)
                  }

                }}
              /></div>)
          }
        }

      case 5:
        //return dataShow;
        console.log(dataDoc)
        if (dataDoc !== undefined && dataDoc !== null) {
          return (<div>
            <Card>
              <CardContent>
                <div>
                  <FormInline>
                    <LabelH2>GR Doc :</LabelH2>
                    {dataDoc.grCode}
                  </FormInline>
                  <FormInline>
                    <LabelH2>PA Doc :</LabelH2>
                    {dataDoc.putawayCode}
                  </FormInline>
                  {dataDoc.datas === null ? null : dataDoc.datas.map((x, index) => {
                    return (
                      <div key={index}>
                        <FormInline>
                          <LabelH2>Item :</LabelH2>
                          {x.pstoCode}
                        </FormInline>
                        <FormInline>
                          <LabelH2>Lot :</LabelH2>
                          {x.lot}
                        </FormInline>
                        <FormInline>
                          <LabelH2>Qty : </LabelH2>{x.addQty} {x.unitTypeCode}

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
    console.log(dataDoc)
    if (dataDoc !== undefined && dataDoc !== null) {

      dataDoc.datas.forEach(element => {
        postdata.pstos.push(element)
      });

    }
    console.log(postdata)
    Axios.post(window.apipath + "/v2/scan_mapping_sto", postdata).then(res => {
      if (res.data._result.status === 1) {
        if (res.data.bsto !== undefined) {

          setDataPallet(res.data)
          if (type === "confirm") {
            alertDialogRenderer("Success", "success", true);
            setActiveStep(4);
            setFlagConfirm(true)
          }
        }
      } else {
        if (dataDoc !== undefined && dataDoc !== null) {
          var dataDocTmp = (dataDoc.datas = null);
          setDataDoc(dataDocTmp)
        }

        alertDialogRenderer(res.data._result.message, "error", true);
      }
    })
  }
  function getDataDocByPallet() {
    Axios.get(window.apipath + `/v2/GetDocByQRCodeAPI?qr=${valueInput.barcode}`).then(res => {
      if (res.data._result.status === 1) {
        setDataDoc(res.data)
      } else {
        alertDialogRenderer(res.data._result.message, "error", true);
      }

    })
  }
  const handleNext = index => {
    if (index === 0) {
      setFlagConfirm(false)
      if (valueInput.warehouseID === undefined)
        valueInput.warehouseID = warehouseID
      setActiveStep(prevActiveStep => prevActiveStep + 1);
    } else if (index === 1) {
      setFlagConfirm(false)
      if (valueInput.processType) {
        setActiveStep(prevActiveStep => prevActiveStep + 1);
      }
      else {
        alertDialogRenderer("ProcessType must be value", "error", true);
      }
    } else if (index === 2) {
      setFlagConfirm(false)
      if (valueInput.PalletCode) {
        setActiveStep(prevActiveStep => prevActiveStep + 1);
      }
      else {
        alertDialogRenderer("PalletCode must be value", "error", true);
      }

    } else if (index === 3) {
      setFlagConfirm(false)
      if (valueInput.areaID) {
        getData()
        setActiveStep(prevActiveStep => prevActiveStep + 1);
      }
      else {
        alertDialogRenderer("Area must be value", "error", true);
      }

    } else if (index === 4) {
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
    setActiveStep(0);
    setValueInput({});
    setFlagConfirm(false)
    setValueInput()
  }
  function handleBack() {
    setDataDoc(null)
    setActiveStep(activeStep - 1);
  }
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
                  <div>
                    {activeStep == 0 ? null : (
                      <AmButton
                        styleType="delete_clear"
                        // onClick={handleReset}
                        onClick={handleBack}

                        className={classes.button}
                      >
                        {/* {t("Clear")} */}
                        {t("Back")}
                      </AmButton>
                    )}{flagConfirm === true ? <AmButton
                      styleType="delete_clear"
                      onClick={handleReset}
                      className={classes.button}
                    >
                      {t("Clear")}
                    </AmButton> : null}
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
