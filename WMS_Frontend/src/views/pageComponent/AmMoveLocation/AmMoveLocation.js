import React, { useState, useEffect, useRef } from "react";
import { withStyles } from "@material-ui/core/styles";
import { apicall, createQueryString, IsEmptyObject } from '../../../components/function/CoreFunction'
import AmDialogs from "../../../components/AmDialogs";
import AmEditorTable from "../../../components/table/AmEditorTable";
import { DataGenerateElePopMove } from "../AmMoveLocation/RanderElePopMove";
import moment from "moment";
import { useTranslation } from "react-i18next";
import AmTable from "../../../components/AmTable/AmTable";
import EditIcon from "@material-ui/icons/MoveToInbox";
import OfflinePinIcon from "@material-ui/icons/OfflinePin";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import IconButton from "@material-ui/core/IconButton";
import LabelT from "../../../components/AmLabelMultiLanguage";
import Grid from '@material-ui/core/Grid';
import Clone from "../../../components/function/Clone";

import styled from "styled-components";
import Tooltip from '@material-ui/core/Tooltip';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import AmDropdown from '../../../components/AmDropdown';
import AmFindPopup from '../../../components/AmFindPopup';
import { QueryGenerate } from '../../../components/function/UtilFunction';
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
const AmMoveLocation = props => {
  const { t } = useTranslation();
  const iniCols = [
    {
      Header: "Code",
      accessor: "Code",
      fixed: "left"

    }]
  const Query = {
    queryString: window.apipath + "/v2/SelectDataViwAPI/",
    t: "WorkQueueSto",
    q: '[{ "f": "Warehouse_ID", "c":"=", "v": ' + props.warehouse + '}]',
    f: "*",
    g: "",
    s: '[{"f":"Pallet","od":"asc"}]',
    sk: 0,
    l: pageSize,
    all: ""
  };
  const LocationQuery = {
    queryString: window.apipath + "/v2/SelectDataViwAPI/",
    t: "AreaLocationMaster",
    q: '[{ "f": "Status", "c":"!=", "v": 0}]',
    f: "*",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: ""
  };
  const [page, setPage] = useState(1);
  const [iniQuery, setIniQuery] = useState(true);
  const [dataSource, setDataSource] = useState([])
  const [dialog, setDialog] = useState(false);
  const [dialogConfirm, setDialogConfirm] = useState(false);
  const [dialogDataText, setDialogDataText] = useState("");
  const [valueDataFindPopup, setValueDataFindPopup] = useState({});
  const [valueDataRadio, setValueDataRadio] = useState(0);
  const [count, setCount] = useState(0)
  const [dialogState, setDialogState] = useState({});
  const [pageSize, setPageSize] = useState(20);
  const [queryViewData, setQueryViewData] = useState(Query);
  useEffect(() => {
    setQueryViewData(Query)
  }, [props.warehouse])


  useEffect(() => {
    if (!IsEmptyObject(queryViewData) && queryViewData !== undefined)
      getData(queryViewData)
  }, [queryViewData])

  useEffect(() => {

    if (queryViewData.l !== pageSize) {
      queryViewData.l = pageSize
      setQueryViewData({ ...queryViewData })
    }
  }, [pageSize])

  useEffect(() => {
    if (typeof (page) === "number" && !iniQuery) {
      const queryEdit = JSON.parse(JSON.stringify(queryViewData));
      queryEdit.sk = page === 0 ? 0 : (page - 1) * parseInt(queryEdit.l, 10);
      getData(queryEdit)
    }
  }, [page])

  function getData(data) {
    var queryStr = createQueryString(data)
    Axios.get(queryStr).then(res => {
      setDataSource(res.data.datas)
      setCount(res.data.counts)
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
      iniCols.forEach(col => {
        let filterConfig = col.filterConfig;
        if (filterConfig !== undefined) {
          if (filterConfig.filterType === "dropdown") {
            col.Filter = (field, onChangeFilter) => {
              var checkType = Array.isArray(filterConfig.dataDropDown);
              if (checkType) {
                return <AmDropdown
                  id={field}
                  placeholder={col.placeholder}
                  fieldDataKey={filterConfig.fieldDataKey === undefined ? "value" : filterConfig.fieldDataKey}
                  fieldLabel={filterConfig.fieldLabel === undefined ? ["label"] : filterConfig.fieldLabel}
                  labelPattern=" : "
                  width={filterConfig.widthDD !== undefined ? filterConfig.widthDD : 150}
                  ddlMinWidth={150}
                  zIndex={1000}
                  data={filterConfig.dataDropDown}
                  onChange={(value, dataObject, inputID, fieldDataKey) => onChangeFilter(field, value)}
                />
              }
              else {
                return <AmDropdown
                  id={field}
                  placeholder={col.placeholder}
                  fieldDataKey={filterConfig.fieldDataKey === undefined ? "value" : filterConfig.fieldDataKey}
                  fieldLabel={filterConfig.fieldLabel === undefined ? ["label"] : filterConfig.fieldLabel}
                  labelPattern=" : "
                  width={filterConfig.widthDD !== undefined ? filterConfig.widthDD : 150}
                  ddlMinWidth={150}
                  zIndex={1000}
                  queryApi={filterConfig.dataDropDown}
                  onChange={(value, dataObject, inputID, fieldDataKey) => onChangeFilter(field, value)}
                  ddlType={filterConfig.typeDropDown}
                />
              }

            }
          }
        }
      })
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
    if (type === "Move") {
      setEditData(Clone(e))
      setDialog(true)
    } else if (type === "Done") {
      setDialogConfirm(true)
      setDialogDataText("Done", true)

    } else {
      setDialogConfirm(true)
      setDialogDataText("Cancel")
    }

  }
  const { columns } = useColumns(props.columns);

  const RanderEle = () => {
    if (props.dataAdd) {
      return props.dataAdd.map(y => {
        return {
          component: (data, cols, key) => {
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

  const RanderElePopMove = (data) => {
    return (
      <div>
        {DataGenerateElePopMove(data)}
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
    return <div >
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
          setDialogState({ type: "success", content: "Success", state: true })
          if (!IsEmptyObject(queryViewData) && queryViewData !== undefined)
            getData(queryViewData)
        } else {
          setDialogState({ type: "error", content: res.data._result.message, state: true })
          if (!IsEmptyObject(queryViewData) && queryViewData !== undefined)
            getData(queryViewData)
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
          <Grid style={{ padding: "5px", textAlign: "center" }}>
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

  const onChangeFilterData = (filterValue) => {
    var res = {};
    filterValue.forEach(fdata => {
      if (fdata.customFilter !== undefined) {
        if (IsEmptyObject(fdata.customFilter)) {
          res = QueryGenerate({ ...queryViewData }, fdata.field, fdata.value)
        } else {
          res = QueryGenerate({ ...queryViewData }, fdata.customFilter.field, fdata.value, fdata.customFilter.dataType, fdata.customFilter.dateField)
        }
      } else {
        res = QueryGenerate({ ...queryViewData }, fdata.field, fdata.value)
      }

    });

    if (!IsEmptyObject(res))
      setQueryViewData(res)

    //getData(res)

  }
  return (
    <div>
      <AmDialogs
        typePopup={dialogState.type}
        onAccept={(e) => { setDialogState({ ...dialogState, state: false }) }}
        open={dialogState.state}
        content={dialogState.content} />

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
        dataKey={"ID"}
        dataSource={dataSource}
        rowNumber={true}
        totalSize={count}
        pageSize={pageSize}
        filterable={true}
        filterData={res => { onChangeFilterData(res) }}
        height={props.height}
        pagination={true}
        customTopLeftControl={props.customTopLeftControl}
        onPageSizeChange={(pageSize) => setPageSize(pageSize)}
        onPageChange={p => {
          if (page !== p)
            setPage(p)
          else
            setIniQuery(false)
        }}
      />
    </div>
  );
};


export default withStyles(styles)(AmMoveLocation);
