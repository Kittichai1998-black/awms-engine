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
import AmRediRectInfo from '../../../components/AmRedirectInfo'
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
    textNowrap: { overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', whiteSpace: 'nowrap' },
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


const DailySTOSumReceive = (props) => {
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
    const DocCodeQuery = {
        queryString: window.apipath + "/v2/SelectDataTrxAPI",
        t: "Document",
        q: '[{ "f": "DocumentType_ID", "c":"=", "v": 1001},{ "f": "Status", "c":"<", "v": 2}]',
        f: "ID,Code",
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
            + "&dateFrom=" + (valueText.dateFrom === undefined || valueText.dateFrom.value === null ? '' : encodeURIComponent(valueText.dateFrom))
            + "&dateTo=" + (valueText.dateTo === undefined || valueText.dateTo.value === null ? '' : encodeURIComponent(valueText.dateTo))
            + "&docCode=" + (valueText.docCode === undefined || valueText.docCode === null ? '' : encodeURIComponent(valueText.docCode.trim()))
            + "&movementTypeID=" + (valueText.movementType === undefined || valueText.movementType === null ? '' : encodeURIComponent(valueText.movementType))
            + "&docType=1001"
            + "&spname=DAILY_STOSUM";
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
        })
    }
    const onHandleChangeInput = (value, dataObject, inputID, fieldDataKey, event) => {
        if (value && value.toString().includes("*")) {
            value = value.replace(/\*/g, "%");
        }
        valueText[inputID] = value;

    };
    const GetBodyReports = () => {
        return <div style={{ display: "inline-block" }}>
            <FormInline><LabelH>{t("Doc No.")} : </LabelH>
                <AmInput
                    id={"docCode"}
                    type="input"
                    style={{ width: "300px" }}
                    onChange={(value, obj, element, event) => onHandleChangeInput(value, null, "docCode", null, event)}
                />
            </FormInline>
            <FormInline><LabelH>{t("Movement")} : </LabelH>
                <AmDropdown
                    id={'movementType'}
                    fieldDataKey={"ID"}
                    fieldLabel={["Code", "Name"]}
                    labelPattern=" : "
                    width={300}
                    placeholder="Select Movement"
                    ddlMinWidth={300}
                    zIndex={1000}
                    returnDefaultValue={true}
                    queryApi={MVTQuery}
                    onChange={(value, dataObject, inputID, fieldDataKey) => onHandleChangeInput(value, dataObject, 'movementType', fieldDataKey, null)}
                    ddlType={'search'}
                />
            </FormInline>
            <FormInline><LabelH>{t("Date From")} : </LabelH>
                <AmDate
                    id={"dateFrom"}
                    TypeDate={"date"}
                    style={{ width: "300px" }}
                    defaultValue={true}
                    // value={valueInput[field] ? valueInput[field].value : ""}
                    onChange={(value) => onHandleChangeInput(value ? value.fieldDataKey : '', value, "dateFrom", null, null)}
                    FieldID={"dateFrom"} >
                </AmDate>
            </FormInline>
            <FormInline><LabelH>{t("Date To")} : </LabelH>
                <AmDate
                    id={"dateTo"}
                    TypeDate={"date"}
                    style={{ width: "300px" }}
                    defaultValue={true}
                    // value={valueInput[field] ? valueInput[field].value : ""}
                    onChange={(value) => onHandleChangeInput(value ? value.fieldDataKey : '', value, "dateTo", null, null)}
                    FieldID={"dateTo"} >
                </AmDate>
            </FormInline>
        </div>

    }
    const customBtnSelect = () => {
        return <AmButton styleType="confirm" onClick={onGetDocument} style={{ marginRight: "5px" }}>{t('Select')}</AmButton>
    }
    const columns = [
        { Header: 'Date', accessor: 'createDate', type: 'datetime', dateFormat: 'DD-MM-YYYY', width: 90, sortable: false },
        { Header: 'Doc No.', accessor: 'docCode', width: 170, sortable: false, Cell: (dataRow) => getRedirect(dataRow.original.docCode) },
        { Header: window.project === "TAP" ? "Part NO." : 'SKU Code', accessor: 'pstoCode', width: 120, sortable: false },
        { Header: window.project === "TAP" ? "Part Name" : 'SKU Name', accessor: 'pstoName', width: 150, sortable: false },
        { Header: 'Batch', accessor: 'pstoBatch', width: 100, sortable: false },
        { Header: 'Lot', accessor: 'pstoLot', width: 100, sortable: false },
        { Header: 'Order No.', accessor: 'pstoOrderNo', width: 100, sortable: false },
        // { Header: 'Ref No.', accessor: 'docRefID', width: 100, sortable: false },
        // { Header: 'Ref1', accessor: 'docRef1', width: 100, sortable: false },
        // { Header: 'Ref2', accessor: 'docRef2', width: 100, sortable: false },
        {
            Header: 'Qty', accessor: 'qty', width: 70, sortable: false,
            Footer: true,
            "Cell": (e) => comma(e.value.toString())
        },
        { Header: 'Unit', accessor: 'unitType', width: 70, sortable: false },
        {
            Header: 'Base Qty', accessor: 'baseQty', width: 70, sortable: false,
            Footer: true,
            "Cell": (e) => comma(e.value.toString())
        },
        { Header: 'Base Unit', accessor: 'baseUnitType', width: 70, sortable: false },
    ];

    const getRedirect = (data) => {
        if (data.indexOf(',') > 0) {
            var datashow = data.split(",").map((x) => {
                return <div>{x}<br /></div>
            });
            return (
                <div style={{ display: "flex", maxWidth: '160px' }}><label className={classes.textNowrap}>{data}</label>
                    <AmRediRectInfo type={"dialog"} bodyDialog={datashow} titleDialog="List of Document No." />
                </div>
            )
        } else {
            return data;
        }
    }
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
                exportApi={onGetALL()}
                fileNameTable={"DAILYSTO_SUM_RECEIVE"}
                excelFooter={true}
                page={true}
            ></AmReport>
        </div>
    )

}

export default withStyles(styles)(DailySTOSumReceive);