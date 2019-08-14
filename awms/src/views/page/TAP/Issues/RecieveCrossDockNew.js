import React, { useState, useEffect, useRef } from "react";
import classnames from "classnames";
import { withStyles } from "@material-ui/core/styles";
import {
  apicall,
  createQueryString,
  Clone
} from "../../../../components/function/CoreFunction";
import AmDialogs from "../../../../components/AmDialogs";
import AmButton from "../../../../components/AmButton";
import AmInput from "../../../../components/AmInput";
import AmDropdown from "../../../../components/AmDropdown";
import {
  indigo,
  deepPurple,
  lightBlue,
  red,
  grey,
  green
} from "@material-ui/core/colors";
import Paper from "@material-ui/core/Paper";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import AddIcon from "@material-ui/icons/AddCircle";
import SearchIcon from "@material-ui/icons/Search";
import _ from "lodash";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import styled from "styled-components";
import soundFail from "../../../../assets/sound/fail.mp3";
import soundPass from "../../../../assets/sound/pass.mp3";

const Axios = new apicall();

const styles = theme => ({
  root: {
    maxWidth: "70%",
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
  block: {
    display: "block"
  },
  cardContent: {
    padding: "5px 10px 5px 10px",
    height: "110px"
  },
  card: {
    minWidth: 350
    // maxWidth: 500,
  },
  expand: {
    transform: "rotate(0deg)",
    marginLeft: "auto",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest
    })
  },
  expandOpen: {
    transform: "rotate(180deg)"
  },
  actions: {
    display: "flex"
  },
  iconButton: {
    padding: 4
  },
  button: {
    margin: theme.spacing(),
    width: "100%",
    lineHeight: 1.5
  },
  buttonAuto: {
    margin: theme.spacing(),
    width: "auto",
    lineHeight: 1
  },
  detail: {
    fontSize: "90%"
  },
  titleDetail: {
    fontWeight: "bold",
    color: indigo[500]
  },
  areadetail: {
    fontSize: "1.225em"
  },
  labelHead: {
    fontWeight: "bold",
    display: "inline-block"
  },
  labelFocus: {
    padding: "2px",
    borderRadius: "5px",
    backgroundColor: "rgba(255, 224, 0, 0.5)"
  },
  divLevel1: { marginBottom: 3, display: "block" },
  divLevel2: { marginLeft: 22, marginBottom: 3, display: "block" },
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
  opsAvatar: { backgroundColor: red[500] },
  qtyAvatar: { backgroundColor: deepPurple[500] },
  optAvatar: { backgroundColor: lightBlue[500] },
  textNowrap: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "block",
    whiteSpace: "nowrap"
  },
  paper1: { flexGrow: 1, minWidth: 360, width: "100%" },
  paper2: {
    flexGrow: 1,
    minWidth: 360,
    width: "100%",
    marginTop: 5,
    padding: 5
  },
  paperBG_0: { backgroundColor: indigo[100] },
  paperBG_1: { backgroundColor: green[100] },
  paperBG_2: { backgroundColor: red[100] },
  bigIndicator: { height: 4 },
  indicator_0: { backgroundColor: indigo[700] },
  indicator_1: { backgroundColor: green[700] },
  indicator_2: { backgroundColor: red[700] },
  fontIndi_0: {
    color: indigo[700],
    minHeight: "52px",
    paddingTop: "5px",
    fontSize: "x-small"
  },
  fontIndi_1: {
    color: green[700],
    minHeight: "52px",
    paddingTop: "5px",
    fontSize: "x-small"
  },
  fontIndi_2: {
    color: red[700],
    minHeight: "52px",
    paddingTop: "5px",
    fontSize: "x-small"
  }
});
const LabelH = styled.label`
  font-weight: bold;
  width: 200px;
  paddingleft: 20px;
`;
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

const DivHidden = styled.div`
  overflow: hidden;
  height: 0;
`;
const DocumentQuery = {
  queryString: window.apipath + "/v2/SelectDataTrxAPI/",
  t: "Document",
  q:
    '[{ "f": "Status", "c":"<", "v": 2}, { "f": "MovementType_ID", "c":"in", "v": "1031,1032,1033"}]',
  f: "ID, Code",
  g: "",
  s: "[{'f':'ID','od':'asc'}]",
  sk: 0,
  l: 0,
  all: ""
};

const RecieveCrossDockNew = props => {
  const { classes } = props;

  const [barcode, setBarcode] = useState({});
  const [oriBarcode, setOriBarcode] = useState("");
  const [resGetData, setResGetData] = useState([]);
  const [activeStep, setActiveStep] = useState(0);

  const [successPopup, setSuccessPopup] = useState(false);
  const [errorPopup, setErrorPopup] = useState(false);
  const [popupText, setPopupText] = useState("");
  const [logDetail, setLogDetail] = useState([]);

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
    if (barcodeDetail) {
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
          sendDocument(res.data.docs[0], barcodeDetail);
        } else {
          var audio = new Audio(soundFail);
          audio.play();
          logDetail.unshift({
            Type: "ไม่ผ่าน",
            massage: res.data._result.message
          });
          if (logDetail.length > 100) {
            logDetail.splice(20, 79);
          }
          setLogDetail([...logDetail]);
          var element = document.getElementById("barcode");
          element.value = "";
        }
      });
    }
  };

  const sendDocument = (docId, barcodeDetail) => {
    console.log(docId);
    console.log(barcodeDetail);
    const postData = {
      packCode: barcodeDetail.packCode,
      Quantity: barcodeDetail.quantity,
      Lot: barcodeDetail.lot,
      ProductDate: barcodeDetail.productDate,
      Options: barcodeDetail.options,
      GIdoc: {
        DocID: docId.documentID.giDocID,
        DocItemID: docId.documentID.giDocItemID
      },
      GRdoc: {
        DocID: docId.documentID.grDocID,
        DocItemID: docId.documentID.grDocItemID
      },
      token: localStorage.getItem("Token")
    };
    console.log(postData);
    Axios.post(window.apipath + "/v2/RecieveCrossDockAPI", postData).then(
      res => {
        if (res.data._result.status === 1) {
          var audio = new Audio(soundPass);
          audio.play();
          logDetail.unshift({
            Type: "ผ่าน",
            DocCode: docId.docItem.documentCode,
            PackCode: barcodeDetail.packCode
          });
        } else {
          var audio = new Audio(soundFail);
          audio.play();
          logDetail.unshift({
            Type: "ไม่ผ่าน",
            DocCode: docId.docItem.documentCode,
            PackCode: barcodeDetail.packCode,
            massage: res.data._result.message,
            showMassage: true
          });
        }
        if (logDetail.length > 100) {
          logDetail.splice(20, 79);
        }
        setLogDetail([...logDetail]);

        var element = document.getElementById("barcode");
        element.value = "";
      }
    );
  };
  const TabsRenderer = () => {
    return (
      <Tab
        icon={<SearchIcon />}
        value={0}
        aria-label="Select"
        label="Select"
        className={classes.fontIndi_0}
      />
    );
  };

  return (
    <div className={classes.root}>
      <Paper square className={classes.paper1}>
        <Tabs
          classes={{
            indicator: classnames(classes.bigIndicator, classes["indicator_1"])
          }}
          variant="fullWidth"
        >
          {TabsRenderer()}
        </Tabs>
      </Paper>
      <Paper
        square
        className={classnames(classes.paper2, classes["paperBG_1"])}
      >
        <Card className={classes.card}>
          <CardContent className={classes.cardContent}>
            <br />
            <FormInline>
              <LabelH>{"Scan Barcode Cross Dock"} : </LabelH>
              <AmInput
                id={"barcode"}
                style={{ width: "300px" }}
                onKeyPress={(value, xx, target, event) => {
                  if (event.key === "Enter") {
                    let barcodeDetail = getBarcodeDetail(value);
                    //setBarcode(barcodeDetail);
                    getDocument(barcodeDetail);
                  }
                }}
                onChange={(value, xx, target, event) => {
                  setOriBarcode(value);
                }}
              />
            </FormInline>
            <div />
          </CardContent>
        </Card>
        <br />

        <Paper square className={classes.paper1}>
          {logDetail.map(x => {
            return (
              <div>
                {" "}
                <FormInline>
                  {" "}
                  <div style={{ fontWeight: "bold", margin: "10px" }}>
                    {x.Type}
                  </div>{" "}
                  {x.massage === undefined
                    ? x.DocCode + " , " + x.PackCode
                    : x.showMassage === true
                    ? x.DocCode + " , " + x.PackCode + x.massage
                    : x.massage}
                </FormInline>
              </div>
            );
          })}
        </Paper>
      </Paper>
    </div>
  );
};

export default withStyles(styles)(RecieveCrossDockNew);
