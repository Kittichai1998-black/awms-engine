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
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import AmDialogs from "../../../components/AmDialogs";
import Card from "@material-ui/core/Card";
import AmTable from "../../../components/AmTable/AmTable";
import CardContent from "@material-ui/core/CardContent";
import { PlaylistPlay, PlaylistArrowPlay } from "./IconTreeview";


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
  const [selection, setSelection] = useState();
  const [valueManual, setValueManual] = useState({});


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
      Cell: e => getQtyItem(e.original)
    }, {
      Header: "Unit",
      accessor: "UnitType_Code",
      width: 30
    }]

  const getQtyItem = (e) => {
    console.log(e)
    return (<div><AmInput
      id={"BaseQuantity"}
      style={{ width: "50px", margin: "0px" }}
      type={"input"}
      defaultValue={e["BaseQuantity"] ? e["BaseQuantity"] : ""}
      onChange={(value, dataObject, inputID, fieldDataKey) =>
        onHandleChangeInputManual(value, e.SKUMaster_Code)}
    />{" / " + e.BaseQuantity}</div >)
  }
  const onHandleChangeInputManual = (value, fieldDataKey) => {
    valueManual[fieldDataKey] = value;
  };
  const onHandledataConfirm = (status, rowdata) => {
    if (status) {
      // if (!genData) {
      //   onClickLoadPDF(dataItemsSend)
      // } else {
      //   onClickLoadPDF()
      // }
    } else {
      setDialog(false)
      // Clear()
    }

  }
  //==================================================================================


  const RanderEleListItem = (item) => {
    console.log(item)
    return (
      <AmTable
        columns={columns}
        dataKey={"ID"}
        dataSource={item}
        // rowNumber={true}
        selection={"checkbox"}
        selectionData={(data) => {
          setSelection(data);
        }}

      />
    );

  }
  const RanderEle = () => {
    if (props.data) {

      const columns = [{ field: "Code" }]
      return columns.map(y => {
        return {
          component: (data, cols, key) => {
            return (
              <div >


                <Grid container spacing={1}>
                  <Grid item xs={7}>

                    {RanderEleListItem(props.data)}

                    {/* <PlaylistPlay /> */}

                  </Grid>
                  <Grid item xs={1}>
                    <div style={{
                      textAlign: "center",
                      paddingTop: "100%"
                    }}>
                      <PlaylistArrowPlay />
                      <br />
                      <PlaylistPlay />
                    </div>
                  </Grid>
                  <Grid item xs={4}>

                    <Paper className={classes.paper} >batcode</Paper>

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
        data={props.data}
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
