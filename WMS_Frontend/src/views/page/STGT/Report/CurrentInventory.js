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
    width: 140px; 
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
    const onGetALL = () => {
        return window.apipath + "/v2/GetSPReportAPI?"
            + "&packCode=" + (valueText.packCode === undefined || valueText.packCode === null ? '' : encodeURIComponent(valueText.packCode.trim()))
            + "&packName=" + (valueText.packName === undefined || valueText.packName === null ? '' : encodeURIComponent(valueText.packName.trim()))
            + "&orderNo=" + (valueText.orderNo === undefined || valueText.orderNo === null ? '' : encodeURIComponent(valueText.orderNo.trim()))
            + "&spname=CURRENTINV_STOSUM";
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
    const GetBodyReports = () => {
        return <div style={{ display: "inline-block" }}>
            <FormInline>
                <LabelH>{t('Reorder (Item Code)')} : </LabelH>
                <AmInput
                    id={"packCode"}
                    type="input"
                    style={{ width: "300px" }}
                    onChange={(value, obj, element, event) => onHandleChangeInput(value, null, "packCode", null, event)}
                    onKeyPress={(value, obj, element, event) => onHandleEnterInput(value, null, "packCode", null, event)}
                />
            </FormInline>
            <FormInline>
                <LabelH>{t('Reorder (Item Name)')} : </LabelH>
                <AmInput
                    id={"packName"}
                    type="input"
                    style={{ width: "300px" }}
                    onChange={(value, obj, element, event) => onHandleChangeInput(value, null, "packName", null, event)}
                    onKeyPress={(value, obj, element, event) => onHandleEnterInput(value, null, "packName", null, event)}
                />
            </FormInline>
            <FormInline>
                <LabelH>{t("SI (Order No.)")} : </LabelH>
                <AmInput
                    id={"orderNo"}
                    type="input"
                    style={{ width: "300px" }}
                    onChange={(value, obj, element, event) => onHandleChangeInput(value, null, "orderNo", null, event)}
                    onKeyPress={(value, obj, element, event) => onHandleEnterInput(value, null, "orderNo", null, event)}
                />
            </FormInline>
        </div>

    }
    const customBtnSelect = () => {
        return <AmButton styleType="confirm" onClick={onGetDocument} style={{ marginRight: "5px" }}>{t('Select')}</AmButton>
    }
    const columns = [
        { Header: 'SI.', accessor: 'OrderNo', width: 70, sortable: false },
        { Header: 'Reorder', accessor: 'Code', width: 120, sortable: false },
        { Header: 'Brand', accessor: 'Name', width: 200, sortable: false },
        { Header: 'Size', accessor: 'skuTypeCode', width: 70, sortable: false },
        { Header: 'Carton No.', accessor: 'cartonNo', sortable: false },
        {
            Header: 'Base Qty', accessor: 'baseQty', width: 90, sortable: false,
            Footer: true,
            "Cell": (e) => comma(e.value.toString())
        },
        { Header: 'Base Unit', accessor: 'baseUnitType', width: 90, sortable: false },
        {
            Header: 'Qty', accessor: 'qty', width: 90, sortable: false,
            Footer: true,
            "Cell": (e) => comma(e.value.toString())
        },
        { Header: 'Unit', accessor: 'unitType', width: 90, sortable: false },
        {
            Header: 'Receiving', accessor: 'baseQty_evt11', width: 70, sortable: false,
            Footer: true,
            "Cell": (e) => comma(e.value.toString()),
            getProps: (state, rowInfo) => ({
                style: {
                    backgroundColor: 'rgb(224, 235, 235, 0.7)'

                }
            })
        },
        {
            Header: 'Received', accessor: 'baseQty_evt12', width: 70, sortable: false,
            Footer: true,
            "Cell": (e) => comma(e.value.toString()),
            getProps: (state, rowInfo) => ({
                style: {
                    backgroundColor: 'rgb(224, 235, 235, 0.7)'
                }
            })
        },
        {
            Header: 'QC', accessor: 'baseQty_evt98', width: 70, sortable: false,
            Footer: true,
            "Cell": (e) => comma(e.value.toString()),
            getProps: (state, rowInfo) => ({
                style: {
                    backgroundColor: 'rgb(224, 235, 235, 0.7)'
                }
            })
        },
        {
            Header: 'Return', accessor: 'baseQty_evt96', width: 70, sortable: false,
            Footer: true,
            "Cell": (e) => comma(e.value.toString()),
            getProps: (state, rowInfo) => ({
                style: {
                    backgroundColor: 'rgb(224, 235, 235, 0.7)'
                }
            })
        },
        {
            Header: 'Partial', accessor: 'baseQty_evt97', width: 70, sortable: false,
            Footer: true,
            "Cell": (e) => comma(e.value.toString()),
            getProps: (state, rowInfo) => ({
                style: {
                    backgroundColor: 'rgb(224, 235, 235, 0.7)'
                }
            })
        },
        {
            Header: 'Counting', accessor: 'baseQty_evt13', width: 70, sortable: false,
            Footer: true,
            "Cell": (e) => comma(e.value.toString()),
            getProps: (state, rowInfo) => ({
                style: {
                    backgroundColor: 'rgb(224, 235, 235, 0.7)'
                }
            })
        },
        {
            Header: 'Counted', accessor: 'baseQty_evt14', width: 70, sortable: false,
            Footer: true,
            "Cell": (e) => comma(e.value.toString()),
            getProps: (state, rowInfo) => ({
                style: {
                    backgroundColor: 'rgb(224, 235, 235, 0.7)'
                }
            })
        },
        {
            Header: 'Picking', accessor: 'baseQty_evt17', width: 70, sortable: false,
            Footer: true,
            "Cell": (e) => comma(e.value.toString()),
            getProps: (state, rowInfo) => ({
                style: {
                    backgroundColor: 'rgb(224, 235, 235, 0.7)'
                }
            })
        },
        {
            Header: 'Hold', accessor: 'baseQty_evt99', width: 70, sortable: false,
            Footer: true,
            "Cell": (e) => comma(e.value.toString()),
            getProps: (state, rowInfo) => ({
                style: {
                    backgroundColor: 'rgb(224, 235, 235, 0.7)'
                }
            })
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
                exportApi={onGetALL()}
                excelFooter={true}
                fileNameTable={"CURINV"}
            ></AmReport>
        </div>
    )
}

export default withStyles(styles)(CurrentInventory);
