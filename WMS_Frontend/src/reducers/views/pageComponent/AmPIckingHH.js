import React, { useState, useEffect, useRef } from "react";
import { withStyles } from "@material-ui/core/styles";
import {
  apicall,
  createQueryString
} from "../../components/function/CoreFunction";
import AmDialogs from "../../components/AmDialogs";
import AmButton from "../../components/AmButton";
import AmInput from "../../components/AmInput";
import {
  indigo,
  deepPurple,
  lightBlue,
  red,
  grey,
  green
} from "@material-ui/core/colors";
import moment from "moment";
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
import PropTypes from "prop-types";
import queryString from "query-string";
import Grid from "@material-ui/core/Grid";
const Axios = new apicall();

const styles = theme => ({
  root: {
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
  stepLabel: {
    fontWeight: "bold",
    fontSize: "medium"
  },
  avatarHead: {
    // color: '#fff',
    width: "35px",
    height: "35px",
    // marginRight: '0px',
    backgroundColor: "#fff"
  },
  avatarHeadStatus: {
    width: "30px",
    height: "30px",
    fontSize: "1.125em"
  },
  cardHeader: {
    padding: "5px 0px 5px 5px"
  },
  cardTitle: {
    fontWeight: "bolder",
    fontSize: "1em"
  },
  cardAvatar: {
    marginRight: "10px"
  },
  avatar2: {
    width: "30px",
    height: "30px",
    // color: '#fff',
    backgroundColor: "#fff"
  },
  avatarStatus: {
    width: "25px",
    height: "25px"
  },
  textNowrap: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "block",
    whiteSpace: "nowrap"
  },
  labelHead: {
    fontWeight: "bold",
    display: "inline-block"
  },
  divLevel1: { display: "block" },
  divLevel2: { marginLeft: 22, display: "block" },
  chip: {
    margin: "2px 2px",
    height: "24px",
    // padding: '1px',
    borderRadius: "15px",
    backgroundColor: "rgba(255, 255, 255, 0.2)"
  },
  avatar: {
    width: 24,
    height: 24,
    color: "#fff",
    fontSize: "95%",
    backgroundColor: grey[500]
  },
  listRoot: {
    width: "100%",
    padding: "5px 5px"
  },
  listItemAvatarRoot: {
    minWidth: "30px",
    maxWidth: "30px"
  },
  inline: {
    display: "inline"
  },
  gutters: {
    padding: "0px 5px 0px 35px"
  },
  guttersHead: {
    padding: "0px 5px 0px 5px"
  },
  gutters2: { paddingRight: "40px" },
  bgFocus: {
    // backgroundColor: red[50],
    borderRadius: "5px",
    backgroundColor: "rgba(255, 224, 0, 0.3)"
  }
});

const BaseMaster = {
  queryString: window.apipath + "/v2/SelectDataMstAPI/",
  t: "BaseMaster",
  q: '[{ "f": "Status", "c":"=", "v": 1}]',
  f: "ID,Code",
  g: "",
  s: "[{'f':'ID','od':'asc'}]",
  sk: 0,
  all: ""
};

const AreaLocationMaster = {
  queryString: window.apipath + "/v2/SelectDataMstAPI/",
  t: "AreaLocationMaster",
  q: '[{ "f": "Status", "c":"=", "v": 1}]',
  f: "ID,Code,Name",
  g: "",
  s: "[{'f':'ID','od':'asc'}]",
  sk: 0,
  all: ""
};

const AmPIckingHH = props => {
  const { classes } = props;

  const [valueInput, setValueInput] = useState({});

  const [showDialog, setShowDialog] = useState(null);
  const [stateDialog, setStateDialog] = useState(false);
  const [msgDialog, setMsgDialog] = useState("");
  const [typeDialog, setTypeDialog] = useState("");

  const [activeStep, setActiveStep] = useState(0);
  const [dataShow, setDataShow] = useState(null);
  const [dataShowPick, setDataShowPick] = useState(null);
  const [locationID, setLocationID] = useState(null);

  const [baseID, setBaseID] = useState(null);
  const [documentID, setDocumentID] = useState(null);
  const [pallet, setPallet] = useState(null);
  const [palletID, setPalletID] = useState(null);
  const [listItems, setListItems] = useState(null);
  const [stoList, setStoList] = useState(null);

  const [docID, setDocID] = useState("");
  const [docCode, setDocCode] = useState("");

  const steps = getSteps();

  const handleNext = index => {
    if (index === 0) {
      GetDataFromPallet(valueInput.PalletCode);
      //CheckAreaLocation(valueInput.LocationCode);
    }
    if (index === 1) {
      GetDataFromDoc(listItems, pallet);
    }
    if (index === 2) {
      onHandleClickPicking();
    }
  };
  const handleBack = index => {
    if (index === 1) {
      setLocationID(null);
      setValueInput({
        ...valueInput,
        ["DocID"]: null,
        ["PalletCode"]: null
      });
      // setValueInput({ ...valueInput, ['PalletCode']: null })
    }
    if (index === 2) {
      setValueInput({ ...valueInput, ["PalletCode"]: null });
      setBaseID(null);
      setDataShow(null);
      //setDocCode(null);
      setDocCode(null);
      GetDataFromPallet(pallet, index);

      //GetDataFromDoc(docID, pallet, docCode);
      //setDataShowPick(null);
    }

    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  function handleReset() {
    setActiveStep(0);
    setValueInput({});
    setDataShow(null);
    setLocationID(null);
    setDataShowPick(null);
    setDocCode(null);
  }
  useEffect(() => {}, [valueInput]);
  useEffect(() => {}, [valueInput.PalletCode]);
  const onHandleChangeInput = (
    value,
    dataObject,
    field,
    fieldDataKey,
    event
  ) => {
    valueInput[field] = value;
  };

  const onHandleChangeInputPalletCode = (
    value,
    dataObject,
    field,
    fieldDataKey,
    event
  ) => {
    if (event && event.key == "Enter") {
      valueInput[field] = value;
      GetDataFromPallet(value);
    }
  };

  //==================================================================================
  async function GetDataFromPallet(reqPalletCode, dataIndex) {
    if (reqPalletCode) {
      await Axios.get(
        window.apipath +
          "/v2/SelectPickingManualAPI/?palletCode=" +
          reqPalletCode
      ).then(rowselect => {
        if (rowselect.data._result.status === 1) {
          if (rowselect.data.docItems != null) {
            //setBaseID(rowselect.data.docItems.id);
            setListItems(rowselect.data.docItems);
            setPallet(reqPalletCode);

            if (rowselect.data.docItems) {
              setDataShow(
                DataShowRenderer(rowselect.data.docItems, reqPalletCode)
              );
              if (dataIndex !== 2) {
                setActiveStep(prevActiveStep => prevActiveStep + 1);
              }
            }
          } else {
            alertDialogRenderer("Document of pallet Not Found", "error", true);
            ClearInput("PalletCode");
          }
        } else {
          alertDialogRenderer(rowselect.data._result.message, "error", true);
        }
      });
    }
  }
  //==================================================================================
  const DataShowRenderer = (data, reqPalletCode) => {
    console.log(data);
    return data.map((list, index) => {
      return (
        <Card
          key={index}
          style={{
            backgroundColor: props.styleBGCardDetail
              ? props.styleBGCardDetail
              : ""
          }}
        >
          <CardContent>
            {props.displayDetail.map((x, index) => {
              return (
                <div key={index}>
                  <label style={{ fontWeight: "bolder" }}>{x.Name} : </label>{" "}
                  {list[x.field]}
                  {x.Name === "Document" ? (
                    <label style={{ marginLeft: "70px" }}>
                      {moment(list["createtime"]).format("DD/MM/YYYY")}
                    </label>
                  ) : null}
                </div>
              );
            })}
            <div>
              <Grid container spacing={3}>
                <Grid item xs={3} />
                <Grid item xs={3} />
                <Grid item xs={3} />
                <Grid item xs={3}>
                  <AmButton
                    style={{ float: "right" }}
                    styleType="info"
                    onClick={() =>
                      GetDataFromDoc(list.docID, reqPalletCode, list.docCode)
                    }
                    className={classes.button}
                  >
                    Select
                  </AmButton>
                </Grid>
              </Grid>
            </div>
          </CardContent>
        </Card>
      );
    });
  };
  //==================================================================================
  async function GetDataFromDoc(docID, reqPalletCode, docCode) {
    Axios.get(
      window.apipath +
        "/v2/SelectPickingManualAPI/?palletCode=" +
        reqPalletCode +
        "&docID=" +
        docID
    ).then(rowselect => {
      if (rowselect.data._result.status === 1) {
        if (rowselect.data.stos != null) {
          setPalletID(rowselect.data.palletID);
          //setBaseID(rowselect.data.docItems.id);
          if (rowselect.data.stos) {
            setDataShowPick(
              ShowDataPick(rowselect.data.stos, rowselect.data.docItems)
            );
            setStoList(rowselect.data.stos);
            setDocCode(docCode);
            setDocID(docID);
            setActiveStep(prevActiveStep => prevActiveStep + 1);
          }
        } else {
          alertDialogRenderer("Items of Document Not Found", "error", true);
          ClearInput("PalletCode");
        }
      } else {
        alertDialogRenderer(rowselect.data._result.message, "error", true);
      }
    });
  }
  function handleReset() {
    setActiveStep(0);
    setPallet(null);
    // setLabelBarcode(null);
  }
  //==================================================================================
  const ShowDataPick = (data, docItems) => {
    return data.map((list, index) => {
      return (
        <Card
          key={index}
          style={{
            backgroundColor: props.styleBGCardDetail
              ? props.styleBGCardDetail
              : ""
          }}
        >
          <CardContent>
            {props.displayDetailDataPick.map((x, index) => {
              return (
                <div key={index}>
                  <label style={{ fontWeight: "bolder" }}>{x.Name} : </label>{" "}
                  {x.field === "OrderNo"
                    ? docItems[0].pickItems[0].orderNo
                    : list[x.field]}
                </div>
              );
            })}
            {props.getOption === true
              ? props.columnsOptions.map((options, index) => {
                  var qryStr = queryString.parse(list.item);
                  return (
                    <div key={index}>
                      <label style={{ fontWeight: "bolder" }}>
                        {options.Name} :{" "}
                      </label>{" "}
                      {qryStr[options.field]}
                    </div>
                  );
                })
              : null}
            <div>
              <label style={{ fontWeight: "bolder" }}>Pallet Quantity : </label>{" "}
              {list.palletQty} {list.unitType}
            </div>
            <div>
              <label style={{ fontWeight: "bolder" }}>Pick : </label>{" "}
              {/* {list.shouldPick} /{" "}
              {list.canPick > list.palletQty ? list.palletQty : list.canPick}{" "}
              {list.unitType} */}
              {docItems[0].pickItems[0].willPick} /{" "}
              {docItems[0].pickItems[0].willPick}
            </div>
          </CardContent>
        </Card>
      );
    });
  };
  //==================================================================================
  const onHandleClickPicking = () => {
    const pickedItemList = stoList.filter(x => x.pick);
    let pickedList = pickedItemList.map(x => {
      return {
        docItemID: x.docItemID,
        STOID: x.stoid,
        packCode: x.packCode,
        batch: x.batch,
        lot: x.lot,
        palletQty: x.palletQty,
        picked: x.shouldPick,
        canPick: x.canPick
      };
    });
    const data = {
      palletCode: pallet,
      palletID: palletID,
      docID: docID,
      pickedList: pickedList
    };
    Axios.post(window.apipath + "/v2/UpdateIssuedPickingManualAPI", data).then(
      res => {
        if (res.data._result.status === 1) {
          handleReset();
          alertDialogRenderer("Success", "success", true);
        } else {
          alertDialogRenderer(res.data._result.message, "error", true);
        }
      }
    );
  };
  //==================================================================================
  const ClearInput = field => {
    let ele2 = document.getElementById(field);
    if (ele2) ele2.value = "";
    valueInput[field] = null;
    ele2.focus();
  };

  function getSteps() {
    var docCode = "";
    var baseCode = "";

    if (valueInput) {
      if (valueInput.PalletCode) {
        baseCode = valueInput.PalletCode;
      }
    }
    return [
      { label: "Scan Pallet Code", value: pallet },
      { label: "Select Document", value: docCode },
      { label: "Pick", value: null }
    ];
  }

  function getStepContent(step) {
    switch (step) {
      case 0:
        return (
          <div>
            <AmInput
              id={"PalletCode"}
              placeholder="Scan pallet or box code"
              autoFocus={true}
              type="input"
              style={{ width: "100%" }}
              onChange={(value, obj, element, event) =>
                onHandleChangeInput(value, null, "PalletCode", null, event)
              }
              onKeyPress={(value, obj, element, event) =>
                onHandleChangeInputPalletCode(
                  value,
                  null,
                  "PalletCode",
                  null,
                  event
                )
              }
            />
          </div>
        );
      case 1:
        return dataShow;
      case 2:
        return dataShowPick;
      default:
        return "Unknown step";
    }
  }
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
                  {row.label}
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
                    {activeStep !== 2 ? null : (
                      <AmButton
                        styleType="delete_clear"
                        onClick={handleReset}
                        className={classes.button}
                      >
                        Clear
                      </AmButton>
                    )}

                    <AmButton
                      styleType="dark_clear"
                      disabled={activeStep === 0}
                      onClick={() => handleBack(index)}
                      className={classes.button}
                    >
                      Back
                    </AmButton>

                    {activeStep !== 0 ? null : (
                      <AmButton
                        styleType="confirm"
                        onClick={() => handleNext(index)}
                        className={classes.button}
                      >
                        {activeStep === steps.length - 1 ? "Confirm" : "Next"}
                      </AmButton>
                    )}
                    {index !== 2 ? null : (
                      <AmButton
                        styleType="confirm"
                        onClick={() => handleNext(index)}
                        className={classes.button}
                      >
                        {"Confirm"}
                      </AmButton>
                    )}
                  </div>
                </div>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>
    </div>
  );
};

AmPIckingHH.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(AmPIckingHH);
