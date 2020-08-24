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
import { PlaylistPlay, PlaylistArrowPlay } from "./IconTreeview";
import { LoadDataPDF } from "./GendataPDF";
import Clone from "../../../components/function/Clone";
import Checkbox from "@material-ui/core/Checkbox";

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
    margin-left: 5px;
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
  const [valueManual, setValueManual] = useState({});
  const [elePallet, setElePallet] = useState();
  const [numCount, setNumCount] = useState(1);
  const [itemList, setItemList] = useState({});


  useEffect(() => {
    // console.log(props.data)
    setIniData(props.data)
  }, [props.data])
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

  const onHandleChangeInputManual = (value, fieldDataKey) => {
    valueManual[fieldDataKey] = value;
  };
  const onHandledataConfirm = (status, rowdata) => {
    if (status) {
      console.log(itemList)
      // if (!genData) {
      console.log(numCount)
      onClickLoadPDF(itemList, props.SouSupplierName, props.SouSupplierCode, numCount)
      // } else {
      //   onClickLoadPDF()
      // }
    } else {
      setDialog(false)
      // Clear()
    }

  }

  const onClickLoadPDF = async (dataGen) => {
    var data = LoadDataPDF(dataGen)
    console.log("DIWDJ")
    console.log(data)
    try {
      // console.log(data)
      // console.log(dataSourceGenPallet)
      await Axios.postload(window.apipath + "/v2/download/print_tag_code", data, "printcode.pdf", "preview").then();
      setDialog(false)
      setDialogState({ type: "success", content: "Success", state: true })
      // Clear()
    } catch (err) {
      setDialogState({ type: "error", content: err.message, state: true })
      // Clear()
    }
  }




  const onGenBarcode = () => {
    console.log(selection)
    console.log(iniData)

    // selection.forEach(selec => {
    //   var selectionData = iniData.find(x => x.ID !== selec.ID)
    //   console.log(selectionData)
    // })

    var iniDatatmp = Clone(iniData)

    setElePallet(RanderEleListPallet(selection))
    // iniDatatmp.forEach(ini => {
    //   let genQty = ini["Quantity_Genarate"] !== undefined ? ini["Quantity_Genarate"] : 0
    //   console.log(ini)
    //   ini.Quantity = ini.Quantity - genQty
    //   //ini.Quantity_Genarate = 0 ถ้า ID ไม่ตรงกับ Selection ให้เป็น 0

    // });

    selection.forEach(selec => {
      var selectionData = iniData.find(x => x.ID === selec.ID)
      console.log(selec)
      console.log(selectionData)
      if (selectionData !== undefined) {
        let genQty = selectionData["Quantity_Genarate"] !== undefined ? selectionData["Quantity_Genarate"] : 0

        selectionData.Quantity = selectionData.Quantity - genQty
        //ini.Quantity_Genarate = 0 ถ้า ID ไม่ตรงกับ Selection ให้เป็น 0
      }
    });
    setIniData([...iniData])

  }

  const getQtyItem = (e) => {

    return (<div><AmInput
      id={"BaseQuantity"}
      style={{ width: "50px", margin: "0px" }}
      type={"input"}
      defaultValue={e["SKUMaster_Info1"] ? e["SKUMaster_Info1"] : ""}
      onChange={(value, dataObject, inputID, fieldDataKey) =>
        // onHandleChangeInputManual(value, e.SKUMaster_Code)
        e["Quantity_Genarate"] = parseInt(value)
      }
    /></div >)
  }

  //==================================================================================
  console.log(itemList)
  const RanderEleListPallet = (item) => {
    console.log(item)
    var xx = Clone(item)
    //itemList[numCount] = item
    //setNumCount(numCount + 1)
    //console.log(itemList)
    let listDatas = { ...itemList, [numCount]: xx };
    setItemList(listDatas)
    console.log(listDatas)
    setNumCount(numCount + 1)
    let e = []
    for (let indexName in listDatas) {
      console.log("fhgurghdifsuyfey")
      console.log(indexName)
      e.push(listDatas[indexName].map((ele, index) => {
        console.log(ele)

        return (
          <Paper key={index} className={classes.paper}
            style={{
              padding: "0px",
              textAlign: "left",

            }} >
            <FormInline >
              <LabelH>{"Item : "}</LabelH>{ele.SKUMaster_Code}
              <LabelH>{"Lot : "}</LabelH>{ele.Lot}
              <FormInline > <LabelH>{"Qty : "}</LabelH>{ele["Quantity_Genarate"]}</FormInline>



            </FormInline>

          </Paper>

        );
      })
      )
    }

    return e



  }

  const RanderEleListItem = (item) => {
    console.log(item)

    return item === null ? null : item.map((ele, index) => {
      return (
        <Paper key={index} className={classes.paper}
          style={{
            padding: "0px",
            textAlign: "left",

          }} >
          <FormInline >
            <input
              type="checkbox"
              id={ele.ID}
              name="selection"
              value={ele}
              onChange={e => {

                let selec = selection.filter(y => y.ID != ele.ID)
                if (e.target.checked) {
                  console.log(ele)
                  console.log(selec)
                  setSelection([...selec, ele])
                } else {
                  console.log(selec)
                  setSelection([...selec])
                  console.log("dfghjk")
                }
              }}
            />

            <LabelH>{"Item : "}</LabelH>{ele.SKUMaster_Code}
            <LabelH>{"Lot : "}</LabelH>{ele.Lot}
            <FormInline > <LabelH>{"Qty : "}</LabelH>{getQtyItem(ele)}</FormInline>
            {" / " + ele.Quantity}


          </FormInline>

        </Paper>

      );
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
                  <Grid item xs={6}>
                    {console.log(iniData)}
                    {RanderEleListItem(iniData)}

                    {/* <PlaylistPlay /> */}

                  </Grid>
                  <Grid item xs={1}>
                    <div style={{
                      textAlign: "center",
                      paddingTop: "100%"
                    }}>
                      <PlaylistArrowPlay
                        onClick={() => { onGenBarcode() }}
                      />
                      <br />
                      <PlaylistPlay />
                    </div>
                  </Grid>
                  <Grid item xs={5}>

                    {elePallet}
                    {console.log(selection)}

                  </Grid>
                </Grid>
              </div >
            );
          }
        };
      });
    }
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
        titleText={"Generate BarCode Detail"}
        data={iniData}
        columns={RanderEle()}
      />
      <AmButton
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
        BARCODE
        </AmButton>

    </div>
  );
};
export default AmPrintBarCodeV2;
