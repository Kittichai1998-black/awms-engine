import React, { useState, createRef, useEffect, useRef } from "react";
import {
  apicall,
  createQueryString,
  Clone,
  IsEmptyObject
} from "../../../components/function/CoreFunction";
import AmDialogs from "../../../components/AmDialogs";
import AmButton from "../../../components/AmButton";
import AmInput from "../../../components/AmInput";
import Paper from "@material-ui/core/Paper";
import _ from "lodash";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import styled from "styled-components";
import queryString from "query-string";
import { useTranslation } from "react-i18next";
import { editorListcolunm } from '../../../components/table/AmGennarateFormForEditorTable'
import { fade, makeStyles, withStyles } from '@material-ui/core/styles';
import * as signalR from '@aspnet/signalr';
import Grid from '@material-ui/core/Grid';
import ModalForm from '../../../components/table/AmEditorTable'
import DeleteIcon from '@material-ui/icons/Delete';
import Edit from '@material-ui/icons/Edit';
import CheckCircle from '@material-ui/icons/CheckCircle';
import IconButton from "@material-ui/core/IconButton";
import Tooltip from '@material-ui/core/Tooltip';
import AmDocumentStatus from "../../../components/AmDocumentStatus";
import AuditStatusIcon from "../../../components/AmAuditStatus";
import AmDropdown from '../../../components/AmDropdown';
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
  width: 115px;
  paddingleft: 20px;
`;

const LabelH1 = styled.label`
  font-weight: bold;
  width: 100%;
 
`;



const AmManualCreateDoc = props => {
  const WarehouseQuery = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "Warehouse",
    q: '[{ "f": "Status", "c":"=", "v": 1}]',
    f: "ID as warehouseID,Name,Code",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: "",
  }


  const { t } = useTranslation();
  const { classes } = props;

  const [valueInput, setValueInput] = useState({});
  const inputScan = useRef()
  const [qrcode, setqrcode] = useState()
  const [count, setCount] = useState(0);
  const [data, setData] = useState();
  const [dataModal, setDataModal] = useState({})
  const [toggleModal, setToggleModal] = useState(false)
  const [inputError, setInputError] = useState([])
  const [dialogState, setDialogState] = useState({});
  const [autoFocus, setAutoFocus] = useState(true)
  const [dialog, setDialog] = useState(false);
  const [last, setLast] = useState("");
  const [docItemID, setDocItemID] = useState();
  //============================================================================
  useEffect(() => {
    if (count > 0) {
      window.loading.onLoaded();
    } else {
      window.loading.onLoading();
    }
  }, [count])

  useEffect(() => {
    // console.log(dashboard)
    let url = window.apipath + '/dashboard'
    let connection = new signalR.HubConnectionBuilder()
      .withUrl(url, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .build();

    const signalrStart = () => {
      connection.start()
        .then(() => {
          //console.log(valueInput["warehouseID"])
          connection.on(props.doctype === 1011 ? 'DASHBOARD_DOC_GR' : 'DASHBOARD_DOC_GI', res => {
            setCount(count + 1);
            var dataFilter = JSON.parse(res).filter(x => x.Des_Warehouse_ID === (valueInput["warehouseID"] === undefined ? 1 : valueInput["warehouseID"]))

            if (valueInput["bagging"] !== undefined && valueInput["bagging"] !== "") {
              // console.log(valueInput["bagging"])
              dataFilter = dataFilter.filter(x => x.Ref2 === valueInput["bagging"])
            }

            //console.log(JSON.parse(res))
            setData(dataFilter)
          })
        })
        .catch((err) => {
          setTimeout(() => signalrStart(), 5000);
        })
    };

    connection.onclose((err) => {

      if (err) {
        signalrStart()
      }
    });

    signalrStart()

    return () => {
      connection.stop()
    }

  }, [localStorage.getItem('Lang')])



  const ref = useRef(props.columnEdit.map(() => createRef()))
  const onHandleChangeInput = (keydata, value) => {

    valueInput[keydata] = value;
    //console.log(valueInput["warehouseID"])
  }


  const onScan = (datas) => {
    // console.log(datas)
    // console.log(datas.split("|").length)
    let list = [];
    if (props.doctype === 1011) {
      if (datas && datas.split("|").length === 12) {
        var start_pallet = parseInt(datas.split("|")[5].trim());
        var end_pallet = parseInt(datas.split("|")[6].trim());
        for (var i = start_pallet; i <= end_pallet; i++) {
          list.push(datas.split("|")[4].trim() + " " + datas.split("|")[2].trim() + " " + i.toString().padStart(4, '0'))
        }

        //console.log(list)
        const LINE = {
          doc_wms: datas.split("|")[0].trim(),
          customer: datas.split("|")[1].trim(),
          grade: datas.split("|")[2].trim(),
          sku: datas.split("|")[3].trim(),
          lot: datas.split("|")[4].trim(),
          start_pallet: parseInt(datas.split("|")[5].trim()),
          end_pallet: parseInt(datas.split("|")[6].trim()),
          warehouse: datas.split("|")[7].trim(),
          qty: datas.split("|")[8].trim(),
          unit: datas.split("|")[9].trim(),
          qty_per_pallet: datas.split("|")[10].trim(),
          status: datas.split("|")[11].trim(),
          List_Pallet: list,
          api_ref: generateRandom(10)
        }
        const _postData = {
          RECORD: [{
            LINE
          }]
        }
        //console.log(_postData)
        Axios.post(window.apipath + "/v2/revieve_order", _postData).then(res => {
          if (res.data._result.status === 1) {
            setDialogState({ type: "success", content: "Success", state: true })
            var elbarcode = document.getElementById('qrcode');
            if (elbarcode !== null)
              elbarcode.value = null
            clear()
          } else {
            setDialogState({ type: "error", content: res.data._result.message, state: true })
            clear()
          }
        })
      } else {
        setDialogState({ type: "error", content: "QR Code ??????????????????????????????", state: true })
        clear()
      }
    } else {
      if (datas && datas.split("|").length === 10) {
        const LINE = {
          doc_wms: datas.split("|")[0].trim(),
          customer: datas.split("|")[1].trim(),
          grade: datas.split("|")[2].trim(),
          sku: datas.split("|")[3].trim(),
          lot: datas.split("|")[4].trim(),
          warehouse: datas.split("|")[5].trim(),
          staging: datas.split("|")[6].trim(),
          qty: datas.split("|")[7].trim(),
          unit: datas.split("|")[8].trim(),
          status: datas.split("|")[9].trim(),
          List_Pallet: [],
          api_ref: generateRandom(10)
        }
        const _postData = {
          RECORD: [{
            LINE
          }]
        }
        Axios.post(window.apipath + "/v2/issue_order", _postData).then(res => {
          if (res.data._result.status === 1) {
            setDialogState({ type: "success", content: "Success", state: true })
            var elbarcode = document.getElementById('qrcode');
            if (elbarcode !== null)
              elbarcode.value = null
            clear()
          } else {
            setDialogState({ type: "error", content: res.data._result.message, state: true })
            clear()
          }
        })
      } else {
        setDialogState({ type: "error", content: "QR Code ??????????????????????????????", state: true })
        clear()
      }
    }

  }
  const generateRandom = (length) => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  const onChangeEditor = (field, data, required, row) => {
    if (typeof data === "object" && data) {
      dataModal[field] = data[field] ? data[field] : data.value
    } else if (data) {
      dataModal[field] = data
    } else {
      delete dataModal[field]
    }

    if (row && row.related && row.related.length) {
      let indexField = row.related.reduce((obj, x) => {
        obj[x] = props.columnEdit.findIndex(y => y.accessor === x)
        return obj
      }, {})
      for (let [key, index] of Object.entries(indexField)) {
        if (data) {
          dataModal[key] = data[key]
        } else {
          delete dataModal[key]
        }

        if (index !== -1) {
          if (data) {
            if (ref.current[index].current.value)
              ref.current[index].current.value = data[key]
          } else {
            //ref.current[index].current.value = ""
          }
        }
      }
    }
    if (row && row.removeRelated && row.removeRelated.length && dataModal.packID_map_skuID && (+dataModal.packID_map_skuID.split('-')[0] !== +dataModal.packID || +dataModal.packID_map_skuID.split('-')[1] !== +dataModal.skuID)) {
      row.removeRelated.forEach(x => delete dataModal[x])
    }

    if (required) {
      // console.log(required);
      if (!dataModal[field]) {
        const arrNew = [...new Set([...inputError, field])]
        setInputError(arrNew)
      } else {
        const arrNew = [...inputError]
        const index = arrNew.indexOf(field);
        if (index > -1) {
          arrNew.splice(index, 1);
        }
        setInputError(arrNew)
      }
    }

  }
  const onHandleEditConfirm = (status, rowdata, inputErr) => {
    if (status) {
      if (!inputErr.length) {
        const arr = []
        props.columnQR.forEach(x => {
          arr.push(rowdata[x.accessor])
        })
        onScan(arr.join("|"))
        setToggleModal(false)
      } else {
        setInputError(inputErr.map(x => x.accessor))
      }
    } else {
      setToggleModal(false)
    }
  }

  const onHandleDelete = (docCode) => {
    let postdata = {
      documentCode: docCode
    };
    Axios.post(window.apipath + "/v2/delect_doc", postdata).then(res => {
      if (res.data._result.status === 1) {
        setDialogState({ type: "success", content: "Success", state: true })
        clear()
      } else {
        setDialogState({ type: "error", content: res.data._result.message, state: true })
        clear()
      }
    })


  }
  const onHandleUpdate = () => {
    // console.log(docCode)
    let postdata = {
      docItemID: docItemID,
      lastPallet: last
    };
    Axios.post(window.apipath + "/v2/update_last_pallet", postdata).then(res => {
      if (res.data._result.status === 1) {
        setDialogState({ type: "success", content: "Success", state: true })
        clear()
      } else {
        setDialogState({ type: "error", content: res.data._result.message, state: true })
        clear()
      }
    })

  }
  const onHandleClose = (doc) => {
    //console.log(doc)
    let postdata = {
      documentCode: doc,

    };

    Axios.post(window.apipath + "/v2/closed_document_manual_bycode", postdata).then(res => {
      if (res.data._result.status === 1) {
        setDialogState({ type: "success", content: "Success", state: true })
        clear()
      } else {
        setDialogState({ type: "error", content: res.data._result.message, state: true })
        clear()
      }
    })
  }
  const generateCard = (datas) => {
    if (datas != undefined) {
      //console.log(datas)
      var groupDocument = _.groupBy(datas, "DocumentParentCode");
      var groupDocumentArr = []
      for (let indexName in groupDocument) {
        groupDocumentArr.push(indexName)
      }
      //==========================================================================

      return groupDocumentArr.map((x, index) => {
        //console.log(x)
        // setDocItemID(x)
        return <Card style={{ width: "100%", marginTop: "10px", padding: "0px", border: "solid", borderWidth: "thin" }}>
          < CardContent style={{ paddingBottom: "0px" }}>
            <AmDocumentStatus statusCode={groupDocument[x][0].EventStatus} />
            <label style={{ fontWeight: "bold", paddingRight: "5px", fontSize: "15px" }}>{x}</label>
            <label style={{ fontWeight: "bold", paddingRight: "5px", fontSize: "15px" }}>{props.doctype === 1011 ? ("Bagging : " + groupDocument[x][0].Ref2 + " | ") : ("Do. : " + groupDocument[x][0].Ref2 + " | ")}</label>
            <label style={{ fontWeight: "bold", paddingRight: "5px", fontSize: "15px" }}>{"SKU : " + groupDocument[x][0].SKUCode + " | "}</label>
            <label style={{ fontWeight: "bold", paddingRight: "5px", fontSize: "15px" }}>{"Grade : " + groupDocument[x][0].Ref1 + " | "}</label>
            <label style={{ fontWeight: "bold", paddingRight: "5px", fontSize: "15px" }}>{"Lot : " + groupDocument[x][0].Lot + " | "}</label>
            <label style={{ fontWeight: "bold", paddingRight: "5px", fontSize: "15px" }}>{
              props.doctype === 1011 ? (queryString.parse(groupDocument[x][0].Options)["qty"] + " " + groupDocument[x][0].UnitCode) : groupDocument[x][0].Qty
            }</label>

            {props.delete === true ? <Tooltip title="Delete">
              <IconButton size="small" aria-label="info" style={{ marginTop: "5px", float: "right" }}>
                <DeleteIcon fontSize="small" style={{ color: "red" }}
                  onClick={() => { onHandleDelete(x) }}
                />
              </IconButton>
            </Tooltip> : null}
            {props.close === true ? <Tooltip title="Close">
              <IconButton size="small" aria-label="info" style={{ marginTop: "5px", float: "right" }}>
                <CheckCircle fontSize="small" style={{ color: "green" }}
                  onClick={() => { onHandleClose(x) }}
                />
              </IconButton>
            </Tooltip> : null}
            {groupDocument[x].map((y, yindex) => {
              //console.log(y)

              if (props.doctype === 1011) {
                return (<span>

                  < Grid
                    container
                    direction="row"
                    justify="flex-start"
                    alignItems="flex-start"
                  >

                    {/* <AmDocumentStatus style={{ width: "30px" }} labelShort={y.DocitemEventStatus} statusCode={y.DocitemEventStatus} /> */}
                    <Grid item xs={3} sm={2} md={2} lg={1} xl={1}>

                    </Grid>
                    <Grid item xs={3} sm={2} md={2} lg={1} xl={1}>
                      <AmDocumentStatus style={{ width: "30px" }} labelShort={y.DocitemEventStatus} statusCode={y.DocitemEventStatus} />
                    </Grid>
                    <Grid item xs={3} sm={2} md={2} lg={1} xl={1}>
                      <label style={{ fontWeight: "bold", float: "right", paddingRight: "5px" }}>Pallet : </label>
                    </Grid>
                    <Grid item xs={3} sm={2} md={2} lg={2} xl={1}>
                      <label>{y.BaseCode}</label>
                    </Grid>
                    <Grid item xs={3} sm={2} md={2} lg={1} xl={1}>
                      {/* <label style={{ fontWeight: "bold", float: "right", paddingRight: "5px" }}>Qty : </label> */}

                    </Grid>
                    <Grid item xs={3} sm={2} md={2} lg={2} xl={1}>

                      <label>{y.Quantity + " " + y.UnitCode}</label>

                    </Grid>
                    <Grid item xs={3} sm={2} md={2} lg={1} xl={1}>
                      < label style={{ fontWeight: "bold", float: "right", paddingRight: "5px" }}>Status : </label>
                    </Grid>
                    <Grid item xs={3} sm={2} md={2} lg={1} xl={1}>
                      {getAuditStatusValue(y.AuditStatus)}
                    </Grid>
                    {props.edit === true ? <Tooltip title="Update">
                      <IconButton size="small" aria-label="info" style={{ margin: "0px", float: "right" }}>
                        <Edit fontSize="small" style={{ color: "orange" }}
                          onClick={() => { setDocItemID(y.DocumentItemID); setDialog(true) }}
                        />
                      </IconButton>
                    </Tooltip> : null}
                  </Grid>

                  <hr style={{ marginTop: "0px" }} />
                </span>
                )
              } else {
                return (<span>

                  < Grid
                    container
                    direction="row"
                    justify="flex-start"
                    alignItems="flex-start"
                  >
                    <Grid item xs={3} sm={2} md={2} lg={1} xl={1}>

                    </Grid>
                    <Grid item xs={3} sm={2} md={2} lg={1} xl={1}>
                      <AmDocumentStatus style={{ width: "30px" }} labelShort={y.DocitemEventStatus} statusCode={y.DocitemEventStatus} />
                    </Grid>
                    <Grid item xs={3} sm={2} md={2} lg={1} xl={1}>
                      <label style={{ fontWeight: "bold", float: "right", paddingRight: "5px" }}>Pallet : </label>
                    </Grid>
                    <Grid item xs={3} sm={2} md={2} lg={1} xl={1}>
                      <label>{y.PalletCode}</label>
                    </Grid>

                    <Grid item xs={3} sm={2} md={2} lg={1} xl={1}>
                      <label style={{ fontWeight: "bold", float: "right", paddingRight: "5px" }}>Qty : </label>
                    </Grid>
                    <Grid item xs={3} sm={2} md={2} lg={1} xl={1}>
                      <label>{y.Qty}</label>
                    </Grid>

                    <Grid item xs={3} sm={2} md={2} lg={1} xl={1}>
                      <label style={{ fontWeight: "bold", float: "right", paddingRight: "5px" }}>Staging : </label>
                    </Grid>
                    <Grid item xs={3} sm={2} md={2} lg={1} xl={1}>
                      <label>{y.Ref3}</label>
                    </Grid>
                    <Grid item xs={3} sm={2} md={2} lg={1} xl={1}>
                      <label style={{ fontWeight: "bold", float: "right", paddingRight: "5px" }}>Status : </label>
                    </Grid>
                    <Grid item xs={3} sm={2} md={2} lg={1} xl={1}>
                      {getAuditStatusValue(y.AuditStatus)}
                    </Grid>
                  </Grid>
                  <hr style={{ marginTop: "0px" }} />
                </span>
                )

              }


            })}
          </CardContent>
        </Card >
      })
    }
  }
  const onHandleUpdateLastConfirm = (status) => {

    if (status) {
      onHandleUpdate()
    }
    setDialog(false);
  };
  const DataGenerateLast = () => {
    const columns = [
      {
        field: "Option",
        type: "input",
        name: "Update Qty",
        placeholder: "Update Qty",
        required: true
      }
    ];
    return columns.map(y => {
      return {
        field: y.field,
        component: (data = null, cols, key) => {
          return (
            <div key={key}>
              <FormInline>
                {" "}
                <LabelH style={{ width: "100px" }}>{"Update Qty"} : </LabelH>
                <InputDiv>
                  <AmInput
                    id={cols.field}
                    type="number"
                    style={{ width: "270px", margin: "0px" }}
                    onChange={val => {
                      setLast(val);
                    }}
                  />
                </InputDiv>
              </FormInline>

            </div>
          );
        }
      };
    });
  };

  const getAuditStatusValue = Status => {
    if (Status != undefined) {
      return <AuditStatusIcon style={{ width: "50px" }} key={Status} statusCode={Status} />
    }

  }

  const clear = () => {
    setDataModal({})
    setAutoFocus(true)
    setqrcode()
    setLast("")
    setDocItemID()
    setValueInput({})
  }

  return (
    <>
      <AmDialogs
        typePopup={dialogState.type}
        onAccept={(e) => { setDialogState({ ...dialogState, state: false }) }}
        open={dialogState.state}
        content={dialogState.content} />
      <ModalForm
        style={{ width: "600px", height: "500px" }}
        titleText="Add Manual"
        textConfirm="Add"
        open={toggleModal}
        onAccept={(status, rowdata, inputErr) => onHandleEditConfirm(status, rowdata, inputErr)}
        data={dataModal}
        objColumnsAndFieldCheck={{ objColumn: props.columnEdit, fieldCheck: "accessor" }}
        columns={editorListcolunm(props.columnEdit, ref, inputError, dataModal, onChangeEditor)}
      />
      <ModalForm
        open={dialog}
        onAccept={(status, rowdata) => onHandleUpdateLastConfirm(status)}
        titleText={"Update Qty"}
        textConfirm="Confirm"
        data={"text"}
        columns={DataGenerateLast()}
      />
      <Paper >
        <Grid container spacing={3}>
          <Grid item xs={12}>

            <FormInline>
              <LabelH style={{ marginLeft: "5px", fontSize: "18px" }}>  {t("Warehouse")}</LabelH>
              <AmDropdown
                id={"id"}
                placeholder={"warehouse"}
                fieldDataKey={"warehouseID"}
                fieldLabel={["Code"]}
                labelPattern=" : "
                width={200}
                ddlMinWidth={200}

                defaultValue={1}
                zIndex={1000}
                queryApi={WarehouseQuery}
                onChange={(value, dataObject, inputID, fieldDataKey) => onHandleChangeInput(fieldDataKey, value)}
              />
            </FormInline>
            <LabelH style={{ marginLeft: "5px", fontSize: "18px" }}>  {props.doctype === 1011 ? t("Bagging") : t("Do")}</LabelH>
            <AmInput
              id={"bagging "}
              autoFocus={autoFocus}
              style={{ width: "200px" }}
              inputRef={inputScan}
              onChange={(value) => setqrcode(value)}
              onKeyPress={(value, obj, element, event) => {
                if (event.key === "Enter") {
                  onHandleChangeInput("bagging", value)
                }
              }}
            />
          </Grid>
        </Grid>

        <Grid container spacing={3} style={{ marginTop: "10px" }}>

          <Grid item xs={2.5} style={{ paddingRight: "0px" }}>
            <LabelH1 style={{ marginLeft: "5px", fontSize: "18px" }}>  {t("QR Product")}</LabelH1>

          </Grid>
          <Grid item xs={4}>
            <AmInput
              id={"qrcode"}
              autoFocus={autoFocus}
              style={{ width: "100%" }}
              inputRef={inputScan}
              onChange={(value) => setqrcode(value)}
              onKeyPress={(value, obj, element, event) => {
                if (event.key === "Enter") {
                  setqrcode(value)
                  onScan(qrcode)
                }
              }}
            />
          </Grid>
          <Grid item xs={5.5}>
            <AmButton
              style={{ marginRight: "5px" }}
              styleType="confirm"
              onClick={() => onScan(qrcode)}
            >
              {t("Scan")}
            </AmButton>
            <AmButton
              styleType="add"
              onClick={() => setToggleModal(true)}
            >
              {t("Manual")}
            </AmButton>

          </Grid>

          {generateCard(data)}
        </Grid>
      </Paper>
    </>
  );
};

export default withStyles(styles)(AmManualCreateDoc);
