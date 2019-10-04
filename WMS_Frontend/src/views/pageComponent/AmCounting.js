import React, { useState, useEffect, useRef } from "react";
import { withStyles } from "@material-ui/core/styles";
import {
  apicall,
  createQueryString,
  Clone
} from "../../components/function/CoreFunction2";
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
import { useTranslation } from "react-i18next";
import AmRadioGroup from "../../components/AmRadioGroup";
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
  width: 100px;
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

const AmCounting = props => {
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
  const [valueEdit, setValueEdit] = useState(0);
  const [docName, setDocName] = useState("");
  const [option, setOption] = useState();

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
  useEffect(() => {}, [valueInput]);
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
      setPalletCode(value);
      GetPalletSto(value);
    }
  };
  function getSteps() {
    var baseCode = "";
    if (valueInput) {
      if (valueInput.PalletCode) {
        baseCode = valueInput.PalletCode;
      }
    }
    return [
      { label: "Barcode Pallet", value: baseCode },
      { label: "Adjust Quantity", value: null }
    ];
  }
  async function getDocumentName(ID, itemLists) {
    var doc = "";
    const QueryDocName = {
      queryString: window.apipath + "/v2/SelectDataTrxAPI/",
      t: "Document",
      q:
        '[{ "f": "ID", "c":"=", "v": "' +
        ID +
        '"},{ "f": "Status", "c":"<", "v": 2}]',
      f: "Code",
      g: "",
      s: "[{'f':'Code','od':'asc'}]",
      sk: 0,
      l: 100,
      all: ""
    };
    await Axios.get(createQueryString(QueryDocName)).then(res => {
      if (res.data.datas.length !== 0) {
        res.data.datas.forEach(x => {
          setDocName(x.Code);
          doc = x.Code;
        });
      }
    });
    //   setDocID(res.data.docID);

    setTable(itemLists);
    setDataShow(DataShowRenderer(itemLists, doc));
    setActiveStep(prevActiveStep => prevActiveStep + 1);
  }
  function getStepContent(step) {
    switch (step) {
      case 0:
        return (
          <div>
            <AmInput
              id={"PalletCode"}
              placeholder="Pallet code"
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
      default:
        return "Unknown step";
    }
  }
  const handleNext = index => {
    if (index === 0) {
      GetPalletSto(valueInput.PalletCode);
    }
    if (index === 1) {
      setIsLoad(true);
    }
  };

  function handleReset() {
    setActiveStep(0);
    setValueInput({});
    setDataShow(null);
    // setLabelBarcode(null);
  }

  const GetPalletSto = reqPalletCode => {
    if (reqPalletCode) {
      Axios.get(
        window.apipath + "/v2/SelectAuditAPI/?palletCode=" + reqPalletCode
      ).then(res => {
        if (res.data._result.status === 0) {
          alertDialogRenderer(res.data._result.message, "error", true);
        } else {
          getDocumentName(res.data.docID, res.data.itemLists);
        }
      });
    } else {
      alertDialogRenderer("Barcode Pallet must be value", "error", true);
    }
  };
  const createAuditEdit = (value, dataTable) => {
    for (var data in dataTable) {
      dataTable[data].auditQty = parseInt(value, 10);
    }
    setValueEdit(value);
  };
  const DataShowRenderer = (data, doc) => {
    var dataRadio = props.dataRadio;
    var defaultDataRadio = props.defaultDataRadio;
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
            <div>
              <FormInline>
                <LabelH>Doc. No. :</LabelH>
                {doc}
              </FormInline>
              {/* <label style={{ fontWeight: "bolder" }}>Doc. No. : </label> {doc} */}
            </div>
            {props.displayDetail.map((x, index) => {
              return (
                <div key={index}>
                  <FormInline>
                    <LabelH>{x.Name} :</LabelH>
                    {list[x.field]}
                  </FormInline>
                  {/* <label style={{ fontWeight: "bolder" }}>{x.Name}: </label>{" "} */}
                  {/* {list[x.field]} */}
                </div>
              );
            })}

            {/* <div><label style={{fontWeight: "bolder"}}>Pack Code : </label> {list["packCode"]}</div>
                  <div><label style={{fontWeight: "bolder"}}>Batch : </label> {list.batch}</div> */}
            <div>
              {/* <label style={{ fontWeight: "bolder" }}>Adj.Qty : </label>{" "} */}
              <FormInline>
                <LabelH>Adj.Qty : </LabelH>{" "}
                <AmInput
                  defaultValue={list.qty}
                  style={{ width: "70px", padding: "0px" }}
                  type="number"
                  id="QtyEdit"
                  name="QtyEdit"
                  onChange={(value, obj, element, event) => {
                    createAuditEdit(value, data);
                  }}
                />{" "}
                / {list.qty} {list.unitCode}
              </FormInline>
              {props.stateDone === true ? (
                <FormInline>
                  {" "}
                  <LabelH1>Status : </LabelH1>
                  <AmRadioGroup
                    row={true}
                    name={"Status"}
                    dataValue={dataRadio}
                    returnDefaultValue={true}
                    defaultValue={defaultDataRadio}
                    onChange={(value, obj, element, event) =>
                      onHandleChangeRadio(value)
                    }
                  />
                </FormInline>
              ) : null}
            </div>
          </CardContent>
        </Card>
      );
    });
  };
  const onHandleChangeRadio = (value, field) => {
    //valueInput[field] = parseInt(value, 10);
    // table["Status"] = parseInt(value, 10);
    setOption(parseInt(value, 10));
  };
  const onConfirmAudit = () => {
    let dataList = table.map(x => {
      let auditQty = x.auditQty - x.qty;
      return {
        stoID: x.stoID,
        docItemID: x.docItemID,
        packCode: x.packCode,
        auditQty: auditQty,
        qty: x.qty,
        baseQty: x.baseQty,
        unitID: x.unitID,
        baseUnitID: x.baseUnitID,
        option: props.stateDone === true ? "_done_des_estatus=" + option : ""
      };
    });
    const data = {
      docID: docID,
      palletCode: palletCode,
      itemLists: dataList
    };

    Axios.post(window.apipath + "/v2/UpdateAuditAPI/", data).then(res => {
      if (res.data._result !== undefined) {
        if (res.data._result.status === 1) {
          handleReset();
          alertDialogRenderer("Update", "success", true);
        } else {
          handleReset();
          alertDialogRenderer(res.data._result.message, "error", true);
        }
      }
    });
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
                  <div>
                    {activeStep !== 1 ? null : (
                      <AmButton
                        styleType="delete_clear"
                        onClick={handleReset}
                        className={classes.button}
                      >
                        {t("Clear")}
                      </AmButton>
                    )}
                    {/* <AmButton styleType="dark_clear"
                                            disabled={activeStep === 0}
                                            onClick={() => handleBack(index)}
                                            className={classes.button}
                                        >
                                            Back
                                    </AmButton> */}

                    {activeStep === steps.length - 1 ? (
                      <AmButton
                        styleType="confirm"
                        onClick={() => {
                          onConfirmAudit();
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

export default withStyles(styles)(AmCounting);
