import React, { useState, useEffect, Fragment } from "react";
import AmInput from "../../../../components/AmInput";
import Axios from "axios";
import { makeStyles } from "@material-ui/core/styles";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import StepContent from "@material-ui/core/StepContent";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import AmButton from "../../../../components/AmButton";
import AmDialogs from "../../../../components/AmDialogs";
import Paper from "@material-ui/core/Paper";

const useStyles = makeStyles(theme => ({
  root: {
    width: "90%"
  },
  paperContainer: {
    maxWidth: "450px",
    width: "100%",
    minWidth: "300px",
    padding: theme.spacing(2, 1)
  },
  button: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1)
  },
  actionsContainer: {
    marginBottom: theme.spacing(2)
  },
  resetContainer: {
    padding: theme.spacing(3)
  }
}));

const RecieveCrossDock = props => {
  const classes = useStyles();
  const [barcode, setBarcode] = useState({});
  const [oriBarcode, setOriBarcode] = useState("");
  const [resGetData, setResGetData] = useState([]);
  const [activeStep, setActiveStep] = useState(0);

  const [successPopup, setSuccessPopup] = useState(false);
  const [errorPopup, setErrorPopup] = useState(false);
  const [popupText, setPopupText] = useState("");

  const getStep = ["Scan Barcode", "Select Document"];

  const getBarcodeDetail = data => {
    try {
      let splitStr = data.split(",");
      const getYear = new Date();
      const splitDate = splitStr[3].split("-");
      const convertYear = [
        splitDate[1],
        splitDate[0],
        getYear.getFullYear().toString()
      ].join("/");
      return {
        packCode: splitStr[0],
        quantity: splitStr[1],
        lot: splitStr[2],
        productDate: convertYear,
        options:
          "tagdate=" +
          splitStr[4] +
          "&tagtime=" +
          splitStr[5] +
          "&tagquantity=" +
          splitStr[6]
      };
    } catch {
      setPopupText("Data not found");
      setErrorPopup(true);
    }
  };
  function handleReset() {
    setActiveStep(0);
    // setValueInput({});
    // setDataShow(null);
    // setLabelBarcode(null);
  }
  const getDocument = barcodeDetail => {
    Axios.get(
      window.apipath +
        "/v2/GetIssueCrossdockDocAPI?packCode=" +
        barcodeDetail.packCode +
        "&quantity=" +
        barcodeDetail.quantity +
        "&lot=" +
        barcodeDetail.lot +
        "&productDate=" +
        barcodeDetail.productDate +
        "&options=" +
        barcodeDetail.options +
        "&token=" +
        localStorage.getItem("Token")
    ).then(res => {
      if (res.data._result.status) {
        if (res.data.docs.length > 0) {
          setActiveStep(prevActiveStep => prevActiveStep + 1);
          setResGetData(res.data.docs);
        } else {
          setPopupText("Not Document for Cross Dock");
          setErrorPopup(true);
        }
      } else {
        setPopupText("Not Document for Cross Dock");
        setErrorPopup(true);
      }
    });
  };

  const sendDocument = (docId, barcodeDetail) => {
    const postData = {
      packCode: barcodeDetail.packCode,
      Quantity: barcodeDetail.quantity,
      Lot: barcodeDetail.lot,
      ProductDate: barcodeDetail.productDate,
      Options: barcodeDetail.options,
      GIdoc: { DocID: docId.giDocID, DocItemID: docId.giDocItemID },
      GRdoc: { DocID: docId.grDocID, DocItemID: docId.grDocItemID },
      token: localStorage.getItem("Token")
    };
    Axios.post(window.apipath + "/v2/RecieveCrossDockAPI", postData).then(
      res => {
        if (res.data._result.status === 1) {
          setPopupText("Success");
          setSuccessPopup(true);
          handleReset();
        } else {
          handleReset();
          setPopupText(res.data._result.message);
          setErrorPopup(true);
        }
      }
    );
  };

  const getContent = index => {
    switch (index) {
      case 0:
        return (
          <div>
            <AmInput
              style={{ width: "200px" }}
              onKeyPress={(value, xx, target, event) => {
                try {
                  if (event.key === "Enter") {
                    let barcodeDetail = getBarcodeDetail(value);
                    setBarcode(barcodeDetail);
                    getDocument(barcodeDetail);
                  }
                } catch {
                  setPopupText("Invalid Data");
                  setErrorPopup(true);
                }
              }}
              onChange={(value, xx, target, event) => {
                setOriBarcode(value);
              }}
            />
          </div>
        );
      case 1:
        return (
          <div>
            {barcode ? <div>{barcode[0]}</div> : null}
            {resGetData.length > 0
              ? resGetData.map((x, idx) => {
                  return (
                    <Card key={idx}>
                      <CardContent>
                        <span>
                          <label>Document : </label>
                          {x.docItem.documentCode}
                        </span>
                        <span>
                          <div>
                            <label>Barcode : </label>
                            <span>{x.docItem.code}</span>
                          </div>
                          <div>
                            <label>Quantity : </label>
                            <span>{x.docItem.baseQuantity}</span>
                          </div>
                          <div>
                            <label>Unit Type : </label>
                            <span>{x.docItem.unitCode}</span>
                          </div>
                          <div>
                            <label>Lot : </label>
                            <span>{x.docItem.lot}</span>
                          </div>
                        </span>
                        <AmButton
                          styleType="dark_clear"
                          onClick={() => {
                            sendDocument(x.documentID, barcode);
                          }}
                          className={classes.button}
                        >
                          Select
                        </AmButton>
                      </CardContent>
                    </Card>
                  );
                })
              : null}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Fragment>
      <div className={classes.root}>
        <AmDialogs
          typePopup={"success"}
          onAccept={e => {
            setSuccessPopup(e);
          }}
          open={successPopup}
          content={"Success"}
        />
        <AmDialogs
          typePopup={"error"}
          onAccept={e => {
            setErrorPopup(e);
          }}
          open={errorPopup}
          content={popupText}
        />
        <Paper className={classes.paperContainer}>
          <Stepper activeStep={activeStep} orientation="vertical">
            {getStep.map((value, idx) => {
              return (
                <Step key={idx}>
                  <StepLabel>{value}</StepLabel>
                  <StepContent>
                    {getContent(idx)}
                    {idx === 0 ? null : (
                      <AmButton
                        styleType="dark_clear"
                        disabled={activeStep === 0}
                        onClick={() =>
                          setActiveStep(prevActiveStep => prevActiveStep - 1)
                        }
                        className={classes.button}
                      >
                        Back
                      </AmButton>
                    )}
                    {idx === 1 ? null : (
                      <AmButton
                        styleType="confirm"
                        style={{ float: "right" }}
                        onClick={() => {
                          try {
                            let barcodeDetail = getBarcodeDetail(oriBarcode);
                            setBarcode(barcodeDetail);
                            getDocument(barcodeDetail);
                          } catch {
                            setPopupText("ข้อมูลสินค้าไม่ถูกต้อง");
                            setErrorPopup(true);
                          }
                        }}
                        className={classes.button}
                      >
                        {activeStep === 1 ? "Confirm" : "Next"}
                      </AmButton>
                    )}
                  </StepContent>
                </Step>
              );
            })}
          </Stepper>
        </Paper>
      </div>
    </Fragment>
  );
};

export default RecieveCrossDock;
