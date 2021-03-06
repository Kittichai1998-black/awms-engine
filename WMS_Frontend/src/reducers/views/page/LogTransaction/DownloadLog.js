import Axios from "axios";
import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import TreeView from "deni-react-treeview";
import AmInput from "../../../components/AmInput";
import AmButton from "../../../components/AmButton";
import AmEditorTable from "../../../components/table/AmEditorTable";
import styled from "styled-components";
import LabelT from "../../../components/AmLabelMultiLanguage";
import {
  apicall,
  createQueryString,
  Clone
} from "../../../components/function/CoreFunction";
import AmDialogs from "../../../components/AmDialogs";
import GetAppIcon from '@material-ui/icons/GetApp';
import moment from "moment";
const axios = new apicall();
const LabelH = {
  "font-weight": "bold",
  "width": "200px"
};

const InputDiv = styled.div``;
const FormInline = styled.div`
  display: inline-flex;
  flex-flow: row wrap;
  align-items: center;
  label {
    margin: 5px 0 5px 0;
  }
  input {
    vertical-align: middle;
  }
  @media (max-width: 300px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

function useWindowSize() {
  const [size, setSize] = useState([0, 0]);
  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth - 240 - 48, window.innerHeight - 141 - 42]);
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);
  return size;
}

export default props => {
  const [openError, setOpenError] = useState(false);
  const [textError, setTextError] = useState("");
  const [dialog, setDialog] = useState(false);
  const [text, setText] = useState([]);
  const [logRefID, setLogRefID] = useState("");
  const [dataUse, setDataUse] = useState([]);
  const [dataInitial, setDataInitial] = useState([]);
  const [width, height] = useWindowSize();
  const treeview = useRef();

  useEffect(() => {
    setDataUse(dataInitial);
  }, [dataInitial]);

  useEffect(() => {
    treeview.current.api.load();
  }, [dataUse]);

  useEffect(() => {
    axios.get(window.apipath + "/v2/GetDirectoryLogFile?").then(
      res => {
        if (res.data._result.status) {
          const dataNew = res.data.datas.directory
            .map(x => {
              return { text: x, children: [{ isLeaf: true }] };
            })
            .sort((a, b) => b.text - a.text);
          setDataInitial(dataNew);
        }
      }
    );
  }, []);

  const GetFile = e => {
    if (e.expanded && !e.children[0].text) {
      axios.get(
        window.apipath + "/v2/GetDirectoryLogFile?file=/" + e.text
      ).then(res => {
        if (res.data._result.status) {
          const dataNew = [...dataUse];
          const dataFolderSelect = dataNew.find(x => x.text === e.text);
          dataFolderSelect.children.length = 0;
          res.data.datas.file.name.forEach((x, xi) => {
            dataFolderSelect.children.push({
              text:
                x +
                " - " +
                moment(res.data.datas.file.modifyDate[xi]).format(
                  "DD/MM/YYYY | HH:mm"
                ),
              file: e.text,
              isLeaf: true,
              textOriginal: x
            });
          });
          setDataUse(dataNew);
        }
      });
    }
  };

  const DownloadFile = e => {
    if (e.isLeaf) {
      console.log(e);

      const file_path =
        window.apipath +
        "/download/get_log?apikey=" +
        localStorage.getItem("Token") +
        "&date=" +
        e.file +
        "&logfile=" +
        e.textOriginal;
        console.log(file_path);
      const a = document.createElement("A");
      a.href = file_path;
      a.download = file_path.substr(file_path.lastIndexOf("/") + 1);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const onKeyUp = e => {
    const dataNew = [...dataInitial];
    const dataFolderSearch = dataNew.filter(x => x.text.match(e));
    setDataUse(dataFolderSearch);
  };
  //=================================== logRef by PLE ==============================
  const FuncRanderInput = () => {
    const columns = [
      {
        field: "Option",
        type: "input",
        name: "Log Ref ID",
        placeholder: "Log Ref ID",
        required: true
      }
    ];
    const x = columns;
    return x.map(y => {
      return {
        field: y.field,
        component: (data = null, cols, key) => {
          return (
            <div key={key}>{FuncSetEle(y.name, data, cols, y.placeholder)}</div>
          );
        }
      };
    });
  };
  const FuncSetEle = (name, data, cols, placeholder) => {
    return (
      <FormInline>
        {" "}
        <LabelT style={LabelH}>{name} : </LabelT>
        <InputDiv>
          <AmInput
            id={cols.field}
            style={{ width: "270px", margin: "0px" }}
            placeholder={placeholder}
            type="input"
            onChange={val => {
              setLogRefID(val);
            }}
          />
        </InputDiv>
      </FormInline>
    );
  };
  const onHandleEditConfirm = (status, type) => {
    if (status) {
      GetPathFile(logRefID);
    }
    setDialog(false);
  };
  const GetPathFile = e => {
    var dateFilelog = "";
    const data = {
      LogRefID: e
    };

    axios
      .post(window.apipath + "/v2/DownloadLogFileByRefIDAPI/", data)
      .then(res => {
        if (res.data._result.status === 1) {
          dateFilelog = res.data.dateFilelog;
          DownloadFileByRefID(dateFilelog, e);
        } else {
          setOpenError(true);
          setTextError(res.data._result.message);
        }
      });
  };

  const DownloadFileByRefID = (dateFilelog, LogRefID) => {
    const file_path =
      window.apipath +
      "/download/find_log?date=" +
      dateFilelog +
      "&logfile=*.log&search=" +
      "\\" +
      "[" +
      LogRefID +
      "\\" +
      "]";
    const a = document.createElement("A");
    a.href = file_path;
    a.download = file_path.substr(file_path.lastIndexOf("/") + 1);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  //================================================================================
  return (
    <div>
      <AmDialogs
        typePopup={"error"}
        onAccept={e => {
          setOpenError(e);
        }}
        open={openError}
        content={textError}
      />
      <AmEditorTable
        open={dialog}
        onAccept={(status, rowdata) => onHandleEditConfirm(status)}
        titleText={"Search By Log Ref ID"}
        data={text}
        columns={FuncRanderInput()}
        textConfirm={"Download"}
      />
      <div style={{ marginBottom: '10px' }}>
        <FormInline>
          <label style={{ fontWeight: 'bold', marginRight: '15px' }}>Search : </label>
          <AmInput
            style={{ width: "300px" }}
            type="search"
            placeholder={"Search by Date (Ex. 200200821)"}
            onKeyUp={onKeyUp}
          />
        </FormInline>
        <AmButton styleType="confirm" className="float-right"
          startIcon={<GetAppIcon />}
          onClick={() => setDialog(true)}>
          {"Download Log"}
        </AmButton>

      </div>
      <TreeView
        // selectRow={true}
        ref={treeview}
        onExpanded={GetFile}
        onSelectItem={DownloadFile}
        items={dataUse}
        style={{ width: width, height: height }}
      />
    </div>
  );
};
