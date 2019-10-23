import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import classnames from 'classnames';
import AmReport from '../../../../components/AmReport'
import AmButton from '../../../../components/AmButton'
import AmFindPopup from '../../../../components/AmFindPopup'
import { apicall } from '../../../../components/function/CoreFunction'
import { withStyles } from '@material-ui/core/styles';
import AmDropdown from '../../../../components/AmDropdown';
import styled from 'styled-components'
import AmInput from "../../../../components/AmInput";
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


const CurrentInventory = (props) => {
    const { t } = useTranslation()
    const { classes } = props;

    const [datavalue, setdatavalue] = useState([]);
    const pageSize = 100;
    const [page, setPage] = useState(0);
    const [totalSize, setTotalSize] = useState(0);
    const [valueText, setValueText] = useState({});

    useEffect(() => {
        onGetDocument()
    }, [page])
    const onGetDocument = () => {

        Axios.get(window.apipath + "/v2/GetSPReportAPI?"
            + "&packCode=" + (valueText.packCode === undefined || valueText.packCode.value === undefined || valueText.packCode.value === null ? '' : encodeURIComponent(valueText.packCode.value.trim()))
            + "&packName=" + (valueText.packName === undefined || valueText.packName.value === undefined || valueText.packName.value === null ? '' : encodeURIComponent(valueText.packName.value.trim()))
            + "&orderNo=" + (valueText.orderNo === undefined || valueText.orderNo.value === undefined || valueText.orderNo.value === null ? '' : encodeURIComponent(valueText.orderNo.value.trim()))
            + "&page=" + (page === undefined || null ? 0 : page)
            + "&limit=" + (pageSize === undefined || null ? 100 : pageSize)
            + "&spname=CURRENTINV_STOSUM").then((rowselect1) => {
                if (rowselect1) {
                    if (rowselect1.data._result.status !== 0) {
                        setdatavalue(rowselect1.data.datas)
                        setTotalSize(rowselect1.data.datas[0] ? rowselect1.data.datas[0].totalRecord : 0)
                    }
                }
            })
    }
    const getAPI = "/v2/GetSPReportAPI?"
        + "&packCode=" + (valueText.packCode === undefined || valueText.packCode.value === undefined || valueText.packCode.value === null ? '' : encodeURIComponent(valueText.packCode.value.trim()))
        + "&packName=" + (valueText.packName === undefined || valueText.packName.value === undefined || valueText.packName.value === null ? '' : encodeURIComponent(valueText.packName.value.trim()))
        + "&orderNo=" + (valueText.orderNo === undefined || valueText.orderNo.value === undefined || valueText.orderNo.value === null ? '' : encodeURIComponent(valueText.orderNo.value.trim()))
        + "&spname=CURRENTINV_STOSUM";

    const onHandleChangeInput = (value, dataObject, inputID, fieldDataKey, event) => {
        if (value && value.toString().includes("*")) {
            value = value.replace(/\*/g, "%");
        }

        valueText[inputID] = {
            value: value,
            dataObject: dataObject,
            fieldDataKey: fieldDataKey,
        }
    };
    const GetBodyReports = () => {
        return <div style={{ display: "inline-block" }}>
            <FormInline>
                <LabelH>{t('SKU Code')} : </LabelH>
                <AmInput
                    id={"packCode"}
                    type="input"
                    style={{ width: "300px" }}
                    onChange={(value, obj, element, event) => onHandleChangeInput(value, null, "packCode", null, event)}
                />
            </FormInline>
            <FormInline>
                <LabelH>{t('SKU Name')} : </LabelH>
                <AmInput
                    id={"packName"}
                    type="input"
                    style={{ width: "300px" }}
                    onChange={(value, obj, element, event) => onHandleChangeInput(value, null, "packName", null, event)}
                />
            </FormInline>
            <FormInline>
                <LabelH>{t("Order No.")} : </LabelH>
                <AmInput
                    id={"orderNo"}
                    type="input"
                    style={{ width: "300px" }}
                    onChange={(value, obj, element, event) => onHandleChangeInput(value, null, "orderNo", null, event)}
                />
            </FormInline>
        </div>

    }
    const customBtnSelect = () => {
        return <AmButton styleType="confirm" onClick={onGetDocument} style={{ marginRight: "5px" }}>{t('Select')}</AmButton>
    }
    const columns = [
        { Header: 'SKU Code', accessor: 'Code', width: 120, sortable: false },
        { Header: 'SKU Name', accessor: 'Name', sortable: false },
        { Header: 'Order No.', accessor: 'OrderNo', width: 80, sortable: false },
        { Header: 'Qty New', accessor: 'baseQty_evt10', width: 80, sortable: false },
        { Header: 'Qty Receiving', accessor: 'baseQty_evt11', width: 85, sortable: false },
        { Header: 'Qty Received', accessor: 'baseQty_evt12', width: 85, sortable: false },
        { Header: 'Qty Counting', accessor: 'baseQty_evt13', width: 85, sortable: false },
        { Header: 'Qty Counted', accessor: 'baseQty_evt14', width: 85, sortable: false },
        { Header: 'Qty Picking', accessor: 'baseQty_evt17', width: 85, sortable: false },
        { Header: 'Qty Picked', accessor: 'baseQty_evt18', width: 85, sortable: false },
        { Header: 'Qty', accessor: 'baseQty', width: 70, sortable: false },
        { Header: 'Unit', accessor: 'baseUnitType', width: 70, sortable: false },

    ];


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
                exportApi={getAPI}
            ></AmReport>
        </div>
    )

}

export default withStyles(styles)(CurrentInventory);
