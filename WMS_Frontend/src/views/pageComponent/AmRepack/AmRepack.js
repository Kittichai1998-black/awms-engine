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
import BoxIcon from "@material-ui/icons/Widgets";
import AmDropdown from '../../../components/AmDropdown'
import { fade, makeStyles, withStyles } from '@material-ui/core/styles';
import TreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem';
import Collapse from '@material-ui/core/Collapse';
import { useSpring, animated } from 'react-spring/web.cjs';
import EditIcon from '@material-ui/icons/Edit';
import PropTypes from 'prop-types';
import AmDatePicker from '../../../components/AmDate';
import { PlusSquare, MinusSquare, LabelIcon } from "./IconTreeview";
import { UnitTypeQuery } from "./queryString";
import Checkbox from "@material-ui/core/Checkbox";
import AmEditorTable from "../../../components/table/AmEditorTable";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
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
  width: 100px;
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

const AmRepack = props => {
  const { t } = useTranslation();
  const { classes } = props;

  const [valueInput, setValueInput] = useState({});
  const [valueManual, setValueManual] = useState({});

  const [showDialog, setShowDialog] = useState(null);
  const [stateDialog, setStateDialog] = useState(false);
  const [msgDialog, setMsgDialog] = useState("");
  const [typeDialog, setTypeDialog] = useState("");

  const [activeStep, setActiveStep] = useState(0);


  const [docID, setDocID] = useState("");
  const [palletCode, setPalletCode] = useState("");
  const [newQtyRepack, setNewQtyRepack] = useState();
  const [newQty, setNewQty] = useState(null);
  const [dialog, setDialog] = useState(false);
  const [dialogPopup, setDialogPopup] = useState(false);
  const [datasTreeView, setDatasTreeView] = useState([])
  const [dataPallet, setDataPallet] = useState();
  const [dataDoc, setDataDoc] = useState();
  const [dialogState, setDialogState] = useState({});

  const [checkedClear, setCheckedClear] = useState("");
  const [checkedAutoClear, setCheckedAutoClear] = useState(true);
  const [autoFocus, setAutoFocus] = useState(true)
  const [autoFocusBarcode, setAutoFocusBarcode] = useState(false)
  const alertDialogRenderer = (message, type, state) => {
    setMsgDialog(message);
    setTypeDialog(type);
    setStateDialog(state);
  };
  const [selected, setSelected] = React.useState([]);
  const [autoQty, setAutoQty] = useState(0)
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

  function getSteps() {
    return [
      { label: "Pallet of Depack", value: palletCode },
      { label: "Depackaging", value: null },
    ];
  }
  const steps = getSteps();
  const onHandleChangeInput = (value, fieldDataKey) => {
    valueInput[fieldDataKey] = value;
    setValueInput({ ...valueInput })
  };
  const handleNext = index => {
    if (index === 0) {
      if (palletCode !== "") {
        scanMappingSto(palletCode)
        setActiveStep(prevActiveStep => prevActiveStep + 1);
      } else {
        setDialogState({ type: "warning", content: "กรุณากรอกเลขพาเลท", state: true })
      }
    }
  };
  const handleSelect = (event, nodeIds) => {
    if (nodeIds !== "1") {
      var dataQty = dataPallet.mapstos.filter(x => x.id === nodeIds)
      valueInput.qtyOriginal = dataQty.qty
      setNewQty(null)
      setSelected(nodeIds)
      setDialogPopup(true)
      //setDialog(true)

    }
  };

  const onHandleChangeInputPalletCode = (keydata, value, event) => {
    setPalletCode(value);
    if (event === "Enter") {
      scanMappingSto(value)
      setActiveStep(prevActiveStep => prevActiveStep + 1);
    }
  };

  function handleBack() {
    valueInput.palletcodeNew = null
    valueInput.palletCode = null
    setSelected([])
    setDataPallet(null)
    setActiveStep(activeStep - 1);
  }


  const onConvertUnitRepack = (unitID, data) => {
    if (unitID !== null) {
      const dataSend = {
        skuID: data.skuID,
        unitRepackID: data.unitID,
        oldQty: valueInput.qtyOriginal === undefined ? data.qty : parseInt(valueInput.qtyOriginal),
        newUnitID: unitID
      }
      Axios.post(window.apipath + "/v2/unit_convert", dataSend).then((res) => {
        if (res.data._result.status === 1) {
          setNewQtyRepack(res.data)
          setNewQty(res.data !== undefined ?
            (res.data.qtyRepack !== undefined ? res.data.qtyRepack.newQty : null)
            : null)
        } else {
          setDialogState({ type: "error", content: res.data._result.message, state: true })
        }

      });
    } else {
      setNewQty()
      setNewQtyRepack()
    }
  }

  function scanMappingSto(pallet) {
    if (pallet !== "") {
      const dataSend = {
        bstoCode: pallet,
      }

      Axios.post(window.apipath + "/v2/getInfo_pallet", dataSend).then((res) => {
        if (res.data._result.status === 1) {
          setDataPallet(res.data.bsto)

        } else {
          setDialogState({ type: "error", content: res.data._result.message, state: true })
        }

      });
    } else {
      setDialogState({ type: "warning", content: "กรุณากรอกเลขพาเลท", state: true })
    }

  }
  function repackSto() {
    var psto = dataPallet.mapstos.filter(x => x.id === selected)
    let dataSend = {
      psto: psto[0].id,
      oldbstoCode: dataPallet.code,
      oldqty: newQtyRepack.qtyRepack.oldQty,
      newbstoCode: valueInput.palletcodeNew,
      newQty: newQtyRepack.qtyRepack.newQty,
      newUnitID: newQtyRepack.qtyRepack.newUnitType_ID,
    }

    Axios.post(window.apipath + "/v2/repeckaging", dataSend).then((res) => {
      if (res.data._result.status === 1) {
        // setDataPallet(res.data.bsto)
        scanMappingSto(res.data.bsto.code)
        Clear()
        setDialogPopup(false)
        setDialogState({ type: "success", content: "Success", state: true })
      } else {
        setDialogState({ type: "error", content: res.data._result.message, state: true })
      }

    });
  }
  const onHandledataConfirm = (status, rowdata) => {
    if (status) {
      if (valueInput.palletcodeNew === "" || (valueInput.palletcodeNew === undefined || newQtyRepack === undefined)) {
        setDialogState({ type: "warning", content: "กรุณากรอกข้อมูลให้ครบ", state: true })
        //setDialogPopup(false)
        //Clear()
      } else {
        repackSto()
      }
    } else {
      setDialogPopup(false)
      // props.onClose(false)
      // Clear()
    }

  }
  function getStepContent(step) {
    switch (step) {
      case 0:
        return (
          <div>
            <AmInput
              id={"palletcode"}
              placeholder="Pallet Code"
              type="input"
              autoFocus={autoFocus}
              style={{ width: "100%" }}
              onChange={(value, obj, element, event) =>
                onHandleChangeInputPalletCode("palletCode", value)
              }

              onKeyPress={(value, obj, element, event) => {
                if (event.key === "Enter") {
                  onHandleChangeInputPalletCode("palletCode", value, event.key)
                }
              }}
            />
          </div>
        );
      case 1:
        if (dataPallet !== null) {
          if (dataPallet !== undefined) {
            var mapstosSelected = dataPallet.mapstos.filter(x => x.id === selected)
          }

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
                        <FormInline>
                          <StyledTreeItem
                            nodeId={x.id}
                            label={
                              x.code + " | " +
                              x.qty + " " +
                              x.unitCode + " | " +
                              (x.lot === null ? "" : x.lot)}
                          />
                        </FormInline>
                      </div>
                    );
                  })}
              </StyledTreeItem>
            </TreeView>
            <br />
            {/* {selected.length !== 0 ? randerEleRepack(mapstosSelected[0], mapstosSelected[0]["qty"], mapstosSelected[0]["unitCode"]) : null} */}
          </div >)
        }
      default:
        return "Unknown step";
    }
  }

  const randerEleRepack = (data, qty, unit) => {
    return <div>

      <LabelH1 style={{ width: "150px" }}>{"DePackaging From"}</LabelH1>

      <FormInline style={{ display: "block" }}>
        <LabelH>{"Quantity :"}</LabelH>
        <AmInput
          id={"qtyOriginal"}
          placeholder="Qty Original"
          type="input"
          value={valueInput.qtyOriginal === undefined ? qty : parseInt(valueInput.qtyOriginal)}
          type={"number"}
          //defaultValue={qty ? qty : 0}
          onChangeV2={(value, fieldDataKey) =>
            onHandleChangeInput(value, "qtyOriginal")}
          style={{ width: "70px" }}
        />
        <LabelH1 style={{ width: "50px", paddingLeft: "10px" }}>{unit}</LabelH1>
      </FormInline>
      <br />
      <LabelH1 style={{ width: "150px" }}>{"DePackaging To"}</LabelH1>
      <FormInline >

        <LabelH>{"Quantity :"}</LabelH>
        <AmInput
          id={"qtyNew"}
          type="input"
          value={newQty}
          disabled={true}
          style={{ width: "70px" }}
        />

        <LabelH style={{ width: "50px" }}>{"Unit :"}</LabelH>
        <AmDropdown
          ID="repackID"
          placeholder="Select DePack"
          fieldDataKey="ID"
          fieldLabel={["Code", "Name"]}
          labelPattern=" : "
          ddlMinWidth={150}
          style={{ width: "150px" }}
          queryApi={UnitTypeQuery()}
          onChange={(value, dataObject, inputID, fieldDataKey) =>
            onConvertUnitRepack(value, data)
          }
          ddlType={"search"}
        />
      </FormInline>
      <br />
      {onRanderEleNewPallet()}
    </div >
  };

  const onRanderEleNewPallet = () => {
    return <FormInline style={{ display: "block" }}>
      <LabelH1>{"New Pallet :"}</LabelH1>
      <AmInput
        id={"palletcodeNew"}
        placeholder="New Pallet Code"
        type="input"
        //autoFocus={autoFocus}
        style={{ width: "50%" }}

        onChange={(value, obj, element, event) =>
          onHandleChangeInput(value, "palletcodeNew")
        }
        onKeyPress={(value, obj, element, event) => {
          if (event.key === "Enter") {
            onHandleChangeInput(value, "palletcodeNew")
            if (valueInput.palletcodeNew === "" || (valueInput.palletcodeNew === undefined || newQtyRepack === undefined)) {
              setDialogState({ type: "warning", content: "กรุณากรอกข้อมูลให้ครบ", state: true })
            } else {
              repackSto()
            }
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
          onClick={() => {
            if (valueInput.palletcodeNew === "" || (valueInput.palletcodeNew === undefined || newQtyRepack === undefined)) {
              setDialogState({ type: "warning", content: "กรุณากรอกข้อมูลให้ครบ", state: true })
              //setDialogPopup(false)
              //Clear()
            } else {
              repackSto()
            }
          }}
        />
      </IconButton>
    </FormInline>

  }
  const RanderEle = () => {

    if (dataPallet !== null) {
      if (dataPallet !== undefined) {
        var mapstosSelected = dataPallet.mapstos.filter(x => x.id === selected)
      }

      const columns = [{ field: "Code" }]
      return columns.map(y => {
        return {
          component: (data, cols, key) => {
            return (
              <div >
                {selected.length !== 0 ?
                  randerEleRepack(mapstosSelected[0],
                    mapstosSelected[0]["qty"],
                    mapstosSelected[0]["unitCode"]) : null}
              </div>
            );
          }
        };
      });
    }
  };
  const Clear = () => {
    setSelected([])
    setNewQtyRepack()
    setNewQty(0)
  };
  //==========================================================================================

  return (
    <div className={classes.root}>
      <AmEditorTable
        width={"100%"}
        open={dialogPopup}
        onAccept={(status, rowdata) => onHandledataConfirm(status, rowdata)}
        titleText={"Depackaging"}
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
                  {activeStep == 1 ? null : (
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

export default withStyles(styles)(AmRepack);
