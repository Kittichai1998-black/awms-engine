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
import { PlusSquare, MinusSquare, LabelIcon } from "./IconTreeview";
import { UnitTypeQuery } from "./queryString";
import Checkbox from "@material-ui/core/Checkbox";
import AmEditorTable from "../../../components/table/AmEditorTable";
import Grid from '@material-ui/core/Grid';
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
  const steps = getSteps();

  const [flagConfirm, setFlagConfirm] = useState(false);
  const [flaggetDataDoc, setFlaggetDataDoc] = useState(false);
  const [docID, setDocID] = useState("");
  const [palletCode, setPalletCode] = useState("");
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
      { label: "Pallet", value: null },
      { label: "Description", value: null },
    ];
  }
  const onHandleChangeInput = (value, fieldDataKey) => {
    valueInput[fieldDataKey] = value;
  };
  const handleNext = index => {
    if (index === 0) {

      setActiveStep(prevActiveStep => prevActiveStep + 1);

    } else if (index === 1) {

    }
  };
  const handleSelect = (event, nodeIds) => {
    if (nodeIds !== "1") {
      setSelected(nodeIds)
      setDialog(true)

    }
  };
  const onHandleChangeInputPalletCode = (keydata, value) => {
    setPalletCode(value);
    scanMappingSto(value)
  };

  function handleBack() {
    valueInput.warehouseID = null
    valueInput.processType = null
    valueInput.areaID = null
    valueInput.palletCode = null
    setCheckedAutoClear(true)
    setCheckedAuto(true)
    setDataPallet(null)
    setDataDoc(null)
    setActiveStep(activeStep - 1);
  }
  const onHandledataConfirm = (status, rowdata) => {
    if (status) {
      scanMappingSto(valueInput.palletCode)
    } else {
      setDialog(false)
    }

  }

  function scanMappingSto(pallet) {
    console.log(pallet)
    const dataSend = {
      bstoCode: pallet,
    }
    Axios.post(window.apipath + "/v2/getInfo_pallet", dataSend).then((res) => {
      console.log(res.data)
      if (res.data._result.status === 1) {
        setDataPallet(res.data.bsto)
      } else {
        setDialogState({ type: "error", content: res.data._result.message, state: true })
      }

    });
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
                onHandleChangeInputPalletCode(value, "palletCode")
              }

              onBlur={(e) => {
                if (e !== undefined && e !== null)
                  onHandleChangeInputPalletCode("palletCode", e)
              }}
              onKeyPress={(value, obj, element, event) => {
                if (event.key === "Enter") {
                  onHandleChangeInputPalletCode("palletCode", value)
                }
              }}
            />
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
            {console.log(dataPallet)}
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

          <Paper style={{ backgroundColor: "#F5F5F5", height: "200px" }}>

            <FormInline>
              <LabelH1>{"Qty Original :"}</LabelH1>
              <AmInput
                id={"qtyOriginal"}
                placeholder="Qty Original"
                type="input"
                autoFocus={autoFocus}
                style={{ width: "100%" }}
              />
            </FormInline>
            <FormInline>
              <AmDropdown
                placeholder="Select"
                fieldDataKey="areaID"
                fieldLabel={["Name"]}
                labelPattern=" : "
                ddlMinWidth={300}
                queryApi={UnitTypeQuery()}
                //defaultValue={localStorage.getItem("areaIDs")}
                // onChange={(value, dataObject, inputID, fieldDataKey) =>
                //   onHandleChangeInput(value, fieldDataKey)

                // }
                ddlType={"search"}
              />
            </FormInline>
            <FormInline>
              <LabelH1>{"Qty Original :"}</LabelH1>
              <AmInput
                id={"qtyOriginal"}
                placeholder="Qty Original"
                type="input"
                autoFocus={autoFocus}
                style={{ width: "100%" }}
              />
            </FormInline>
          </Paper>
        </div >)

      default:
        return "Unknown step";
    }
  }
  //==========================================================================================

  return (
    <div className={classes.root}>
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
                  {activeStep === steps.length - 1 ? (
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
                  ) : (
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
