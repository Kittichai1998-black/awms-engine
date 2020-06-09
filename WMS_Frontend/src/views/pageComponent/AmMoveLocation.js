import React, { useState, useEffect, useRef } from "react";
import { withStyles } from "@material-ui/core/styles";
import { apicall, createQueryString } from '../../components/function/CoreFunction'
import AmDialogs from "../../components/AmDialogs";
import AmButton from "../../components/AmButton";
import AmInput from "../../components/AmInput";
import AmEditorTable from "../../components/table/AmEditorTable";
import {
  indigo,
  deepPurple,
  lightBlue,
  red,
  grey,
  green
} from "@material-ui/core/colors";
import moment from "moment";
import { useTranslation } from "react-i18next";
import AmTable from "../../components/AmTable/AmTable";
import EditIcon from "@material-ui/icons/MoveToInbox";
import OfflinePinIcon from "@material-ui/icons/OfflinePin";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import IconButton from "@material-ui/core/IconButton";
import LabelT from "../../components/AmLabelMultiLanguage";
import Grid from '@material-ui/core/Grid';
import Clone from "../../components/function/Clone";
import AmStorageObjectStatus from "../../components/AmStorageObjectStatus";
import styled from "styled-components";
import Tooltip from '@material-ui/core/Tooltip';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import AmDropdown from "../../components/AmDropdown";
import AmFindPopup from '../../components/AmFindPopup';
import { QueryGenerate } from '../../components/function/UtilFunction';
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


});
const FormInline = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  label {
    margin: 5px 5px 5px 0;
  }
  input {
    vertical-align: middle;
  }
  @media (max-width: 800px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const LabelH = {
  fontWeight: "bold",
  width: "200px"
};
const LabelDD = {
  fontWeight: "bold",
  width: "100px"
};
const LabelD = {
  width: "120px"
};
const AmMoveLocation = props => {
  const { t } = useTranslation();
  const [warehouse, setWarehouse] = useState(1);
  const iniCols = [
    {
      Header: "Code",
      accessor: "Code",
      fixed: "left"

    }]

  const LocationQuery = {
    queryString: window.apipath + "/v2/SelectDataViwAPI/",
    t: "AreaLocationMaster",
    q: "[{ 'f': 'Status', 'c':'!=', 'v': 0}]",
    f: "*",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: ""
  };
  const WarehouseQuery = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "Warehouse",
    q: "[{ 'f': 'Status', 'c':'!=', 'v': 0}]",
    f: "*",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: ""
  };
  //const [query, setQuery] = useState(Query);
  useEffect(() => {
    getData();
  }, []);

  function getData(val) {
    console.log(val)

    const Query = {
      queryString: window.apipath + "/v2/SelectDataViwAPI/",
      t: "WorkQueueSto",
      q: "[{ 'f': 'Warehouse_ID', 'c':'=', 'v': " + (val !== undefined ? val : warehouse) + "}]",
      f: "*",
      g: "",
      s: "[{'f':'Pallet','od':'asc'}]",
      sk: 0,
      l: 100,
      all: ""
    };
    var queryStr = createQueryString(Query)
    Axios.get(queryStr).then(res => {
      console.log(res)
      setDataSource(res.data.datas)
    });

  }
  const [editData, setEditData] = useState();
  const useColumns = (cols) => {
    const [columns, setColumns] = useState(cols);

    useEffect(() => {
      const iniCols = []
      iniCols.push({
        Header: "",
        width: 20,
        colStyle: { zIndex: -1, textAlign: "center" },

        filterable: false,
        Cell: (e) => <IconButton
          size="small"
          aria-label="info"
          style={{ marginLeft: "3px" }}
        >
          {props.syncWC ? (
            e.original.AreaMaster_Code != "SA" ? getButtonDoneAndCancel(e) : getButtonMove(e)
          ) : getButtonMove(e)}
        </IconButton>
      })
      iniCols.push(...cols)
      setColumns(iniCols);
    }, [])

    return { columns };
  }
  const getButtonMove = (e) => {
    return <Tooltip title="Move">
      <EditIcon
        fontSize="small"
        style={{ color: "#F9A825" }}
        onClick={() => { getPopup(e.original, "Move") }}
      />
    </Tooltip>;
  }
  const getButtonDoneAndCancel = (e) => {


    return <div><Tooltip title="Done">

      <OfflinePinIcon
        fontSize="small"
        style={{ color: "#388E3C" }}
        onClick={() => { getPopup(e.original, "Done") }}
      />
    </Tooltip>

      <Tooltip title="Cancel">
        <HighlightOffIcon
          fontSize="small"
          style={{ color: "#D32F2F" }}
          onClick={() => { getPopup(e.original, "Cancel") }}
        />
      </Tooltip></div>;
  }
  const getPopup = (e, type) => {
    console.log(e)
    console.log(type)
    if (type === "Move") {
      setEditData(Clone(e))
      setDialog(true)
    } else if (type === "Done") {
      console.log("dsd")
      setDialogConfirm(true)
      setDialogDataText("Done", true)

    } else {
      setDialogConfirm(true)
      setDialogDataText("Cancel")
    }

  }
  const { columns } = useColumns(props.columns);
  const [dataSource, setDataSource] = useState([])
  const [dialog, setDialog] = useState(false);
  const [dialogConfirm, setDialogConfirm] = useState(false);
  const [dialogDataText, setDialogDataText] = useState("");
  const [valueDataFindPopup, setValueDataFindPopup] = useState({});
  const [valueDataRadio, setValueDataRadio] = useState(0);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openError, setOpenError] = useState(false);
  const [textError, setTextError] = useState("");
  const RanderEle = () => {
    if (props.dataAdd) {
      return props.dataAdd.map(y => {
        return {
          component: (data, cols, key) => {
            console.log(data)
            return (
              <div key={key}>
                {RanderElePopMove(data)}
              </div>
            );
          }
        };
      });
    }
  };
  const getStatus = value => {
    if (value === "RECEIVED") {
      return <AmStorageObjectStatus key={"RECEIVED"} statusCode={102} />;
    } else if (value === "AUDITED") {
      return <AmStorageObjectStatus key={"AUDITED"} statusCode={104} />;
    } else if (value === "CONSOLIDATED") {
      return <AmStorageObjectStatus key={"CONSOLIDATED"} statusCode={156} />;
    } else {
      return null;
    }
  }
  const RanderElePopMove = (data) => {
    console.log(data)
    return (
      <div>
        <Grid container spacing={3}>
          <Grid item xs={6} style={{ paddingLeft: "20px" }}>
            <FormInline>
              <Grid item xs={6} >
                <FormInline>
                  <label style={LabelH}>{"Warehouse : "}</label>
                </FormInline>
              </Grid>
              <Grid item xs={6} >
                <FormInline>
                  <label style={LabelD}>{data.Warehouse}</label>
                </FormInline>
              </Grid>
            </FormInline>
          </Grid>
          <Grid item xs={6} style={{ paddingLeft: "20px" }}>
            <FormInline>
              <Grid item xs={6} >
                <FormInline>
                  <label style={LabelH}>{"Current Area : "}</label>
                </FormInline>
              </Grid>
              <Grid item xs={6} >
                <FormInline>
                  <label style={LabelD}>{data.Area}</label>
                </FormInline>
              </Grid>
            </FormInline>
          </Grid>
        </Grid>
        {/* == */}
        <Grid container spacing={3}>
          <Grid item xs={6} style={{ paddingLeft: "20px" }}>
            <FormInline>
              <Grid item xs={6} >
                <FormInline>
                  <label style={LabelH}>{"Base : "}</label>
                </FormInline>
              </Grid>
              <Grid item xs={6} >
                <FormInline>
                  <label style={LabelD}>{data.Pallet}</label>
                </FormInline>
              </Grid>
            </FormInline>
          </Grid>
          <Grid item xs={6} style={{ paddingLeft: "20px" }}>
            <FormInline>
              <Grid item xs={6} >
                <FormInline>
                  <label style={LabelH}>{"Current Location : "}</label>
                </FormInline>
              </Grid>
              <Grid item xs={6} >
                <FormInline>
                  <label style={LabelD}>{data.Location}</label>
                </FormInline>
              </Grid>
            </FormInline>
          </Grid>
        </Grid>
        {/* == */}
        <Grid container spacing={3} >
          <Grid item xs={6} style={{ paddingLeft: "20px", paddingBottom: "20px" }}>
            <FormInline>
              <Grid item xs={6} >
                <FormInline>
                  <label style={LabelH}>{"Status : "}</label>
                </FormInline>
              </Grid>
              <Grid item xs={6} >
                <FormInline>
                  <label style={LabelD}>{getStatus(data.PackStatus)}</label>
                </FormInline>
              </Grid>
            </FormInline>
          </Grid>
        </Grid>
        {getEleCheckbox()}
        {getEleFindLocation()}

      </div >
    )
  }

  const getEleFindLocation = value => {
    const cols = [
      {
        Header: 'Area',
        accessor: 'AreaMaster_Name',
        width: 130,
        sortable: true,
      },
      {
        Header: 'Code',
        accessor: 'Code',
        sortable: true,
      }]
    return <div style={{ paddingTop: "20px" }} >
      <FormInline>
        <label style={LabelH}>
          {"Area&Location"} :{" "}
        </label>
        <AmFindPopup
          id={"alm"}
          fieldDataKey="ID"
          fieldLabel={["AreaMaster_Code", "Code"]}
          labelPattern=" : "
          valueData={valueDataFindPopup ? valueDataFindPopup["Code"] : ""}
          labelTitle={"Area Location"}
          queryApi={LocationQuery}
          placeholder={"Select Area&Location..."}
          columns={cols}
          width={270}
          onChange={(value) =>
            setValueDataFindPopup(value)
          }
        />
      </FormInline>
    </div>;
  }
  const onHandlePopupConfirm = (status, rowdata) => {
    if (status) {
      updateMove(rowdata, valueDataRadio, valueDataFindPopup, rowdata.Pallet, rowdata.StoID);
    }
    setDialog(false);
  };

  const updateMove = (rowdata, mode, location, pallet, bstosID) => {
    let updjson = {
      mode: mode,
      palletCode: pallet,
      SouLocationCode: rowdata.Area,
      DesLocationID: parseInt(location),
      bstosID: rowdata.ID

    };

    Axios.post(window.apipath + "/v2/MoveLocaionAPI", updjson).then(res => {
      if (res.data._result !== undefined) {
        if (res.data._result.status === 1) {
          setOpenSuccess(true);
          getData(warehouse);
        } else {
          setOpenError(true);
          setTextError(res.data._result.message);
          getData(warehouse);
        }
      }

    })
    return null;
  };
  const handleRadioChange = (checked, val) => {
    setValueDataRadio(val)
    return null;
  };
  const getEleCheckbox = value => {
    return <div >
      <RadioGroup aria-label="quiz" name="quiz" value={value}  >
        <Grid>
          <Grid style={{ paddingLeft: "20px", textAlign: "center" }}>
            <FormInline>
              <Grid item xs={6} >
                <FormInline>
                  <FormControlLabel value="0"
                    control={
                      <Radio color="primary"
                        checked={valueDataRadio === 0}
                        onChange={(checked) => handleRadioChange(checked, 0)}
                      />}
                    label="AMS Only"

                  />
                </FormInline>
              </Grid>
              <Grid item xs={6} >
                <FormInline>
                  <FormControlLabel value="1"
                    control={
                      <Radio color="primary"
                      />}
                    disabled={!props.syncWC}
                    label="Create Queue"
                    onChange={(checked) => handleRadioChange(checked, 1)} />
                </FormInline>
              </Grid>
            </FormInline>
          </Grid>
        </Grid>
      </RadioGroup>
    </div>;
  }

  const onHandledataConfirm = (status, rowdata, type) => {
    if (status) {
      //setDialogDataText()
      updateDoneAndCancel(type)
    } else {
      setDialogConfirm(false)
    }
    return null
  }
  const updateDoneAndCancel = (mode) => {

    if (mode === "Done") {
      // Axios.post(window.apipath + "/v2/MoveLocaionAPI", updjson).then(res => {
      //   console.log(res)
      //   if (res.data._result !== undefined) {
      //     if (res.data._result.status === 1) {

      //     } else {

      //     }
      //   }

      // })
    } else {

    }

    return null;
  };

  // const onChangeFilterData = (filterValue) => {
  //   console.log(filterValue)
  //   var res = queryObj;
  //   filterValue.forEach(fdata => {
  //     if (fdata.customFilter !== undefined)
  //       res = QueryGenerate({ ...queryObj }, fdata.field, fdata.value, fdata.customFilter.dataType, fdata.customFilter.dateField)
  //     else
  //       res = QueryGenerate({ ...queryObj }, fdata.field, fdata.value)
  //   });
  //   setQueryObj(res)
  // }
  return (
    <div>
      <AmDialogs
        typePopup={"success"}
        onAccept={e => {
          setOpenSuccess(e);
        }}
        open={openSuccess}
        content={"Success"}
      ></AmDialogs>
      <AmDialogs
        typePopup={"error"}
        onAccept={e => {
          setOpenError(e);
        }}
        open={openError}
        content={textError}
      ></AmDialogs>
      <FormInline>
        {" "}
        <label style={LabelDD}>
          {t("Warehouse")} :{" "}
        </label>
        <AmDropdown
          id={"WH"}
          placeholder={"Select Warehouse..."}
          fieldDataKey={"ID"}
          fieldLabel={["Code", "Name"]}
          labelPattern=" : "
          width={250}
          ddlMinWidth={200}
          zIndex={1000}
          defaultValue={1}
          queryApi={WarehouseQuery}
          onChange={(value, dataObject, inputID, fieldDataKey) =>
            getData(value)

          }
          ddlType={"normal"}
        />{" "}
      </FormInline>
      <br />
      <AmEditorTable
        open={dialog}
        onAccept={(status, rowdata) => onHandlePopupConfirm(status, rowdata)}
        titleText={"Move Location"}
        data={editData}
        columns={RanderEle()}
      />
      <AmEditorTable
        open={dialogConfirm}
        onAccept={status => onHandledataConfirm(status, dialogDataText)}
        titleText={dialogDataText}
        columns={[]}
      />
      <AmTable
        columns={columns}
        dataKey={"Code"}
        dataSource={dataSource}
        filterable={false}
        rowNumber={true}
        pageSize={20}
        //filterable={true}
        //filterData={res => { onChangeFilterData(res) }}
        height={props.height}
      />
    </div>
  );
};


export default withStyles(styles)(AmMoveLocation);
