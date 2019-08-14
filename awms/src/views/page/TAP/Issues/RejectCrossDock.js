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

const Axios = new apicall();

const styles = theme => ({
  root: {
    maxWidth: "50%",
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
    height: "150px"
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
  width: 150px;
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

const RejectCrossDock = props => {
  const { classes } = props;

  const [openSuccess, setOpenSuccess] = useState(false);
  const [openError, setOpenError] = useState(false);
  const [textError, setTextError] = useState("");

  const [data, setData] = useState([]);
  const [docID, setDocID] = useState("");
  const [valueText1, setValueText1] = useState({});
  const [table, setTable] = useState(null);
  // useEffect(() => {}, [valueInput]);
  useEffect(() => {
    getData();
  }, []);
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
  async function getData() {
    await Axios.get(createQueryString(DocumentQuery)).then(res => {
      if (res.data.datas) {
        var docData = res.data.datas.map(x => {
          return { value: x.ID, label: x.Code };
        });
        //setData(docData);
        setTable(
          <AmDropdown
            id={"DocumentGR"}
            placeholder="Select"
            //fieldLabel={["Code"]}
            // queryApi={DocumentQuery}
            data={docData}
            width={300}
            ddlMinWidth={300}
            onChange={(value, dataObject, inputID, fieldDataKey) =>
              onHandleDDLChange(value, dataObject, inputID, fieldDataKey, data)
            }
            ddlType={"search"}
          />
        );
      }
    });
  }

  const sendDocument = () => {
    console.log(docID);
    if (docID) {
      const postData = {
        docID: docID,
        token: localStorage.getItem("Token")
      };
      Axios.post(window.apipath + "/v2/ClosedCrossDockAPI", postData).then(
        res => {
          if (res.data._result.status === 1) {
            setOpenSuccess(true);
            getData();
            Clear();
          } else {
            setOpenError(true);
            setTextError(res.data._result.message);
            getData();
            Clear();
          }
        }
      );
    }
  };
  const onHandleDDLChange = (
    value,
    dataObject,
    inputID,
    fieldDataKey,
    data
  ) => {
    setValueText1({
      ...valueText1,
      [inputID]: {
        value: value,
        dataObject: dataObject,
        fieldDataKey: fieldDataKey
      }
    });
    console.log(dataObject);
    setDocID(value);
    //onChangeEditor(inputID, data, value)
  };
  async function Clear() {
    setDocID("");
    setValueText1(null);
    setTable();
  }
  return (
    <div className={classes.root}>
      <AmDialogs
        typePopup={"success"}
        onAccept={e => {
          setOpenSuccess(e);
        }}
        open={openSuccess}
        content={"Success"}
      />
      <AmDialogs
        typePopup={"error"}
        onAccept={e => {
          setOpenError(e);
        }}
        open={openError}
        content={textError}
      />
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
        className={classnames(classes.paper2, classes["paperBG_2"])}
      >
        <Card className={classes.card}>
          <CardContent className={classes.cardContent}>
            <FormInline>
              <LabelH>{"Select Cross Dock"} : </LabelH>
              {table}
              {/* <AmDropdown
                id={"DocumentGR"}
                placeholder="Select"
                //fieldLabel={["Code"]}
                // queryApi={DocumentQuery}
                data={data}
                width={300}
                ddlMinWidth={300}
                onChange={(value, dataObject, inputID, fieldDataKey) =>
                  onHandleDDLChange(
                    value,
                    dataObject,
                    inputID,
                    fieldDataKey,
                    data
                  )
                }
                ddlType={"search"}
              /> */}
            </FormInline>
            <br />
            <br />
            <br />
            <div />
            <div className={classes.actionsContainer}>
              <div>
                <AmButton
                  styleType="delete"
                  className={classes.button}
                  onClick={() => sendDocument()}
                >
                  Close
                </AmButton>
              </div>
            </div>
          </CardContent>
        </Card>
        <Paper square className={classes.paper1}>
          <div style={{ paddingTop: "30px", color: "red" }}>
            * หมายเหตุ ในการปิดเอกสาร cross dock ในกรณีที่
            สายการผลิตไม่สามารถผลิตให้ได้ หรือ
            จำนวนการผลิตเพิ่มเติมไม่ตรงกับจำนวนในระบบที่แจ้งเบิกในเบื้องต้น
          </div>
        </Paper>
      </Paper>
    </div>
  );
};

export default withStyles(styles)(RejectCrossDock);
