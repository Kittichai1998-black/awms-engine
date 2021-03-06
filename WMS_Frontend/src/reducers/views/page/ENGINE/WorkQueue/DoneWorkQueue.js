import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import classnames from 'classnames';
import AmDoneWorkQueue from '../../../pageComponent/AmDoneWorkQueue'
import AmButton from '../../../../components/AmButton'
import { apicall } from '../../../../components/function/CoreFunction'
import { withStyles } from '@material-ui/core/styles';
import styled from 'styled-components'
import AmInput from "../../../../components/AmInput";
import Grid from '@material-ui/core/Grid';
import AmDropdown from '../../../../components/AmDropdown';
import AmDate from '../../../../components/AmDate';
import AmRediRectInfo from "../../../../components/AmRedirectInfo";
import AmEditorTable from "../../../../components/table/AmEditorTable";
import AmDialogs from "../../../../components/AmDialogs";


import { useTranslation } from 'react-i18next'

const Axios = new apicall();

const styles = theme => ({
  root: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
});

const FormInline = styled.div`

display: inline-flex;
flex-flow: row wrap;
align-items: center;
margin-right: 20px;

label {
  margin: 5px 0 5px 10px;
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
    // font-weight: bold;
    width: 80px; 
`;


const DoneWorkQueue = (props) => {
  const { t } = useTranslation()
  const { classes } = props;

  const [datavalue, setdatavalue] = useState([]);
  const pageSize = 100;
  const [page, setPage] = useState(0);
  const [pageIni, setPageIni] = useState(false);
  const [totalSize, setTotalSize] = useState(0);
  const [valueText, setValueText] = useState({ "IOType": 0 });
  const [selection, setSelection] = useState();
  const [dialogConfirm, setDialogConfirm] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openError, setOpenError] = useState(false);
  const [openWarning, setOpenWarning] = useState(false);
  const [textError, setTextError] = useState("");

  useEffect(() => {
    onGetDocument()
  }, [page, valueText])

  const INOUT = [
    { label: "IN", value: 0 },
    { label: "OUT", value: 1 }
  ];
  const onGetALL = () => {
    return window.apipath + "/v2/GetSPReportAPI?"
      + "&dateFrom=" + (valueText.dateFrom === undefined || valueText.dateFrom.value === null ? '' : encodeURIComponent(valueText.dateFrom))
      + "&dateTo=" + (valueText.dateTo === undefined || valueText.dateTo.value === null ? '' : encodeURIComponent(valueText.dateTo))
      + "&packCode=" + (valueText.packCode === undefined || valueText.packCode === null ? '' : encodeURIComponent(valueText.packCode.trim()))
      + "&pallet=" + (valueText.PalletCode === undefined || valueText.PalletCode === null ? '' : encodeURIComponent(valueText.PalletCode.trim()))
      + "&orderNo=" + (valueText.orderNo === undefined || valueText.orderNo === null ? '' : encodeURIComponent(valueText.orderNo.trim()))
      + "&batch=" + (valueText.batch === undefined || valueText.batch === null ? '' : encodeURIComponent(valueText.batch.trim()))
      + "&lot=" + (valueText.lot === undefined || valueText.lot === null ? '' : encodeURIComponent(valueText.lot.trim()))
      + "&IOType=" + (valueText.IOType === undefined || valueText.IOType === null ? '' : encodeURIComponent(valueText.IOType))
      //+ "&IOType=0"
      + "&unit=" + (valueText.unit === undefined || valueText.unit === null ? '' : encodeURIComponent(valueText.unit.trim()))
      + "&doc=" + (valueText.Document_Code === undefined || valueText.Document_Code === null ? '' : encodeURIComponent(valueText.Document_Code.trim()))
      + "&spname=DONE_WORKQUEUE";
  }
  const onGetDocument = () => {
    let pathGetAPI = onGetALL() +
      "&page=" + (page === undefined || null ? 0 : page)
      + "&limit=" + (pageSize === undefined || null ? 100 : pageSize);

    Axios.get(pathGetAPI).then((rowselect1) => {
      if (rowselect1) {
        if (rowselect1.data._result.status !== 0) {
          setdatavalue(rowselect1.data.datas)
          setTotalSize(rowselect1.data.datas[0] ? rowselect1.data.datas[0].totalRecord : 0)
        }
      }
    });

  }

  const getValue = (value, inputID) => {
    if (value && value.toString().includes("*")) {
      value = value.replace(/\*/g, "%");
    }
    valueText[inputID] = value;
    setValueText({ ...valueText })
    console.log(valueText.IOType)
  }
  const onHandleChangeInput = (value, dataObject, inputID, fieldDataKey, event) => {
    getValue(value, inputID);
  };
  const onHandleEnterInput = (value, dataObject, inputID, fieldDataKey, event) => {
    getValue(value, inputID);
    if (event && event.key == 'Enter') {
      onGetDocument();
    }
  };
  const onHandleChangeSelect = (value, dataObject, inputID, fieldDataKey, event) => {
    getValue(value, inputID);
    //onGetDocument();
  };
  const GetBodyReports = () => {
    return <div style={{ display: "inline-block" }}>

      <FormInline>
        <LabelH>{t('Pallet')} : </LabelH>
        <AmInput
          id={"PalletCode"}
          type="input"
          style={{ width: "300px" }}
          onChange={(value, obj, element, event) => onHandleChangeInput(value, null, "PalletCode", null, event)}
          onKeyPress={(value, obj, element, event) => onHandleEnterInput(value, null, "PalletCode", null, event)}
        />
      </FormInline>
      <FormInline>
        <LabelH>{t('SKU')} : </LabelH>
        <AmInput
          id={"packCode"}
          type="input"
          style={{ width: "405px" }}
          onChange={(value, obj, element, event) => onHandleChangeInput(value, null, "packCode", null, event)}
          onKeyPress={(value, obj, element, event) => onHandleEnterInput(value, null, "packCode", null, event)}
        />
      </FormInline>
      <FormInline>
        <LabelH>{t("Batch")} : </LabelH>
        <AmInput
          id={"batch"}
          type="input"
          style={{ width: "300px" }}
          onChange={(value, obj, element, event) => onHandleChangeInput(value, null, "batch", null, event)}
          onKeyPress={(value, obj, element, event) => onHandleEnterInput(value, null, "batch", null, event)}
        />
      </FormInline>
      <FormInline>
        <LabelH>{t("Lot")} : </LabelH>
        <AmInput
          id={"lot"}
          type="input"
          style={{ width: "405px" }}
          onChange={(value, obj, element, event) => onHandleChangeInput(value, null, "lot", null, event)}
          onKeyPress={(value, obj, element, event) => onHandleEnterInput(value, null, "lot", null, event)}
        />
      </FormInline>
      <FormInline>
        <LabelH>{t("Order No.")} : </LabelH>
        <AmInput
          id={"orderNo"}
          type="input"
          style={{ width: "300px" }}
          onChange={(value, obj, element, event) => onHandleChangeInput(value, null, "orderNo", null, event)}
          onKeyPress={(value, obj, element, event) => onHandleEnterInput(value, null, "orderNo", null, event)}
        />
      </FormInline>
      <FormInline>
        <LabelH>{t('Doc No.')} : </LabelH>
        <AmInput
          id={"Document_Code"}
          type="input"
          style={{ width: "405px" }}
          onChange={(value, obj, element, event) => onHandleChangeInput(value, null, "Document_Code", null, event)}
          onKeyPress={(value, obj, element, event) => onHandleEnterInput(value, null, "Document_Code", null, event)}
        />
      </FormInline>

    </div>

  }
  const customBtnSelect = () => {
    return <AmButton styleType="confirm" onClick={onGetDocument} style={{ marginRight: "5px" }}>{t('Select')}</AmButton>
  }
  const columns = [
    { accessor: "IOType", Header: "IOType", width: 70, sortable: false, style: { textAlign: "center" }, Cell: dataRow => getIOType(dataRow.original) },
    { accessor: "ActualTime", Header: "Time", className: 'center', width: 100, type: "datetime", dateFormat: "HH:mm:ss", sortable: false, style: { textAlign: "center" } },
    { accessor: "StartTime", Header: "StartTime", className: 'center', width: 150, type: "datetime", dateFormat: "DD/MM/YYYY HH:mm", sortable: false, style: { textAlign: "center" } },
    { accessor: "ModifyTime", Header: "LastModify", className: 'center', width: 150, type: "datetime", dateFormat: "DD/MM/YYYY HH:mm", sortable: false, style: { textAlign: "center" } },
    { accessor: "PalletCode", Header: "Pallet", width: 120, sortable: false },
    { accessor: "Code", Header: "SKU", width: 140, sortable: false, },
    { accessor: "Batch", Header: "Batch", width: 80, sortable: false },
    { accessor: "Lot", Header: "Lot", width: 80, sortable: false },
    { accessor: "OrderNo", Header: "Order No", width: 80, sortable: false },
    { accessor: "BaseQuantity", Header: "Qty", width: 100, sortable: false },
    { accessor: "Unit", Header: "Unit", width: 80, sortable: false },
    { accessor: "Document_Code", Header: "Doc No.", width: 150, sortable: false, Cell: dataRow => getRedirect(dataRow.original) },

  ];
  const getIOType = data => {
    return data.IOType === 0 ? "IN" : "OUT"
  };
  const getRedirect = data => {
    return (
      <div style={{ display: "flex", padding: "0px", paddingLeft: "10px" }}>
        {data.Document_Code}
        {data.IOType === 0 ? <AmRediRectInfo
          api={"/receive/detail?docID=" + data.Document_ID}
          history={props.history}
          docID={""}
        >
          {" "}
        </AmRediRectInfo> : <AmRediRectInfo
          api={"/issue/detail?docID=" + data.Document_ID}
          history={props.history}
          docID={""}
        >
            {" "}
          </AmRediRectInfo>}

      </div>
    );
  };
  const doneWorkQueue = () => {
    var data = []
    data = selection.map(x => {
      return x.ID
    });
    Axios.post(window.apipath + "/v2/ManualDoneQueueAPI", {
      queueID: data
    }).then(res => {
      if (res.data._result !== undefined) {
        if (res.data._result.status === 1) {
          setOpenSuccess(true);
          onGetDocument()
          setSelection(null)

        } else {
          setOpenError(true);
          setTextError(res.data._result.message);
          onGetDocument()
          setSelection(null)
        }
      }
    })
    return null
  }
  const onHandleDeleteConfirm = (status) => {
    if (status) {
      doneWorkQueue()
    }
    setDialogConfirm(false);
  };
  const getBtnDone = () => {
    return <AmButton
      style={{ marginRight: "5px" }}
      styleType="confirm"
      onClick={() => {
        if (selection.length === 0) {
          setOpenWarning(true)
        } else {
          setDialogConfirm(true)
        }

      }}
    >
      DONE QUEUE
    </AmButton>
  };

  return (
    <div className={classes.root}>
      <AmEditorTable
        open={dialogConfirm}
        onAccept={status => onHandleDeleteConfirm(status)}
        titleText={"Confirm DoneQueue"}
        columns={[]}
      />
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
      <AmDialogs
        typePopup={"warning"}
        onAccept={e => {
          setOpenWarning(e);
        }}
        open={openWarning}
        content={"Please select data"}
      ></AmDialogs>
      <FormInline><LabelH>{t("IOType")} : </LabelH>
        <AmDropdown
          id={'IOType'}
          fieldDataKey={"value"}
          placeholder="Select"
          labelPattern=" : "
          width={300}
          ddlMinWidth={300}
          zIndex={1000}
          defaultValue={"0"}
          valueData={valueText["IOType"]}
          data={INOUT}
          onChange={(value, dataObject, inputID, fieldDataKey) => onHandleChangeSelect(value, dataObject, 'IOType', fieldDataKey, null)}
        />
      </FormInline>
      <FormInline><LabelH>{t("Start From")} : </LabelH>
        <AmDate
          id={"dateFrom"}
          TypeDate={"date"}
          //style={{}}
          defaultValue={true}
          onChange={(value) => onHandleChangeSelect(value ? value.fieldDataKey : '', value, "dateFrom", null, null)}
          FieldID={"dateFrom"} >
        </AmDate>{' '}
        <LabelH>{t("Start To")} : </LabelH>
        <AmDate
          id={"dateTo"}
          TypeDate={"date"}
          //style={{ width: "300px" }}
          defaultValue={true}
          onChange={(value) => onHandleChangeSelect(value ? value.fieldDataKey : '', value, "dateTo", null, null)}
          FieldID={"dateTo"} >
        </AmDate>
      </FormInline>

      <AmDoneWorkQueue
        bodyHeadReport={GetBodyReports()}
        columnTable={columns}
        dataTable={datavalue}
        pageSize={pageSize}
        pages={(x) => { setPage(x); setPageIni(true) }}
        totalSize={totalSize}
        renderCustomButton={customBtnSelect()}
        page={true}
        exportData={false}
        renderCustomButtonBTMLeft={getBtnDone()}
        onSelection={(data) => { setSelection(data) }}
      ></AmDoneWorkQueue>
    </div >
  )

}

export default withStyles(styles)(DoneWorkQueue);
