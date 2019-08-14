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
import AmExportExcel from '../../../../components/AmExportExcel';

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
    const { classes } = props;

    const [datavalue, setdatavalue] = useState([]);
    const pageSize = 100;
    const [page, setPage] = useState(0);
    const [totalSize, setTotalSize] = useState(0);
    const [valueText, setValueText] = useState({});

    const [dataReport, setDataReport] = useState([]);
    const [isLoad, setIsLoad] = useState(false);
    const [dataExport, setDataExport] = useState([]);
    const [colsExcel, setColsExcel] = useState([]);

    const CustomerQuery = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "Customer",
        q: '[{ "f": "Status", "c":"<", "v": 2}]',
        f: "*",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: "",
    }

    useEffect(() => {
        // console.log(page);
        onGetDocument()
    }, [page])
    const onGetDocument = () => {
        Axios.get(window.apipath + "/v2/GetSPReportAPI?apikey=FREE01"
            + "&packCode=" + (valueText.packCode === undefined || valueText.packCode.value === undefined || valueText.packCode.value === null ? '' : encodeURIComponent(valueText.packCode.value.trim()))
            + "&packName=" + (valueText.packName === undefined || valueText.packName.value === undefined || valueText.packName.value === null ? '' : encodeURIComponent(valueText.packName.value.trim()))
            // + "&batch=" + (valueText.batch === undefined || valueText.batch.value === undefined || valueText.batch.value === null ? '' : encodeURIComponent(valueText.batch.value.trim()))
            + "&lot=" + (valueText.lot === undefined || valueText.lot.value === undefined || valueText.lot.value === null ? '' : encodeURIComponent(valueText.lot.value.trim()))
            // + "&orderNo=" + (valueText.orderNo === undefined || valueText.orderNo.value === undefined || valueText.orderNo.value === null ? '' : encodeURIComponent(valueText.orderNo.value.trim()))
            + "&forCustomerID=" + (valueText.forCustomerID === undefined || valueText.forCustomerID.value === undefined || valueText.forCustomerID.value === null ? '' : encodeURIComponent(valueText.forCustomerID.value))
            + "&isGroupBatch=0"
            + "&isGroupOrderNo=0"
            // + "&isGroupLot=0"
            + "&page=" + (page === undefined || null ? 0 : page)
            + "&limit=" + (pageSize === undefined || null ? 100 : pageSize)
            + "&spname=CURRENTINV_STOSUM").then((rowselect1) => {
                if (rowselect1) {
                    if (rowselect1.data._result.status !== 0) {
                        setdatavalue(rowselect1.data.datas)
                        setTotalSize(rowselect1.data.datas[0] ? rowselect1.data.datas[0].totalRecord : 0)
                        onGetReportDocument();
                    }
                }
            })
    }

    const onGetReportDocument = () => {

        Axios.get(window.apipath + "/v2/GetSPReportAPI?apikey=FREE01"
            + "&packCode=" + (valueText.packCode === undefined || valueText.packCode.value === undefined || valueText.packCode.value === null ? '' : encodeURIComponent(valueText.packCode.value.trim()))
            + "&packName=" + (valueText.packName === undefined || valueText.packName.value === undefined || valueText.packName.value === null ? '' : encodeURIComponent(valueText.packName.value.trim()))
            + "&lot=" + (valueText.lot === undefined || valueText.lot.value === undefined || valueText.lot.value === null ? '' : encodeURIComponent(valueText.lot.value.trim()))
            + "&forCustomerID=" + (valueText.forCustomerID === undefined || valueText.forCustomerID.value === undefined || valueText.forCustomerID.value === null ? '' : encodeURIComponent(valueText.forCustomerID.value))
            + "&isGroupBatch=0"
            + "&isGroupOrderNo=0"
            + "&isGroupLot=0"
            + "&page=" + (page === undefined || null ? 0 : page)
            + "&limit=" + (pageSize === undefined || null ? 100 : pageSize)
            + "&spname=CURRENTINV_STOSUM").then((rowselect1) => {
                if (rowselect1) {
                    if (rowselect1.data._result.status !== 0) {
                        setDataReport(rowselect1.data.datas);
                    }
                }
            })
    }
    const onLoadExcel = (data, col) => {
        setColsExcel(col)
        setDataExport(data)
        setIsLoad(true);
    }
    const onToggleLoadExcel = (val) => {
        setIsLoad(val);
        if (val === false) {
            setColsExcel([])
            setDataExport([])
        }
    }
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
                <LabelH>Part NO. : </LabelH>
                <AmInput
                    id={"packCode"}
                    type="input"
                    style={{ width: "300px" }}
                    onChange={(value, obj, element, event) => onHandleChangeInput(value, null, "packCode", null, event)}
                />
            </FormInline>
            <FormInline>
                <LabelH>Part Name : </LabelH>
                <AmInput
                    id={"packName"}
                    type="input"
                    style={{ width: "300px" }}
                    onChange={(value, obj, element, event) => onHandleChangeInput(value, null, "packName", null, event)}
                />
            </FormInline>
            {/* <FormInline>
                <LabelH>Batch : </LabelH>
                <AmInput
                    id={"batch"}
                    type="input"
                    style={{ width: "300px" }}
                    onChange={(value, obj, element, event) => onHandleChangeInput(value, null, "batch", null, event)}
                />
            </FormInline> */}
            <FormInline>
                <LabelH>Lot : </LabelH>
                <AmInput
                    id={"lot"}
                    type="input"
                    style={{ width: "300px" }}
                    onChange={(value, obj, element, event) => onHandleChangeInput(value, null, "lot", null, event)}
                />
            </FormInline>
            {/* <FormInline>
                <LabelH>Order No. : </LabelH>
                <AmInput
                    id={"orderNo"}
                    type="input"
                    style={{ width: "300px" }}
                    onChange={(value, obj, element, event) => onHandleChangeInput(value, null, "orderNo", null, event)}
                />
            </FormInline> */}
            <FormInline>
                <LabelH>Customer : </LabelH>
                <AmDropdown
                    id={'forCustomerID'}
                    fieldDataKey={"ID"}
                    fieldLabel={["Code", "Name"]}
                    labelPattern=" : "
                    width={300}
                    placeholder="Select Customer"
                    ddlMinWidth={300}
                    zIndex={1000}
                    returnDefaultValue={true}
                    queryApi={CustomerQuery}
                    onChange={(value, dataObject, inputID, fieldDataKey) => onHandleChangeInput(value, dataObject, 'forCustomerID', fieldDataKey, null)}
                    ddlType={'search'}
                />
            </FormInline>
        </div>

    }
    const customBtnSelect = () => {
        return <div>
            <AmButton styleType="confirm" onClick={onGetDocument} style={{ marginRight: "5px" }}>{'Select'}</AmButton>
            <AmButton styleType="add" onClick={(e) => onLoadExcel(dataReport, colsReport)} style={{ marginRight: "5px" }}>{'Export Report'}</AmButton>
            <AmButton styleType="warning" onClick={(e) => onLoadExcel(datavalue, columns)} style={{ marginRight: "5px" }}>{'Export Excel'}</AmButton>

        </div>
    }
    const columns = [
        {
            Header: 'Customer', accessor: 'forCustomerCode', width: 100, sortable: false,
            // Cell: (e) => e.original.forCustomerCode && e.original.forCustomerName ? <label>{e.original.forCustomerCode} : {e.original.forCustomerName}</label> : e.original.forCustomerCode
        },
        { Header: 'Part NO.', accessor: 'Code', width: 120, sortable: false },
        { Header: 'Part Name', accessor: 'Name', width: 200, sortable: false },
        // { Header: 'Batch', accessor: 'Batch', width: 100, sortable: false },
        { Header: 'Lot', accessor: 'Lot', width: 100, sortable: false },
        // { Header: 'Order No.', accessor: 'OrderNo', width: 100, sortable: false },
        // { Header: 'For Customer', accessor: 'forCustomerName', width: 200, sortable: false },
        // { Header: 'Qty New', accessor: 'baseQty_evt10', width: 85, sortable: false },
        { Header: 'Qty Receiving', accessor: 'baseQty_evt11', sortable: false },
        { Header: 'Qty Received', accessor: 'baseQty_evt12', sortable: false },
        { Header: 'Qty Counting', accessor: 'baseQty_evt13', sortable: false },
        { Header: 'Qty Counted', accessor: 'baseQty_evt14', sortable: false },
        { Header: 'Qty Picking', accessor: 'baseQty_evt17', sortable: false },
        // { Header: 'Qty Picked', accessor: 'baseQty_evt18', width: 85, sortable: false },

        { Header: 'Qty', accessor: 'baseQty', width: 70, sortable: false },
        { Header: 'Unit', accessor: 'baseUnitType', width: 70, sortable: false },

    ];

    const colsReport = [
        { Header: 'CUSTOMER', accessor: 'forCustomerCode' },
        { Header: 'PART NO.', accessor: 'Code' },
        { Header: 'PART NAME', accessor: 'Name' },
        { Header: 'STOCK / PCS', accessor: 'baseQty' },
        { Header: 'REMARK' },
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
                exportData={false}
                renderCustomButton={customBtnSelect()}
                page={true}
            // sumwhere={"Unit"}
            ></AmReport>

            <AmExportExcel data={dataExport} headerItemNo={"ITEM"} fileName={"CurReport"} columns={colsExcel} isLoading={isLoad} onToggleLoad={value => onToggleLoadExcel(value)} />

        </div>
    )

}

export default withStyles(styles)(CurrentInventory);
