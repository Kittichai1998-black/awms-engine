import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import classnames from 'classnames';
import AmReport from '../../../components/AmReport'
import AmButton from '../../../components/AmButton'
import AmFindPopup from '../../../components/AmFindPopup'
import { apicall } from '../../../components/function/CoreFunction'
import { withStyles } from '@material-ui/core/styles';
import AmDropdown from '../../../components/AmDropdown';
import styled from 'styled-components'
import AmInput from "../../../components/AmInput";
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
            + "&batch=" + (valueText.batch === undefined || valueText.batch.value === undefined || valueText.batch.value === null ? '' : encodeURIComponent(valueText.batch.value.trim()))
            + "&lot=" + (valueText.lot === undefined || valueText.lot.value === undefined || valueText.lot.value === null ? '' : encodeURIComponent(valueText.lot.value.trim()))
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
        + "&batch=" + (valueText.batch === undefined || valueText.batch.value === undefined || valueText.batch.value === null ? '' : encodeURIComponent(valueText.batch.value.trim()))
        + "&lot=" + (valueText.lot === undefined || valueText.lot.value === undefined || valueText.lot.value === null ? '' : encodeURIComponent(valueText.lot.value.trim()))
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
                <LabelH>{t(window.project === "TAP" ? "Part NO." : 'SKU Code')} : </LabelH>
                <AmInput
                    id={"packCode"}
                    type="input"
                    style={{ width: "300px" }}
                    onChange={(value, obj, element, event) => onHandleChangeInput(value, null, "packCode", null, event)}
                />
            </FormInline>
            <FormInline>
                <LabelH>{t(window.project === "TAP" ? "Part Name" : 'SKU Name')} : </LabelH>
                <AmInput
                    id={"packName"}
                    type="input"
                    style={{ width: "300px" }}
                    onChange={(value, obj, element, event) => onHandleChangeInput(value, null, "packName", null, event)}
                />
            </FormInline>
            <FormInline>
                <LabelH>{t("Batch")} : </LabelH>
                <AmInput
                    id={"batch"}
                    type="input"
                    style={{ width: "300px" }}
                    onChange={(value, obj, element, event) => onHandleChangeInput(value, null, "batch", null, event)}
                />
            </FormInline>
            <FormInline>
                <LabelH>{t("Lot")} : </LabelH>
                <AmInput
                    id={"lot"}
                    type="input"
                    style={{ width: "300px" }}
                    onChange={(value, obj, element, event) => onHandleChangeInput(value, null, "lot", null, event)}
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
        { Header: 'SKU Name', accessor: 'Name', width: 150, sortable: false },
        { Header: 'Batch', accessor: 'Batch', width: 100, sortable: false },
        { Header: 'Lot', accessor: 'Lot', width: 100, sortable: false },
        { Header: 'Order No.', accessor: 'OrderNo', width: 100, sortable: false },
        {
            Header: 'Qty', accessor: 'baseQty', width: 70, sortable: false,
            Footer: true,
            "Cell": (e) => comma(e.value.toString()),
        },
        { Header: 'Unit', accessor: 'baseUnitType', width: 70, sortable: false },
        {
            Header: 'New', accessor: 'baseQty_evt10', width: 85, sortable: false,
            Footer: true,
            "Cell": (e) => comma(e.value.toString()),
        },
        {
            Header: 'Receiving', accessor: 'baseQty_evt11', width: 85, sortable: false,
            Footer: true,
            "Cell": (e) => comma(e.value.toString()),
        },
        {
            Header: 'Received', accessor: 'baseQty_evt12', width: 85, sortable: false,
            Footer: true,
            "Cell": (e) => comma(e.value.toString()),
        },
        {
            Header: 'QC', accessor: 'baseQty_evt98', width: 85, sortable: false,
            Footer: true,
            "Cell": (e) => comma(e.value.toString()),
        },
        {
            Header: 'Return', accessor: 'baseQty_evt96', width: 85, sortable: false,
            Footer: true,
            "Cell": (e) => comma(e.value.toString()),
        },
        {
            Header: 'Patial', accessor: 'baseQty_evt97', width: 85, sortable: false,
            Footer: true,
            "Cell": (e) => comma(e.value.toString()),
        },
        {
            Header: 'Counting', accessor: 'baseQty_evt13', width: 85, sortable: false,
            Footer: true,
            "Cell": (e) => comma(e.value.toString()),
        },
        {
            Header: 'Counted', accessor: 'baseQty_evt14', width: 85, sortable: false,
            Footer: true,
            "Cell": (e) => comma(e.value.toString()),
        },
        {
            Header: 'Picking', accessor: 'baseQty_evt17', width: 85, sortable: false,
            Footer: true,
            "Cell": (e) => comma(e.value.toString()),
        },
        {
            Header: 'Picked', accessor: 'baseQty_evt18', width: 85, sortable: false,
            Footer: true,
            "Cell": (e) => comma(e.value.toString()),
        },
        {
            Header: 'Hold', accessor: 'baseQty_evt99', width: 85, sortable: false,
            Footer: true,
            "Cell": (e) => comma(e.value.toString()),
        }

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
                exportApi={getAPI}
                excelFooter={true}
            ></AmReport>
        </div>
    )

}

export default withStyles(styles)(CurrentInventory);
