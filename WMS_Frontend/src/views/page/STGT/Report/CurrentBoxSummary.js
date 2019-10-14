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


const CurrentBoxSummary = (props) => {
    const { classes } = props;

    const [datavalue, setdatavalue] = useState([]);
    const pageSize = 100;
    const [page, setPage] = useState(0);
    const [totalSize, setTotalSize] = useState(0);
    const [valueText, setValueText] = useState({});

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
    const ObjectSizeQuery = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "ObjectSize",
        q: '[{ "f": "Status", "c":"<", "v": 2},{ "f": "ObjectType", "c":"=", "v": 1}]',
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
    const onGetDocument = () => {
        Axios.get(window.apipath + "/v2/GetSPReportAPI?" +
            "&getMapSto=true&_token=" +
            localStorage.getItem("Token")
            + "&forCustomerID=" + (valueText.forCustomerID === undefined || valueText.forCustomerID.value === undefined || valueText.forCustomerID.value === null ? '' : encodeURIComponent(valueText.forCustomerID.value))
            + "&objectSizeID=" + (valueText.objectSizeID === undefined || valueText.objectSizeID.value === undefined || valueText.objectSizeID.value === null ? '' : encodeURIComponent(valueText.objectSizeID.value))
            + "&page=" + (page === undefined || null ? 0 : page)
            + "&limit=" + (pageSize === undefined || null ? 100 : pageSize)
            + "&spname=CURRENTBOX_SUMMARY").then((rowselect1) => {
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

        valueText[inputID] = {
            value: value,
            dataObject: dataObject,
            fieldDataKey: fieldDataKey,
        }
    };
    const GetBodyReports = () => {
        return <div style={{ display: "inline-block" }}>
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
            <FormInline>
                <LabelH>Box Size : </LabelH>
                <AmDropdown
                    id={'objectSizeID'}
                    fieldDataKey={"ID"}
                    fieldLabel={["Code", "Name"]}
                    labelPattern=" : "
                    width={300}
                    placeholder="Select Size"
                    ddlMinWidth={300}
                    zIndex={1000}
                    returnDefaultValue={true}
                    queryApi={ObjectSizeQuery}
                    onChange={(value, dataObject, inputID, fieldDataKey) => onHandleChangeInput(value, dataObject, 'objectSizeID', fieldDataKey, null)}
                    ddlType={'search'}
                />
            </FormInline>
        </div>

    }
    const customBtnSelect = () => {
        return <div>
            <AmButton styleType="confirm" onClick={onGetDocument} style={{ marginRight: "5px" }}>{'Select'}</AmButton>
        </div>
    }
    const columns = [
        {
            Header: 'Customer Code', accessor: 'forCustomerCode', sortable: false,width: 100,
            // Cell: (e) => e.original.forCustomerCode && e.original.forCustomerName ? <label>{e.original.forCustomerCode} : {e.original.forCustomerName}</label> : e.original.forCustomerCode
        },
        {
            Header: 'Customer Name', accessor: 'forCustomerName', sortable: false,
        },
        {
            Header: 'Size Code', accessor: 'ObjectSizeCode', sortable: false,width: 100,
            // Cell: (e) => e.original.ObjectSizeCode && e.original.ObjectSizeCode ? <label>{e.original.ObjectSizeCode} : {e.original.ObjectSizeName}</label> : e.original.ObjectSizeCode
        },
        {
            Header: 'Size Name', accessor: 'ObjectSizeName', sortable: false,
        },
        { Header: 'Qty', accessor: 'baseQty', width: 100, sortable: false },
        { Header: 'Unit', accessor: 'baseUnitType', width: 100, sortable: false },
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
                exportData={true}
                renderCustomButton={customBtnSelect()}
                page={true}
            ></AmReport>


        </div>
    )

}

export default withStyles(styles)(CurrentBoxSummary);
