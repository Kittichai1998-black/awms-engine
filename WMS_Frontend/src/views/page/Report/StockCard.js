import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import classnames from 'classnames';
import AmReport from '../../../components/AmReport'
import AmButton from '../../../components/AmButton'
import AmFindPopup from '../../../components/AmFindPopup'
import { apicall } from '../../../components/function/CoreFunction'
import { withStyles } from '@material-ui/core/styles';
import styled from 'styled-components'
import AmInput from "../../../components/AmInput";
import AmDate from '../../../components/AmDate';
import AmDropdown from '../../../components/AmDropdown';
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
    // font-weight: bold;
    width: 100px; 
`;


const StockCard = (props) => {
    const { t } = useTranslation()
    const { classes } = props;

    const [datavalue, setdatavalue] = useState([]);
    const pageSize = 100;
    const [page, setPage] = useState(0);
    const [totalSize, setTotalSize] = useState(0);
    const [valueText, setValueText] = useState({});


    const MVTQuery = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "MovementType",
        q: '[{ "f": "Status", "c":"<", "v": 2}]',
        f: "*",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: "",
    }
    useEffect(() => {
        onGetDocument()
    }, [page])
    const onGetALL = () => {
        return window.apipath + "/v2/GetSPReportAPI?"
            + "&fromDate=" + (valueText.fromDate === undefined || valueText.fromDate === null ? '' : encodeURIComponent(valueText.fromDate))
            + "&toDate=" + (valueText.toDate === undefined || valueText.toDate === null ? '' : encodeURIComponent(valueText.toDate))
            + "&packCode=" + (valueText.packCode === undefined || valueText.packCode === null ? '' : encodeURIComponent(valueText.packCode.trim()))
            + "&orderNo=" + (valueText.orderNo === undefined || valueText.orderNo === null ? '' : encodeURIComponent(valueText.orderNo.trim()))
            + "&batch=" + (valueText.batch === undefined || valueText.batch === null ? '' : encodeURIComponent(valueText.batch.trim()))
            + "&lot=" + (valueText.lot === undefined || valueText.lot === null ? '' : encodeURIComponent(valueText.lot.trim()))
            + "&movementType=" + (valueText.movementType === undefined || valueText.movementType === null ? '' : encodeURIComponent(valueText.movementType))
            + "&spname=DAILY_STOCKCARD";
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
        onGetDocument();
    };
    const GetBodyReports = () => {
        return <div style={{ display: "inline-block" }}>
            <FormInline><LabelH>{t(window.project === "TAP" ? "Part NO." : 'SKU Code')} : </LabelH>
                <AmInput
                    id={"packCode"}
                    type="input"
                    style={{ width: "300px" }}
                    onChange={(value, obj, element, event) => onHandleChangeInput(value, null, "packCode", null, event)}
                    onKeyPress={(value, obj, element, event) => onHandleEnterInput(value, null, "packCode", null, event)}
                />
            </FormInline><br />
            <FormInline><LabelH>{t("Batch")} : </LabelH>
                <AmInput
                    id={"batch"}
                    type="input"
                    style={{ width: "300px" }}
                    onChange={(value, obj, element, event) => onHandleChangeInput(value, null, "batch", null, event)}
                    onKeyPress={(value, obj, element, event) => onHandleEnterInput(value, null, "batch", null, event)}
                />
            </FormInline>
            <FormInline><LabelH>{t("Lot")} : </LabelH>
                <AmInput
                    id={"lot"}
                    type="input"
                    style={{ width: "300px" }}
                    onChange={(value, obj, element, event) => onHandleChangeInput(value, null, "lot", null, event)}
                    onKeyPress={(value, obj, element, event) => onHandleEnterInput(value, null, "lot", null, event)}
                />
            </FormInline>
            <FormInline>
                <LabelH>{t("Order No")}. : </LabelH>
                <AmInput
                    id={"orderNo"}
                    type="input"
                    style={{ width: "300px" }}
                    onChange={(value, obj, element, event) => onHandleChangeInput(value, null, "orderNo", null, event)}
                    onKeyPress={(value, obj, element, event) => onHandleEnterInput(value, null, "orderNo", null, event)}
                />
            </FormInline>
            <FormInline><LabelH>{t("Movement")} : </LabelH>
                <AmDropdown
                    id={'movementType'}
                    fieldDataKey={"ID"}
                    fieldLabel={["Code", "Name"]}
                    placeholder="Select Movement"
                    labelPattern=" : "
                    width={300}
                    ddlMinWidth={300}
                    zIndex={1000}
                    returnDefaultValue={true}
                    queryApi={MVTQuery}
                    onChange={(value, dataObject, inputID, fieldDataKey) => onHandleChangeSelect(value, dataObject, 'movementType', fieldDataKey, null)}
                    ddlType={'search'}
                />
            </FormInline>
            <FormInline><LabelH>{t("Date From")} : </LabelH>
                <AmDate
                    id={"fromDate"}
                    TypeDate={"date"}
                    style={{ width: "300px" }}
                    defaultValue={true}
                    // value={valueInput[field] ? valueInput[field].value : ""}
                    onChange={(value) => onHandleChangeSelect(value ? value.fieldDataKey : '', value, "fromDate", null, null)}
                    FieldID={"fromDate"} >
                </AmDate>
            </FormInline>
            <FormInline><LabelH>{t("Date To")} : </LabelH>
                <AmDate
                    id={"toDate"}
                    TypeDate={"date"}
                    style={{ width: "300px" }}
                    defaultValue={true}
                    // value={valueInput[field] ? valueInput[field].value : ""}
                    onChange={(value) => onHandleChangeSelect(value ? value.fieldDataKey : '', value, "toDate", null, null)}
                    FieldID={"toDate"} >
                </AmDate>
            </FormInline>
        </div>

    }
    const customBtnSelect = () => {
        return <AmButton styleType="confirm" onClick={onGetDocument} style={{ marginRight: "5px" }}>{t('Select')}</AmButton>
    }
    const columns = [
        { Header: 'Date', accessor: 'CreateTime', type: 'datetime', width: 130, sortable: false },
        { Header: 'Doc No.', accessor: 'docCode', width: 120, sortable: false },
        { Header: window.project === "TAP" ? "Part NO." : 'SKU Code', accessor: 'pstoCode', width: 120, sortable: false },
        { Header: window.project === "TAP" ? "Part Name" : 'SKU Name', accessor: 'pstoName', width: 150, sortable: false },
        { Header: 'Batch', accessor: 'pstoBatch', width: 100, sortable: false },
        { Header: 'Lot', accessor: 'pstoLot', width: 100, sortable: false },
        { Header: 'Order No.', accessor: 'pstoOrder', width: 100, sortable: false },
        {
            Header: 'Issue', accessor: 'creditBaseQuantity', width: 70, sortable: false,
            Footer: true,
            "Cell": (e) => comma(e.value.toString())
        },
        {
            Header: 'Receive', accessor: 'debitBaseQuantity', width: 70, sortable: false,
            Footer: true,
            "Cell": (e) => comma(e.value.toString())
        },
        { Header: 'Unit', accessor: 'BaseUnitType', width: 70, sortable: false },
        { Header: 'Description', accessor: 'Description', width: 200, sortable: false },

    ];

    const comma = (value) => {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    return (
        <div className={classes.root}>
            <AmReport
                bodyHeadReport={GetBodyReports()}
                columnTable={columns}
                dataTable={datavalue}
                pageSize={pageSize}
                pages={(x) => setPage(x)}
                totalSize={totalSize}
                renderCustomButton={customBtnSelect()}
                page={true}
                exportApi={onGetALL()}
                fileNameTable={"STC"}
                excelFooter={true}
            ></AmReport>
        </div>
    )

}

export default withStyles(styles)(StockCard);
