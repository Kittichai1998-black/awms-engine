import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import AmInput from "../../../components/AmInput";
import {
  apicall,
  createQueryString,
  Clone
} from "../../../components/function/CoreFunction2";

const Axios = new apicall();
const DownloadLogByRef = props => {
  const [dataPath, setDataPath] = useState("");
  //https://localhost:44340/download/find_log?path=D:\logs\BDF01-AMW618311\20200224\*.log&search=AFQP112B
  const GetPathFile = e => {
    console.log(e);
    var pathName = "";
    const data = {
      LogRefID: e
    };
    Axios.post(window.apipath + "/v2/DownloadLogFileByRefIDAPI/", data).then(
      res => {
        console.log(res.data.readFilelog);
        console.log(res.data._result.status);
        if (res.data._result.status === 1) {
          pathName = res.data.readFilelog + "/*.log";
          console.log(pathName);
          DownloadFile(pathName, e);
        }
      }
    );
  };

  const DownloadFile = (pathName, LogRefID) => {
    // const file_path =
    //   window.apipath +
    //   "/download/log?apikey=" +
    //   localStorage.getItem("Token") +
    //   "&path=/" +
    //   pathName +
    //   "/" +
    //   LogRefID;
    // const a = document.createElement("A");
    // a.href = file_path;
    // a.download = file_path.substr(file_path.lastIndexOf("/") + 1);
    // document.body.appendChild(a);
    // a.click();
    // document.body.removeChild(a);
  };
  const onHandleChangeKeyEnter = e => {
    GetPathFile(e);
  };

  //===================================================

  //===================================================
  return (
    <div style={{ paddingBottom: "10px" }}>
      <ExpansionPanel style={{ width: "300px" }}>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography>Search By LogRefID</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Typography>
            <AmInput
              style={{ width: "250px" }}
              type="input"
              placeholder={"Search"}
              onKeyPress={(value, obj, element, event) => {
                if (event.key == "Enter") {
                  onHandleChangeKeyEnter(value);
                }
              }}
            />
          </Typography>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    </div>
  );
};

export default DownloadLogByRef;
