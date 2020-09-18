import _ from "lodash";
import queryString from "query-string";
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import {
  apicall,
  createQueryString, IsEmptyObject
} from "../../../components/function/CoreFunction";
import AmButton from "../../../components/AmButton";
import AmInput from "../../../components/AmInput";
import AmEditorTable from "../../../components/table/AmEditorTable";
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import AmDialogs from "../../../components/AmDialogs";
import Card from "@material-ui/core/Card";
import AmTable from "../../../components/AmTable/AmTable";
import CardContent from "@material-ui/core/CardContent";
import { SkipNext, PlaylistArrowPlay, DeleteSweep } from "./IconTreeview";
import { LoadDataPDF } from "./GendataPDF";
import { DeletePallet } from "./DeletePallet";
import DeleteIcon from "@material-ui/icons/Delete";
import Clone from "../../../components/function/Clone";
import Checkbox from "@material-ui/core/Checkbox";
import IconButton from "@material-ui/core/IconButton";


const Axios = new apicall();
const LabelHText = styled.label`
  width: 60px;
`;
const LabelH = styled.label`
  font-weight: bold;
  
`;
const LabelD = styled.label`
font-size: 10px
  width: 50px;
`;
const InputDiv = styled.div``;
const FormInline = styled.div`

  display: flex;
  flex-flow: row wrap;
  align-items: center;
  label {
    margin: 5px 0 5px 0;
    margin-left: 2px;
  }
  input {
    vertical-align: middle;
  }
  @media (max-width: 800px) {
    flex-direction: column;
    align-items: stretch;
  }
`;
const CheckboxCustom = withStyles({
  root: {
    padding: "0 !important",
    marginRight: "5px"
  },

})(Checkbox);
const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
}));

const AmPrintBarCodeV2 = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [dialogState, setDialogState] = useState({});
  const [dialog, setDialog] = useState(false);
  const [selection, setSelection] = useState([]);
  const [iniData, setIniData] = useState();
  const [elePallet, setElePallet] = useState();
  const [numCount, setNumCount] = useState(1);
  const [itemList, setItemList] = useState({});
  const [itemIni, setItemIni] = useState();
  const [totalPallet, setTotalPallet] = useState(0);


  useEffect(() => {

    setIniData(Clone(props.data))
  }, [props.data])

  useEffect(() => {

    setDialog(props.open)
  }, [props.open])

  const columns = [
    {
      Header: "Item",
      accessor: "SKUMaster_Code",
      width: 60
    },
    {
      Header: "Lot",
      accessor: "Lot",
      width: 60,
    }, {
      Header: "Qty",
      accessor: "BaseQuantity",
      width: 30,
      // Cell: e => getQtyItem(e.original)
    }, {
      Header: "Unit",
      accessor: "UnitType_Code",
      width: 30
    }]

  const onHandledataConfirm = (status, rowdata) => {
    if (status) {
      if (!IsEmptyObject(itemList)) {
        onClickLoadPDF(itemList)
      } else {
        setDialogState({ type: "warning", content: "ยังไม่ได้ Generate ข้อมูล Pallet", state: true })
      }

    } else {
      setDialog(false)
      props.onClose(false)
      Clear()
    }

  }

  const onClickLoadPDF = async (itemList) => {
    var data = LoadDataPDF(itemList, props.SouSupplierName, props.SouSupplierCode, totalPallet, props.Remark, props.docID)
    try {

      await Axios.postload(window.apipath + "/v2/download/print_tag_code", data, "printcode.pdf").then();
      setDialog(false)
      setDialogState({ type: "success", content: "Success", state: true })
      Clear()
      props.onClose(false)
    } catch (err) {
      setDialogState({ type: "error", content: err.message, state: true })
      Clear()
      props.onClose(false)
    }
  }
  const onClickDeletePallet = (item, listDatas, indexName) => {
    listDatas[indexName].forEach(dt => {
      var list = iniData.find(x => x.ID === dt.ID)
      if (list !== undefined) {
        list.Quantity = list.Quantity + parseInt(dt.Quantity_Genarate)
      }
    });
    delete listDatas[indexName]
    let newObj = {}
    let i = 1
    for (var item in listDatas) {
      newObj[i] = listDatas[item]
      i++;
    }
    setElePallet(RanderEleListPallet(newObj, "del", i))
  }
  const onNextSkip = () => {
    var datax = []
    var n = Object.keys(itemList).length
    var Quantity_s = 0
    var Quantity_t = 0
    let selecx = selection.filter(y => y.Quantity !== 0)
    if (selection.length !== 0) {
      var ck = selecx.find(x => x.Quantity - x.Quantity_Genarate < 0)
      if (ck === undefined) {
        selecx.forEach(selec => {

          var selectionData = iniData.find(x => x.ID === selec.ID)
          if (selectionData !== undefined) {
            Quantity_s = selectionData.Quantity % parseInt(selectionData.Quantity_Genarate)
            Quantity_t = selectionData.Quantity / parseInt(selectionData.Quantity_Genarate)
            let num_r = Quantity_s === 0 ? Math.floor(Quantity_t) : (Math.floor(Quantity_t) + 1)
            selectionData.Quantity = 0

            for (var i = 0; i < num_r; i++) {
              datax.push([selectionData])
            }
          }
          let temp = Clone(datax)
          if (Quantity_s !== 0
          ) temp[temp.length - 1][0].Quantity_Genarate = Quantity_s

          datax = temp
        });
        datax.forEach(x => {
          itemList[n + 1] = x
          n++
        })

        setElePallet(RanderEleListPallet(itemList, "addList", null, n))

        setIniData([...iniData])
      } else {
        setDialogState({ type: "warning", content: "จำนวนสินค้าที่เลือกมากกว่าจำนวนสินค้าที่จะรับเข้า", state: true })
        setIniData([...iniData])
      }

    } else {
      setDialogState({ type: "warning", content: "กรุณาเลือกข้อมูล", state: true })
    }
    return null
  }


  const onGenBarcode = () => {
    if (selection.length !== 0) {
      let selecx = selection.filter(y => y.Quantity !== 0)
      var ck = selecx.find(x => (x.Quantity - x.Quantity_Genarate) < 0)
      if (ck === undefined) {
        setElePallet(RanderEleListPallet(selecx, "add"))
        selecx.forEach(selec => {
          var selectionData = iniData.find(x => x.ID === selec.ID)
          if (selectionData !== undefined) {
            let genQty = selectionData["Quantity_Genarate"] !== undefined ? selectionData["Quantity_Genarate"] : 0
            selectionData.Quantity = selectionData.Quantity - genQty
          }
        });
        setIniData([...iniData])
      } else {
        setDialogState({ type: "warning", content: "จำนวนสินค้าที่เลือกมากกว่าจำนวนสินค้าที่จะรับเข้า", state: true })
        setIniData([...iniData])
      }

    } else {
      setDialogState({ type: "warning", content: "กรุณาเลือกข้อมูล", state: true })
    }
  }

  const getQtyItem = (e) => {
    return (<div><AmInput
      id={e.ID + "_qty"}
      style={{ width: "50px", margin: "0px", paddingLeft: "10px" }}
      disabled={e["Quantity"] === 0 ? true : false}
      type={"input"}
      defaultValue={e["SKUMaster_Info1"] ? e["SKUMaster_Info1"] : ""}
      onChange={(value, dataObject, inputID, fieldDataKey) =>
        e["Quantity_Genarate"] = parseInt(value)
      }
    /></div >)
  }

  //==================================================================================
  const RanderEleListPallet = (item, type, i, numlist) => {
    var xx = Clone(item)
    let listDatas = {}
    if (type === "add") {
      listDatas = { ...itemList, [numCount]: xx };
      setNumCount(numCount + 1)
    } else if (type === "del") {
      listDatas = item
      setNumCount(i)
      i--
    } else if (type === "addList") {
      listDatas = item
      setNumCount(numlist + 1)

      i = numlist

    }
    setItemList(listDatas)

    setTotalPallet(type === "add" ? numCount : i)
    let e = []
    for (let indexName in listDatas) {

      e.push(<div style={{ paddingBottom: "5px" }}>
        <Paper className={classes.paper}
          style={{
            padding: "0px",
            textAlign: "left",

          }} >
          <FormInline >
            <Grid container spacing={5}>

              <Grid item xs={4}>
                <LabelH style={{ paddingRight: "2px", width: "100px" }}>
                  {"Pallet No.:"}{indexName + "/" + (type === "add" ? numCount : i)}
                </LabelH>
              </Grid>
              <Grid item xs={6}>
                {listDatas[indexName].map((ele, index) => {
                  return <FormInline style={{ width: "180px", paddingTop: "5px", paddingRight: "2px" }} >
                    {ele.SKUMaster_Code}
                    <FormInline >
                      {/* <LabelH style={{ paddingRight: "2px" }}>
                        {"Q : "}</LabelH> */}
                      {<div style={{ paddingLeft: "5px" }}>{ele["Quantity_Genarate"]}</div>}
                    </FormInline>
                    {" "} {<div style={{ paddingLeft: "2px" }}>{ele.UnitType_Code}{" "}</div>}

                  </FormInline>
                })}
              </Grid>
              <Grid item xs={1} style={{ paddingLeft: "0px", paddingTop: "25px" }}>
                <IconButton
                  size="small"
                  aria-label="info"
                  style={{ padding: "0px" }}
                >
                  <DeleteIcon
                    fontSize="small"
                    style={{ color: "#e74c3c" }}
                    onClick={() => { onClickDeletePallet(listDatas[indexName], listDatas, indexName) }} />
                </IconButton>
              </Grid>
            </Grid>
          </FormInline>
        </Paper>
      </div >)

    }
    return e
  }

  const RanderEleListItem = (item) => {

    return item === null ? null : item.map((ele, index) => {
      return (<div style={{ paddingBottom: "5px" }} >
        <Paper key={index} className={classes.paper}
          style={{
            padding: "0px",
            textAlign: "left",

          }} >
          <FormInline style={{ paddingLeft: "5px" }} >
            <input
              className="barcodeCheckbox"
              type="checkbox"
              id={ele.ID}
              name="selection"
              value={ele}
              disabled={ele.Quantity === 0 ? true : false}
              onChange={e => {

                let selec = selection.filter(y => y.ID != ele.ID && y.Quantity != 0)
                if (e.target.checked) {
                  setSelection([...selec, ele])
                } else {
                  setSelection([...selec])
                }
              }}
            />

            <LabelH style={{ paddingRight: "10px" }}>{"Code : "}</LabelH>{ele.SKUMaster_Code}
            <FormInline >
              {/* <LabelH>{"Q : "}</LabelH> */}
              {getQtyItem(ele)}
              {" / " + ele.Quantity}{" "}{ele.UnitType_Code}
            </FormInline>

          </FormInline>
        </Paper>
      </div>);
    })

  }

  const RanderEle = () => {
    if (iniData) {

      const columns = [{ field: "Code" }]
      return columns.map(y => {
        return {
          component: (data, cols, key) => {
            return (
              <div >
                <Grid container spacing={1}>
                  <Grid item xs={6} style={{ backgroundColor: "#F5F5F5", height: "300px" }}>
                    {RanderEleListItem(iniData)}

                  </Grid>
                  <Grid item xs={1}>
                    <div style={{
                      textAlign: "center",
                      paddingTop: "100%"
                    }}>
                      <IconButton
                        size="small"
                        aria-label="info"
                      >
                        <PlaylistArrowPlay
                          fontSize="medium"
                          style={{ color: "#4FC3F7" }}
                          onClick={() => { onGenBarcode() }}
                        />
                      </IconButton>

                      <br />
                      <IconButton
                        size="small"
                        aria-label="info"
                      >
                        <SkipNext
                          fontSize="medium"
                          style={{ color: "#039BE5" }}
                          onClick={() => { onNextSkip() }}
                        />
                      </IconButton>
                      <br />
                      <IconButton
                        size="small"
                        aria-label="info"
                        onClick={() => { Clear() }}
                      >
                        <DeleteSweep
                          fontSize="medium"
                          style={{ color: "#e74c3c" }} />
                      </IconButton>

                    </div>
                  </Grid>
                  <Grid item xs={5} style={{
                    backgroundColor: "#F5F5F5",
                    height: "300px",
                    overflowX: "hidden",
                    overflowY: "auto"
                  }}>
                    {elePallet}
                  </Grid>
                </Grid>
              </div >
            );
          }
        };
      });
    }
  };

  const Clear = () => {
    Array.from(document.getElementsByClassName("barcodeCheckbox")).forEach(x => x.checked = false);
    props.data.forEach(x => {
      if (document.getElementById(x.ID + "_qty") !== null)
        document.getElementById(x.ID + "_qty").value = x.SKUMaster_Info1
    })
    setIniData(Clone(props.data))
    setSelection([])
    setNumCount(1)
    setItemList({})
    setElePallet()
  };




  return (
    <div>
      <AmDialogs
        typePopup={dialogState.type}
        onAccept={(e) => { setDialogState({ ...dialogState, state: false }) }}
        open={dialogState.state}
        content={dialogState.content} />
      <AmEditorTable
        style={{ width: "700px" }}
        open={dialog}
        onAccept={(status, rowdata) => onHandledataConfirm(status, rowdata)}
        titleText={t("Generate QRCode Detail")}
        data={iniData}
        columns={RanderEle()}
      />
      {/* <AmButton
        style={{ marginRight: "5px" }}
        styleType="confirm"
        onClick={() => {
          if (props.data.length === 0) {
            setDialogState({ type: "warning", content: "กรุณาเลือกข้อมูล", state: true })
          } else {
            //genDataPalletList()
            setDialog(true)
          }
        }}
      >
        QRCODE MANUAL
        </AmButton> */}


    </div>
  );
};
export default AmPrintBarCodeV2;
