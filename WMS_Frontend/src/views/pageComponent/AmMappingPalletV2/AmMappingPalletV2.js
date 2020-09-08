import React, { useState, useEffect, useRef } from "react";
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
import SearchIcon from "@material-ui/icons/Search";
import AmDropdown from '../../../components/AmDropdown'
import Switch from '@material-ui/core/Switch';
import SvgIcon from '@material-ui/core/SvgIcon';
import { fade, makeStyles, withStyles } from '@material-ui/core/styles';
import TreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem';
import Collapse from '@material-ui/core/Collapse';
import { useSpring, animated } from 'react-spring/web.cjs';
import EditIcon from '@material-ui/icons/Edit';
import PropTypes from 'prop-types';
import AmDatePicker from '../../../components/AmDate';
import { WarehouseQuery, AreaMasterQuery, DocumentProcessTypeQuery } from "./queryString";
import { DataGenerateEleDocDisplay, DataGenerateEleManaulDisplay } from "../AmMappingPalletV2/RanderEleDocDisplay";
import { PlusSquare, MinusSquare } from "../../../constant/IconTreeview";
import Checkbox from "@material-ui/core/Checkbox";
import AmEditorTable from "../../../components/table/AmEditorTable";
import { GenMapstosSelected, genDataManual } from "./genDataManual";
import IconButton from "@material-ui/core/IconButton";
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
  actionsContainerStart: {
    marginBottom: theme.spacing(2),
    textAlign: "start"
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
const InputDiv = styled.div`

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
const LabelHDD = styled.label`
  font-weight: bold;
  width: 120px;
  paddingleft: 20px;
`;
const CheckboxCustom = withStyles({
  root: {
    padding: "0 !important",
    marginRight: "5px"
  },

})(Checkbox);

const AmMappingPalletV2 = props => {
  const { t } = useTranslation();
  const { classes } = props;

  const [valueInput, setValueInput] = useState({});
  const [valueManual, setValueManual] = useState({});

  const [showDialog, setShowDialog] = useState(null);
  const [stateDialog, setStateDialog] = useState(false);
  const [msgDialog, setMsgDialog] = useState("");
  const [typeDialog, setTypeDialog] = useState("");

  const [activeStep, setActiveStep] = useState(0);
  const steps = getSteps();

  const [flagConfirm, setFlagConfirm] = useState(false);
  const [flaggetDataDoc, setFlaggetDataDoc] = useState(false);
  const [docID, setDocID] = useState("");
  const [palletCode, setPalletCode] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [warehouseID, setWarehouseID] = useState(1);

  const [dialog, setDialog] = useState(false);
  const [datasTreeView, setDatasTreeView] = useState([])
  const [dataPallet, setDataPallet] = useState();
  const [dataDoc, setDataDoc] = useState();
  const [dialogState, setDialogState] = useState({});

  const [checkedAuto, setCheckedAuto] = useState(true);
  const [checkedAutoClear, setCheckedAutoClear] = useState(true);
  const [autoFocus, setAutoFocus] = useState(true)
  const [autoFocusBarcode, setAutoFocusBarcode] = useState(false)
  const [disPlayQr, setDisPlayQr] = useState(true);
  const [disPlayButton, setDisPlayButton] = useState(false);
  const alertDialogRenderer = (message, type, state) => {
    setMsgDialog(message);
    setTypeDialog(type);
    setStateDialog(state);
  };
  const [selected, setSelected] = React.useState([]);

  //============================================================================
  function TransitionComponent(props) {
    const style = useSpring({
      from: { opacity: 0, transform: 'translate3d(20px,0,0)' },
      to: { opacity: props.in ? 1 : 0, transform: `translate3d(${props.in ? 0 : 20}px,0,0)` },
    });

    return (
      <animated.div style={style}>
        <Collapse {...props} />
      </animated.div>
    );
  }

  function TransitionComponent(props) {
    const style = useSpring({
      from: { opacity: 0, transform: 'translate3d(20px,0,0)' },
      to: { opacity: props.in ? 1 : 0, transform: `translate3d(${props.in ? 0 : 20}px,0,0)` },
    });

    return (
      <animated.div style={style}>
        <Collapse {...props} />
      </animated.div>
    );
  }

  TransitionComponent.propTypes = {
    /**
     * Show the component; triggers the enter or exit states
     */
    in: PropTypes.bool,
  };
  const StyledTreeItem = withStyles((theme) => ({

    iconContainer: {
      '& .close': {
        opacity: 0.3,
      },
    },
    group: {
      marginLeft: 7,
      paddingLeft: 18,
      borderLeft: `1px dashed ${fade(theme.palette.text.primary, 0.4)}`,
    },
  }))((props) => <TreeItem {...props} TransitionComponent={TransitionComponent} />);

  const useStyles = makeStyles({
    root: {
      height: 264,
      flexGrow: 1,
      maxWidth: 400,
    },
  });
  //============================================================================



  function getSteps() {
    return [
      { label: "Pallet Description", value: null },
      { label: "Mapping Pallet", value: null },
    ];
  }
  const onHandleChangeInput = (value, fieldDataKey) => {
    if (fieldDataKey === "areaID")
      localStorage.setItem("areaIDs", value);
    if (fieldDataKey === "processType")
      localStorage.setItem("processTypes", value);

    valueInput[fieldDataKey] = value;
  };
  const handleNext = index => {
    if (localStorage.getItem("processTypes") !== null)
      valueInput["processType"] = localStorage.getItem("processTypes")
    if (localStorage.getItem("areaIDs") !== null)
      valueInput["areaID"] = localStorage.getItem("areaIDs")
    //==========================================================
    if (index === 0) {
      if (valueInput.areaID && valueInput.processType) {
        setActiveStep(prevActiveStep => prevActiveStep + 1);
      } else {
        setDialogState({ type: "warning", content: "กรุณากรอกข้อมูลให้ครบ", state: true })
      }
    } else if (index === 1) {

    }
  };
  const handleSelect = (event, nodeIds) => {
    if (nodeIds !== "1") {
      setSelected(nodeIds)
      setDialog(true)

    }
  };
  const onHandleChangeInputPalletCode = (keydata, value, event) => {
    setPalletCode(value);
    if (event === "Enter")
      scanMappingSto(value, null)
  };
  const onHandleChangeInputBarcode = (keydata, value, event) => {
    valueManual[keydata] = value;
    setQrCode(value)
    if (event === "Enter") {
      getDocByQRCode(value)
    };
  }
  const onHandleChangeInputManual = (value, fieldDataKey) => {
    valueManual[fieldDataKey] = value;
  };
  function handleBack() {
    valueInput.warehouseID = null
    valueInput.processType = null
    valueInput.areaID = null
    valueInput.palletCode = null
    setDisPlayQr(true)
    setDisPlayButton(false)
    setCheckedAutoClear(true)
    setQrCode("")
    setPalletCode("")
    setCheckedAuto(true)
    setDataPallet(null)
    setDataDoc(null)
    setActiveStep(activeStep - 1);
  }
  const onHandledataConfirm = (status, rowdata) => {
    if (status) {
      scanMappingSto(valueInput.palletCode, "edit")
    } else {
      setDialog(false)
    }

  }
  function getDocByQRCode(value) {
    Axios.get(window.apipath + `/v2/GetDocByQRCodeAPI?qr=${value}`).then(res => {
      if (res.data._result.status === 1) {
        setDataDoc(res.data)
        setFlaggetDataDoc(true)
        setDisPlayButton(true)
      } else {
        setDialogState({ type: "error", content: res.data._result.message, state: true })
      }

    })
  }

  function scanMappingSto(pallet, type) {
    let postdata = {
      processType: valueInput.processType,
      bstoCode: pallet,
      warehouseID: 1,
      areaID: valueInput.areaID,
      pstos: []
    };
    Axios.post(window.apipath + "/v2/scan_mapping_sto", postdata).then(res => {
      if (res.data._result.status === 1) {
        if (res.data.bsto !== undefined) {
          setDataPallet(res.data.bsto)
          setDisPlayQr(false)
          var el = document.getElementById('barcode');
          if (el !== null)
            el.value = null
          el.focus()
        }
        setDialog(false)
      } else {
        setDialogState({ type: "error", content: res.data._result.message, state: true })
      }
    })
  }
  const onConfirmMappingSTO = () => {

    if (dataPallet !== undefined && dataPallet !== null) {
      const tempDataReq = { bstoID: parseInt(dataPallet.id) }
      Axios.post(window.apipath + "/v2/confirm_mappingSTOandDiSTOBybstoID", tempDataReq).then((res) => {
        if (res.data != null) {
          if (res.data._result.status === 1) {
            setDialogState({ type: "success", content: "Success", state: true })

            handleBack()
          } else {
            setDialogState({ type: "error", content: res.data._result.message, state: true })
          }
        } else {
          setDialogState({ type: "error", content: res.data._result.message, state: true })
        }
      });
    } else {
      setDialogState({ type: "warning", content: "กรุณาระบุเลขพาเลท", state: true })
    }
  }
  function scanMappingSto(pallet, type) {
    let postdata = {
      processType: valueInput.processType,
      bstoCode: pallet === undefined || pallet === null ? palletCode : pallet,
      warehouseID: 1,
      areaID: valueInput.areaID,
      pstos: []
    };

    if (type === "confirm") {
      if (checkedAuto) {
        if (dataDoc !== undefined && dataDoc !== null) {
          dataDoc.datas.forEach(element => {
            postdata.pstos.push(element)
          });
        }
      } else {
        postdata = genDataManual(postdata, valueManual, props.columnsManual)
        // props.columnsManual.forEach(x => {
        //   valueManual[x.field] = null
        // })
      }
    } else if (type === "edit") {
      var mapstosSelected = dataPallet.mapstos.filter(x => x.id === selected)


      if (mapstosSelected !== undefined && mapstosSelected !== null) {
        mapstosSelected[0].addQty = valueInput.editQty
        postdata = GenMapstosSelected(postdata, mapstosSelected)
      }
    }
    Axios.post(window.apipath + "/v2/scan_mapping_sto", postdata).then(res => {
      if (res.data._result.status === 1) {
        if (res.data.bsto !== undefined) {
          setDisPlayQr(false)
          setDataPallet(res.data.bsto)
          setDataDoc(null)

          if (checkedAuto === false && type === "confirm") {
            props.columnsManual.forEach(x => {
              valueManual[x.field] = null
            })
            setCheckedAuto(true)
          }
          if (checkedAutoClear && type === "confirm") {
            var el = document.getElementById('palletcode');
            var elbarcode = document.getElementById('barcode');
            if (elbarcode !== null)
              elbarcode.value = null
            if (el !== null)
              el.value = null
            el.focus()
          } else if (checkedAutoClear === false && type === "confirm") {
            var el = document.getElementById('barcode');
            if (el !== null)
              el.value = null
            el.focus()
          }
        }
        setDialog(false)
      } else {
        setDialogState({ type: "error", content: res.data._result.message, state: true })
      }
    })
  }

  function getStepContent(step) {
    switch (step) {
      case 0:
        return (
          <div>
            <FormInline>
              <LabelH1>Warehouse :</LabelH1>
              <AmDropdown
                placeholder="Select"
                fieldDataKey="warehouseID"
                fieldLabel={["Name"]}
                labelPattern=" : "
                ddlMinWidth={300}
                queryApi={WarehouseQuery()}
                defaultValue={1}
                onChange={(value, dataObject, inputID, fieldDataKey) =>
                  onHandleChangeInput(value, fieldDataKey)}
                ddlType={"search"}
              />
            </FormInline>
            <FormInline>
              <LabelH1>Process No.:</LabelH1>
              <AmDropdown
                placeholder="Select"
                fieldDataKey="processType"
                fieldLabel={["Code", "Name"]}
                labelPattern=" : "
                ddlMinWidth={300}
                defaultValue={localStorage.getItem("processTypes")}
                queryApi={DocumentProcessTypeQuery()}
                onChange={(value, dataObject, inputID, fieldDataKey) =>
                  onHandleChangeInput(value, fieldDataKey)}
                ddlType={"search"}
              />
            </FormInline>

            <FormInline>
              <LabelH1>Area :</LabelH1>
              <AmDropdown
                placeholder="Select"
                fieldDataKey="areaID"
                fieldLabel={["Name"]}
                labelPattern=" : "
                ddlMinWidth={300}
                queryApi={AreaMasterQuery()}
                defaultValue={localStorage.getItem("areaIDs")}
                onChange={(value, dataObject, inputID, fieldDataKey) =>
                  onHandleChangeInput(value, fieldDataKey)

                }
                ddlType={"search"}
              />
            </FormInline>
          </div>
        );
      case 1:
        return (<div>

          {/* =================================== TreeView ===================================== */}
          <TreeView
            className={classes.root}
            defaultExpanded={['1']}
            defaultCollapseIcon={<MinusSquare />}
            defaultExpandIcon={<PlusSquare />}
            defaultEndIcon={dataPallet != undefined ? (
              dataPallet.mapstos === null ? <MinusSquare /> : <EditIcon />) : null}

            onNodeSelect={handleSelect}
          >
            <StyledTreeItem nodeId="1" label={dataPallet !== undefined && dataPallet !== null ? dataPallet.code : null}>
              {dataPallet === undefined || dataPallet === null ? null :
                dataPallet.mapstos === null ? null : dataPallet.mapstos.map((x, index) => {
                  return (
                    <div key={index} syle={{ marginLeft: "30px" }} >
                      <StyledTreeItem
                        nodeId={x.id}
                        label={
                          x.code + " | " +
                          x.qty + " " +
                          x.unitCode + " | " +
                          (x.lot === null ? "" : x.lot)}
                      />
                    </div>
                  );
                })}
            </StyledTreeItem>
          </TreeView>
          {/* =================================== Claer ===================================== */}
          <Card>
            <CardContent>
              <FormInline>
                <CheckboxCustom onClick={event => {
                  setCheckedAutoClear(event.target.checked)
                }}
                  defaultChecked={checkedAutoClear} />
                <LabelH1 style={{ width: "120px" }}>{"Clear pallet auto"}</LabelH1>
              </FormInline>
              {/* =================================== Pallet ===================================== */}
              <FormInline>
                <LabelH1>Pallet Code :</LabelH1>
                <AmInput
                  id={"palletcode"}
                  placeholder="Pallet Code"
                  type="input"
                  autoFocus={autoFocus}
                  style={{ width: "200px" }}
                  onChange={(value, obj, element, event) =>
                    onHandleChangeInputPalletCode("palletCode", value)
                  }
                  onKeyPress={(value, obj, element, event) => {
                    if (event.key === "Enter") {
                      onHandleChangeInputPalletCode("palletCode", value, event.key)
                    }
                  }}
                />
                <IconButton
                  size="small"
                  aria-label="info"
                  style={{ paddingTop: "10px" }}
                >
                  <SearchIcon
                    fontSize="small"
                    onClick={() => { scanMappingSto(palletCode, null) }}
                  />
                </IconButton>
              </FormInline>
              {/* =================================== Auto  ===================================== */}
              <FormInline>
                <CheckboxCustom onClick={event => {
                  setCheckedAuto(event.target.checked)
                }}
                  defaultChecked={checkedAuto} />
                <LabelH1 style={{ width: "120px" }}>{"Scan barcode"}</LabelH1>
              </FormInline>
              {/* =================================== CheckedAuto ===================================== */}
              {
                checkedAuto === true ?
                  <div>
                    <FormInline>
                      <LabelH1>QRcode :</LabelH1>
                      <AmInput
                        id={"barcode"}
                        placeholder="QRcode Product"
                        type="input"
                        style={{ width: "200px" }}
                        disabled={disPlayQr}
                        onChange={(value, obj, element, event) =>
                          onHandleChangeInputBarcode("barcode", value)
                        }
                        autoFocus={autoFocusBarcode}
                        onKeyPress={(value, obj, element, event) => {
                          if (event.key === "Enter") {
                            onHandleChangeInputBarcode("barcode", value, event.key)
                          }

                        }}
                      />
                      <IconButton
                        size="small"
                        aria-label="info"
                        style={{ paddingTop: "10px" }}
                      >
                        <SearchIcon
                          fontSize="small"
                          onClick={() => { getDocByQRCode(qrCode) }}
                        />
                      </IconButton>
                    </FormInline>
                  </div> :
                  <div>
                    <Card >
                      <CardContent>
                        {props.columnsManual === null ? null : props.columnsManual.map((x, index) => {
                          return (
                            <div key={index} syle={{ marginLeft: "30px" }} >

                              {FuncSetEleManual(x)}

                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  </div>
              }
              {/* =================================== End ===================================== */}
              <br />
              {checkedAuto && flaggetDataDoc ? (dataDoc !== undefined && dataDoc !== null ?
                <div>
                  <LabelH1>{"Detail"}</LabelH1>
                  {DataGenerateEleDocDisplay(dataDoc)}
                </div> :
                // <div>
                //   <LabelH1>{"Detail"}</LabelH1>

                //   {DataGenerateEleManaulDisplay(valueManual, props.columnsManual)}
                // </div>
                null
              ) : null}
            </CardContent>
          </Card>
        </div >)

      default:
        return "Unknown step";
    }
  }
  //==========================================================================================
  const FuncSetEleManual = (x) => {
    if (x.type === "input") {
      return (
        <FormInline>
          {" "}
          <LabelH1>{x.name} : </LabelH1>
          <InputDiv>
            <AmInput
              required={x.required}
              id={x.field}
              required={x.required}
              validate={true}
              style={{ width: "200px", margin: "0px" }}
              placeholder={x.placeholder}
              type={"input"}
              defaultValue={valueManual[x.field] ? valueManual[x.field] : ""}
              onChange={(value, dataObject, inputID, fieldDataKey) =>
                onHandleChangeInputManual(value, x.field)}
            />
          </InputDiv>
        </FormInline>
      );
    } else if (x.type === "dropdown") {
      return (
        <FormInline>
          {" "}
          <LabelH1>{x.name} : </LabelH1>
          <AmDropdown
            required={x.required}
            id={x.field}
            disabled={x.disable}
            placeholder={x.placeholder}
            fieldDataKey={"Code"}
            fieldLabel={x.fieldLabel}
            labelPattern=" : "
            width={200}
            ddlMinWidth={200}
            valueData={valueInput[x.field]}
            queryApi={x.dataDropDown}
            onChange={(value, dataObject, inputID, fieldDataKey) =>
              onHandleChangeInputManual(value, x.field)}
            ddlType={"search"}
          />
        </FormInline>
      );
    } else if (x.type === "datetime") {
      return <FormInline>
        {" "}
        <LabelH1>{x.name} : </LabelH1>
        <AmDatePicker
          style={{ display: "inline-block" }}
          onBlur={(e) => {
            if (e !== undefined && e !== null)
              onHandleChangeInputManual(e.fieldDataObject, x.field)
          }}
          TypeDate={"date"} fieldID="dateFrom"
        />

      </FormInline>
    }
  };

  const RanderEle = () => {
    if (dataPallet) {
      const columns = props.columnsEdit
      return columns.map(y => {
        return {
          component: (data, cols, key) => {
            {
              var mapstosSelected = dataPallet.mapstos.filter(x => x.id === selected)
              return mapstosSelected === null ? null : mapstosSelected.map((x, index) => {
                return (
                  <div key={index} syle={{ marginLeft: "30px" }} >
                    <FormInline>
                      <LabelH2>{y.name} :</LabelH2>
                      <AmInput
                        id={y.field}
                        style={{ width: "150px", margin: "0px" }}
                        type="input"
                        disabled={y.disabled}
                        defaultValue={x ? x[y.field] : 0}
                        onKeyPress={(value, obj, element, event) => {
                          if (event.key === "Enter") {
                            onHandleChangeInput(value, "editQty")
                          }

                        }}
                        onChange={(value, obj, element, event) =>
                          onHandleChangeInput(value, "editQty")
                        }
                      />
                    </FormInline>

                  </div >
                );
              })
            }

          }
        };
      });

    }
  };

  return (
    <div className={classes.root}>
      <AmEditorTable
        open={dialog}
        onAccept={(status, rowdata) => onHandledataConfirm(status, rowdata)}
        titleText={"Edit"}
        data={dataPallet !== undefined ? dataPallet : []}
        columns={RanderEle()}
      />
      <AmDialogs
        typePopup={dialogState.type}
        onAccept={(e) => { setDialogState({ ...dialogState, state: false }) }}
        open={dialogState.state}
        content={dialogState.content} />
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
                <div>

                  {activeStep == 0 ? null : (
                    <AmButton
                      styleType="add"
                      className="float-left"
                      onClick={() => onConfirmMappingSTO()}
                      style={{ margin: '5px 0px 5px 0px' }}>
                      {t("Received")}
                    </AmButton>
                  )}
                  {activeStep === steps.length - 1 ? ((disPlayButton === false ? null :
                    <AmButton
                      styleType="confirm"
                      onClick={() => {
                        scanMappingSto(valueInput.palletCode, "confirm")
                      }}
                      className="float-right"
                      style={{ margin: '5px 0px 5px 0px' }}
                    >
                      {t("Confirm")}
                    </AmButton>
                  )) : (
                      <AmButton
                        className="float-right"
                        style={{ margin: '5px 0px 5px 0px' }}
                        styleType="confirm"
                        onClick={() => handleNext(index)}

                      >
                        {t("Next")}
                      </AmButton>
                    )}
                  {activeStep == 0 ? null : (
                    <AmButton
                      styleType="delete_clear"
                      onClick={handleBack}
                      className="float-right"
                      style={{ margin: '5px 0px 5px 0px' }}
                    >
                      {t("Back")}
                    </AmButton>
                  )}
                </div>

              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>
      <br />
    </div>
  );
};

export default withStyles(styles)(AmMappingPalletV2);
