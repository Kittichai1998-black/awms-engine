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
import AmEditorTable from "../../../components/table/AmEditorTable";
import { DataGenerateEleDocDisplay, DataGenerateEleManaulDisplay } from "../AmMappingPallet/RanderEleDocDisplay";
import { PlusSquare, MinusSquare } from "./IconTreeview";
import { WarehouseQuery, AreaMasterQuery, DocumentProcessTypeQuery } from "./queryString";
import { GenMapstosSelected, genDataManual } from "./genDataManual";
import AmDatePicker from '../../../components/AmDate';
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


const AmMappingPallet = props => {
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
  const [docID, setDocID] = useState("");
  const [palletCode, setPalletCode] = useState("");
  const [warehouseID, setWarehouseID] = useState(1);

  const [dialog, setDialog] = useState(false);
  const [datasTreeView, setDatasTreeView] = useState([])
  const [dataPallet, setDataPallet] = useState();
  const [dataDoc, setDataDoc] = useState();
  const [areaLocationMasterQuery, setAreaLocationMasterQuery] = useState()
  const alertDialogRenderer = (message, type, state) => {
    setMsgDialog(message);
    setTypeDialog(type);
    setStateDialog(state);
  };
  const [checkedAuto, setCheckedAuto] = useState(true);


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



  useEffect(() => {
    if (msgDialog && stateDialog && typeDialog) {
      setShowDialog(
        <AmDialogs
          typePopup={typeDialog}
          content={msgDialog}
          onAccept={e => {
            setStateDialog(e);
          }}
          open={stateDialog}
        />
      );
    } else {
      setShowDialog(null);
    }
  }, [stateDialog, msgDialog, typeDialog]);
  useEffect(() => { }, [valueInput]);
  const onHandleChangeInput = (value, dataObject, inputID, fieldDataKey
  ) => {

    if (fieldDataKey === "areaID") {
      const AreaLocationMasterQuery = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "AreaLocationMaster",
        q: '[{ "f": "Status", "c":"=", "v": 1},{ "f": "ObjectSize_ID", "c":"=", "v": 1},{ "f": "AreaMaster_ID", "c":"=", "v":' + valueInput.areaID + '}]',
        f: "Code,ID as locaionID,Name",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: "",
      }
      setAreaLocationMasterQuery(AreaLocationMasterQuery)
    } else if (fieldDataKey === "processType") {
      setActiveStep(prevActiveStep => prevActiveStep + 1);
    }
    valueInput[fieldDataKey] = value;


  };
  const onHandleChangeInputManual = (value, dataObject, inputID, fieldDataKey) => {
    valueManual[fieldDataKey] = value;
  };
  const onHandleChangeInputPalletCode = (keydata, value, obj, element, event) => {
    valueInput[keydata] = value;
    console.log(keydata)
    console.log(value)
    if (keydata === "PalletCode") {
      GetPalletSto(value);
      setPalletCode(value);

    }
  };
  function getSteps() {
    var warehouseID = "";
    if (valueInput) {
      if (valueInput.warehouseID) {
        warehouseID = valueInput.warehouseID;
      }
    }
    return [
      { label: "Warehouse", value: null },
      { label: "DocProcessType", value: null },
      { label: "Pallet", value: valueInput !== undefined ? (valueInput.PalletCode === undefined ? null : valueInput.PalletCode) : null },
      { label: "Area&Location", value: null },
      { label: "Barcode", value: null },
      { label: "Detail", value: null }
    ];
  }
  const GetPalletSto = code => {
    if (code) {
      const Query = {
        queryString: window.apipath + "/v2/SelectDataTrxAPI/",
        t: "StorageObject",
        q: '[{ "f": "Status", "c":"=", "v":"1"},{ "f": "Code", "c":"=", "v":"' + code + '"}]',
        f: "*",
        g: "",
        s: "[{'f':'Code','od':'asc'}]",
        sk: 0,
        l: 1,
        all: ""
      };
      var queryStr = createQueryString(Query)
      Axios.get(queryStr).then(res => {
        if (!IsEmptyObject(res.data.datas)) {
          if (res.data.datas.length !== 0) {
            valueInput["areaID"] = res.data.datas[0].AreaMaster_ID
            valueInput["locaionID"] = res.data.datas[0].AreaLocationMaster_ID
          }
          setActiveStep(prevActiveStep => prevActiveStep + 1);
        }
      });
    } else {
      alertDialogRenderer("Barcode Pallet must be value", "error", true);
    }
  };
  const [expanded, setExpanded] = React.useState([]);
  const [selected, setSelected] = React.useState([]);


  const handleSelect = (event, nodeIds) => {
    //setSelected(nodeIds);

    if (nodeIds !== "1") {
      setSelected(nodeIds)
      setDialog(true)

    }
  };
  const handleChange = (event) => {
    setCheckedAuto(event.target.checked)
  }
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
                onHandleChangeInputManual(value, dataObject, inputID, x.field)}
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
              onHandleChangeInputManual(value, dataObject, inputID, x.field)}
            ddlType={x.typeDropdow}
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
              onHandleChangeInputManual(e.fieldDataObject, null, null, x.field)
          }}
          TypeDate={"date"} fieldID="dateFrom"
        />

      </FormInline>
    }
  };
  function getStepContent(step) {
    switch (step) {
      case 0:
        return (
          <div>
            <AmDropdown
              placeholder="Select"
              fieldDataKey="warehouseID" //ฟิล์ดดColumn ที่ตรงกับtable ในdb 
              fieldLabel={["Name"]} //ฟิล์ดที่ต้องการเเสดงผลใน optionList และ ช่อง input
              labelPattern=" : " //สัญลักษณ์ที่ต้องการขั้นระหว่างฟิล์ด
              ddlMinWidth={300} //กำหนดความกว้างของกล่อง dropdown
              queryApi={WarehouseQuery()}
              defaultValue={1}
              onChange={(value, dataObject, inputID, fieldDataKey) => onHandleChangeInput(value, dataObject, inputID, fieldDataKey)}
              ddlType={"search"} //รูปแบบ Dropdown 
            />
          </div>
        );
      case 1:
        //return dataShow;
        return <AmDropdown
          placeholder="Select"
          fieldDataKey="processType" //ฟิล์ดดColumn ที่ตรงกับtable ในdb 
          fieldLabel={["Name"]} //ฟิล์ดที่ต้องการเเสดงผลใน optionList และ ช่อง input
          labelPattern=" : " //สัญลักษณ์ที่ต้องการขั้นระหว่างฟิล์ด                        
          ddlMinWidth={300} //กำหนดความกว้างของกล่อง dropdown
          queryApi={DocumentProcessTypeQuery()}
          onChange={(value, dataObject, inputID, fieldDataKey) => onHandleChangeInput(value, dataObject, inputID, fieldDataKey)}
          ddlType={"search"} //รูปแบบ Dropdown 
        />
      case 2:
        //return dataShow;
        return <AmInput
          id={"PalletCode"}
          placeholder="Pallet code"
          type="input"
          style={{ width: "100%" }}
          onChange={(value, obj, element, event) =>
            onHandleChangeInput(value, null, "PalletCode", null, event)
          }
          onBlur={(e) => {
            if (e !== undefined && e !== null)
              onHandleChangeInputPalletCode("PalletCode", e, null, null, null)
          }}
          onKeyPress={(value, obj, element, event) => {
            if (event.key === "Enter") {
              onHandleChangeInputPalletCode("PalletCode", value, obj, element, event)
            }

          }}
        />
      case 3:
        var dataLoc = null;
        if (valueInput !== undefined) {
          if (valueInput.areaID !== undefined) {
            const AreaLocationMasterQuery = {
              queryString: window.apipath + "/v2/SelectDataMstAPI/",
              t: "AreaLocationMaster",
              q: '[{"f": "Status", "c":"=", "v": 1},{"f": "ObjectSize_ID", "c":"=", "v": 1},{"f": "AreaMaster_ID", "c":"=", "v":' + valueInput.areaID + '}]',
              f: "Code,ID as locaionID,Name",
              g: "",
              s: "[{'f':'ID','od':'asc'}]",
              sk: 0,
              l: 100,
              all: "",
            }
            dataLoc = AreaLocationMasterQuery
          }
        }
        return <div><FormInline>
          <LabelH1>Area :</LabelH1><AmDropdown
            placeholder="Select"
            fieldDataKey="areaID" //ฟิล์ดดColumn ที่ตรงกับtable ในdb 
            fieldLabel={["Name"]} //ฟิล์ดที่ต้องการเเสดงผลใน optionList และ ช่อง input
            labelPattern=" : " //สัญลักษณ์ที่ต้องการขั้นระหว่างฟิล์ด
            ddlMinWidth={300} //กำหนดความกว้างของกล่อง dropdown
            queryApi={AreaMasterQuery()}
            defaultValue={valueInput !== undefined ? valueInput.areaID === undefined ? null : valueInput.areaID : null}
            onChange={(value, dataObject, inputID, fieldDataKey) => onHandleChangeInput(value, dataObject, inputID, fieldDataKey)}
            ddlType={"search"} //รูปแบบ Dropdown 
          />
        </FormInline>
          <FormInline>
            <LabelH1>AreaLocation :</LabelH1>
            <AmDropdown
              placeholder="Select"
              fieldDataKey="locaionID" //ฟิล์ดดColumn ที่ตรงกับtable ในdb 
              fieldLabel={["Name"]} //ฟิล์ดที่ต้องการเเสดงผลใน optionList และ ช่อง input
              labelPattern=" : " //สัญลักษณ์ที่ต้องการขั้นระหว่างฟิล์ด
              ddlMinWidth={300} //กำหนดความกว้างของกล่อง dropdown
              queryApi={dataLoc !== null && dataLoc !== undefined ? dataLoc : areaLocationMasterQuery}
              defaultValue={valueInput !== undefined ? valueInput.locaionID === undefined ? null : valueInput.locaionID : null}
              onChange={(value, dataObject, inputID, fieldDataKey) => onHandleChangeInput(value, dataObject, inputID, fieldDataKey)}
              ddlType={"search"} //รูปแบบ Dropdown 
            />
          </FormInline></div>
      case 4:
        let treeItems = [];
        {
          data.stoItems.map((sto, idx) => {
            let pstoCode = sto.pstoCode != null ? sto.pstoCode : "";
            let pstoName = sto.pstoName != null ? sto.pstoName : "";
            let lot = sto.lot != null && sto.lot.length > 0 ?
              <Typography variant="body2" className={classes.labelText} noWrap>{"Lot:" + sto.lot}</Typography>
              : sto.ref1 != null && sto.ref1.length > 0 ?
                <Typography variant="body2" className={classes.labelText} noWrap>{"Lot Vendor:" + sto.ref1}</Typography>
                : null;
            let batch = sto.batch != null && sto.batch.length > 0 ?
              <Typography variant="body2" className={classes.labelText} noWrap>{"Batch:" + sto.batch}</Typography>
              : null;
            let orderNo = sto.orderNo != null && sto.orderNo.length > 0 ?
              <Typography variant="body2" className={classes.labelText} noWrap>{"Order No." + sto.orderNo}</Typography>
              : null;
            let cartonNo = sto.cartonNo != null && sto.cartonNo.length > 0 ?
              <Typography variant="body2" className={classes.labelText} noWrap>{"Carton No." + sto.cartonNo}</Typography>
              : null;

            let pk_docCode = sto.pk_docCode != null ?
              <Typography variant="body2" className={classes.labelText} noWrap>{"Document Code: " + sto.pk_docCode}</Typography>
              : null;
            let processTypeName = sto.processTypeName != null ?
              <Typography variant="body2" className={classes.labelText} noWrap>{"Process No." + sto.processTypeName}</Typography>
              : null;
            let pickQty = sto.pickQty != null ?
              <Typography variant="body2" className={classes.labelText} noWrap>{"Quantity: " + sto.pickQty + " " + sto.unitCode}</Typography>
              : null;
            let destination = sto.destination != null ?
              <Typography variant="body2" className={classes.labelText} noWrap>{"Des:" + sto.destination}</Typography>
              : null;
            let remark = sto.remark != null ?
              <Typography variant="body2" className={classes.labelText} noWrap>{"Remark:" + sto.remark}</Typography>
              : null;

            let treeItem = {
              nodeId: sto.distoID.toString(),
              labelText:
                <div className={classes.textNowrap}>
                  <Typography variant="body2" className={classes.labelText} noWrap>
                    <span className={classes.labelHead}>{pstoCode}</span>
                            &nbsp;{"- " + pstoName}
                  </Typography>
                  {pickQty}
                  {lot}{batch}{orderNo}{cartonNo}{pk_docCode}{processTypeName}{destination}{remark}{auditstatus}
                </div>,
              labelIcon: ShoppingCartIcon,
              // labelInfo: pickQty,
              bgColor: "#e8f0fe",
              color: "#1a73e8",
              dataItem: sto,
              onIconClick: (dataItem) => onClick(dataItem),
              onLabelClick: (dataItem) => onClick(dataItem)
            };

            treeItems.push(treeItem);
          })


        }
        let dataTreeItems = [{
          nodeId: 'root',
          labelText: data.bstoCode,
          // labelIcon: Pallet,
          treeItems: treeItems
        }];
        return (
          <div>
            { dataPallet !== undefined && dataPallet !== null ? (
              <AmTreeView dataTreeItems={dataTreeItems} defaultExpanded={["root"]} />
              // <TreeView
              //   className={classes.root}
              //   defaultExpanded={['1']}
              //   defaultCollapseIcon={<MinusSquare />}
              //   defaultExpandIcon={<PlusSquare />}
              //   defaultEndIcon={dataPallet.bsto.mapstos === null ? <MinusSquare /> : <EditIcon />}
              //   // selected={selected}
              //   onNodeSelect={handleSelect}
              // >

              //   <StyledTreeItem nodeId="1" label={dataPallet.bsto.code}>
              //     {dataPallet.bsto.mapstos === null ? null : dataPallet.bsto.mapstos.map((x, index) => {
              //       return (
              //         <div key={index} syle={{ marginLeft: "30px" }} >
              //           <StyledTreeItem
              //             nodeId={x.id}
              //             label={
              //               x.code + " | " +
              //               x.baseQty + " " +
              //               x.unitCode + " | " +
              //               (x.lot === null ? "" : x.lot)}
              //           />
              //         </div>
              //       );
              //     })}

              //   </StyledTreeItem>
              // </TreeView>

            ) :
              (valueInput.palletCode !== undefined ? <TreeView
                className={classes.root}
                defaultExpanded={['1']}
                defaultCollapseIcon={<MinusSquare />}
                defaultExpandIcon={<PlusSquare />}
                defaultEndIcon={dataPallet.bsto.mapstos === null ? <MinusSquare /> : <EditIcon />}
                // selected={selected}
                onNodeSelect={handleSelect}
              >
                <StyledTreeItem nodeId="1" label={valueInput.palletCode}>
                </StyledTreeItem>
              </TreeView> : null)}

            <FormInline>
              <Switch
                checked={checkedAuto}
                onChange={handleChange}
                color="primary"
                name="checkedAuto"
                inputProps={{ 'aria-label': 'primary checkbox' }}
              />
              <LabelH1>{"Scan barcode"}</LabelH1>
            </FormInline>

            {checkedAuto === true ? <Card>
              <CardContent>
                <div>
                  <AmInput
                    id={"barcode"}
                    placeholder="barcode"
                    type="input"
                    style={{ width: "100%" }}
                    onChange={(value, obj, element, event) =>
                      onHandleChangeInput(value, null, "barcode", null, event)
                    }
                    onBlur={(e) => {
                      if (e !== undefined && e !== null)
                        onHandleChangeInputPalletCode("barcode", e, null, null, null)
                    }}
                    onKeyPress={(value, obj, element, event) => {
                      if (event.key === "Enter") {
                        onHandleChangeInputPalletCode("barcode", value, obj, element, event)
                      }

                    }}
                  />
                </div>
              </CardContent>
            </Card> : <Card>
                <CardContent>
                  <div>
                    {props.columnsManual === null ? null : props.columnsManual.map((x, index) => {
                      return (
                        <div key={index} syle={{ marginLeft: "30px" }} >
                          {FuncSetEleManual(x)}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>}

          </div>)


      case 5:
        if (checkedAuto) {
          if (dataDoc !== undefined && dataDoc !== null) {
            return (<div>
              {DataGenerateEleDocDisplay(dataDoc)}
            </div>)
          }
        } else {
          return (<div>
            {DataGenerateEleManaulDisplay(valueManual, props.columnsManual)}
          </div>)
        }


      default:
        return "Unknown step";
    }
  }
  function getData(type, edit) {
    let postdata = {
      processType: valueInput.processType,
      bstoCode: valueInput.PalletCode,
      warehouseID: valueInput.warehouseID,
      areaID: valueInput.areaID,
      locationID: null,
      pstos: []
    };
    if (edit === "edit") {
      var mapstosSelected = dataPallet.bsto.mapstos.filter(x => x.id === selected)


      if (mapstosSelected !== undefined && mapstosSelected !== null) {
        console.log(valueInput.editQty)
        console.log(mapstosSelected)
        mapstosSelected[0].addQty = valueInput.editQty
        postdata = GenMapstosSelected(postdata, mapstosSelected)
      }
    } else {
      if (checkedAuto) {
        if (dataDoc !== undefined && dataDoc !== null) {
          dataDoc.datas.forEach(element => {
            postdata.pstos.push(element)
          });
        }
      } else {
        if (activeStep !== 3) {
          postdata = genDataManual(postdata, valueManual, props.columnsManual)
          props.columnsManual.forEach(x => {
            valueManual[x.field] = null
          })
        }
      }

    }
    Axios.post(window.apipath + "/v2/scan_mapping_sto", postdata).then(res => {
      if (res.data._result.status === 1) {
        if (res.data.bsto !== undefined) {
          setDataPallet(res.data)
          if (type === "confirm") {
            alertDialogRenderer("Success", "success", true);
            setActiveStep(4);
            setFlagConfirm(true)
          }
        }
        setDialog(false)
      } else {
        if (dataDoc !== undefined && dataDoc !== null) {
          var dataDocTmp = (dataDoc.datas = null);
          setDataDoc(dataDocTmp)
        }
        alertDialogRenderer(res.data._result.message, "error", true);
      }
    })
  }

  function getDataDocByPallet() {
    Axios.get(window.apipath + `/v2/GetDocByQRCodeAPI?qr=${valueInput.barcode}`).then(res => {
      if (res.data._result.status === 1) {
        setDataDoc(res.data)
      } else {
        alertDialogRenderer(res.data._result.message, "error", true);
      }

    })
  }
  const handleNext = index => {
    if (index === 0) {
      setFlagConfirm(false)

      if (valueInput["warehouseID"] === undefined)
        valueInput["warehouseID"] = warehouseID

      setActiveStep(prevActiveStep => prevActiveStep + 1);
    } else if (index === 1) {
      setFlagConfirm(false)
      if (valueInput.processType) {
        setActiveStep(prevActiveStep => prevActiveStep + 1);
      }
      else {
        alertDialogRenderer("ProcessType must be value", "error", true);
      }
    } else if (index === 2) {
      setFlagConfirm(false)
      if (valueInput.PalletCode) {
        setActiveStep(prevActiveStep => prevActiveStep + 1);
      }
      else {
        alertDialogRenderer("PalletCode must be value", "error", true);
      }

    } else if (index === 3) {
      setFlagConfirm(false)
      setCheckedAuto(true)
      if (valueInput.areaID) {
        getData()
        setActiveStep(prevActiveStep => prevActiveStep + 1);
      }
      else {
        alertDialogRenderer("Area must be value", "error", true);
      }

    } else if (index === 4) {
      if (valueInput.barcode) {
        getDataDocByPallet()
        setActiveStep(prevActiveStep => prevActiveStep + 1);
      }
      else {
        if (checkedAuto) {
          alertDialogRenderer("Barcode must be value", "error", true);
        } else {
          //getData()

          setActiveStep(prevActiveStep => prevActiveStep + 1);
        }

      }

    }
  };

  function handleReset() {

    valueInput.warehouseID = null
    valueInput.processType = null
    valueInput.areaID = null
    valueInput.PalletCode = null
    valueInput.AreaLocationMaster_ID = null
    setActiveStep(0);
    // setValueInput({});
    // setValueManual({});
    setFlagConfirm(false)
    setCheckedAuto(true)
    //setValueInput()
  }
  function handleBack() {
    setDataDoc(null)
    setActiveStep(activeStep - 1);
  }
  const RanderEle = () => {
    if (dataPallet) {
      const columns = props.columnsEdit
      return columns.map(y => {
        return {
          component: (data, cols, key) => {
            {
              var mapstosSelected = dataPallet.bsto.mapstos.filter(x => x.id === selected)
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
                        onBlur={(e) => {
                          console.log("dsfusygfe")
                          if (e !== undefined && e !== null)
                            onHandleChangeInputPalletCode("editQty", e, null, null, null)
                        }}
                        onKeyPress={(value, obj, element, event) => {
                          console.log("dsfusygfe")
                          if (event.key === "Enter") {
                            onHandleChangeInputPalletCode("editQty", value, obj, element, event)
                          }

                        }}
                        onChange={(value, obj, element, event) =>
                          onHandleChangeInput(value, null, "editQty", null, event)
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
  const onHandledataConfirm = (status, rowdata) => {
    if (status) {
      getData(null, "edit")
    } else {
      setDialog(false)
    }

  }
  return (
    <div className={classes.root}>
      <AmEditorTable
        open={dialog}
        onAccept={(status, rowdata) => onHandledataConfirm(status, rowdata)}
        titleText={"Edit"}
        data={dataPallet !== undefined ? dataPallet.bsto : []}
        columns={RanderEle()}
      />
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
                <div className={classes.actionsContainer}>
                  <div>
                    {activeStep == 0 ? null : (
                      <AmButton
                        styleType="delete_clear"
                        // onClick={handleReset}
                        onClick={handleBack}

                        className={classes.button}
                      >
                        {/* {t("Clear")} */}
                        {t("Back")}
                      </AmButton>
                    )}{flagConfirm === true ? <AmButton
                      styleType="delete_clear"
                      onClick={handleReset}
                      className={classes.button}
                    >
                      {t("Clear")}
                    </AmButton> : null}
                    {activeStep === steps.length - 1 ? (
                      <AmButton
                        styleType="confirm"
                        onClick={() => {
                          // onPutdata();
                          getData("confirm")
                        }}
                        className={classes.button}
                      >
                        {t("Confirm")}
                      </AmButton>
                    ) : (
                        <AmButton
                          styleType="confirm"
                          onClick={() => handleNext(index)}
                          className={classes.button}
                        >
                          {t("Next")}
                        </AmButton>
                      )}
                  </div>
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

export default withStyles(styles)(AmMappingPallet);
