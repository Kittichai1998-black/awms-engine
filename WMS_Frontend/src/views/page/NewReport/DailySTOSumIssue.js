import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import classnames from 'classnames';
import AmReport from '../../pageComponent/AmReportV2/AmReport'
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


const DailySTOSumIssue = (props) => {
    const { t } = useTranslation()
    const { classes } = props;

    const [datavalue, setdatavalue] = useState([]);
    const pageSize = 100;
    const [page, setPage] = useState(0);
    const [totalSize, setTotalSize] = useState(0);
    const [valueText, setValueText] = useState({});
    const MVTQuery = {
        queryString: window.apipath + "/v2/SelectDataViwAPI/",
        t: "DocumentProcessTypeMap",
        q: '[{ "f": "Status", "c":"=", "v": 1},{ "f": "DocumentType_ID", "c":"=", "v": 1002}]',
        f: "ID,Code,ReProcessType_Name as Name",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: "",
    }

    const columns = [
        {
            Header: 'Date', accessor: 'createDate', type: 'datetime', width: 130, sortable: false,
            filterType: "datetime",
            filterConfig: {
                filterType: "datetime",
            }
            , customFilter: { field: "CreateTime" },
            dateFormat: "DD/MM/YYYY"
        },
        { Header: 'Doc No.', accessor: 'docCode', width: 170, sortable: false, Cell: (dataRow) => getRedirect(dataRow.original.docCode) },
        {
            Header: 'Process No.', accessor: 'DocProcessName', width: 220, sortable: false, filterType: "dropdown",
            filterConfig: {
                filterType: "dropdown",
                fieldLabel: ["Code", "Name"],
                dataDropDown: MVTQuery,
                typeDropDown: "normal",
                widthDD: 320,
            },
        },
        { Header: 'SKU Code', accessor: 'pstoCode', width: 120, sortable: false, },
        { Header: 'SKU Name', accessor: 'pstoName', width: 150, sortable: false, filterable: false, },
        { Header: 'Batch', accessor: 'pstoBatch', width: 100, sortable: false, },
        { Header: 'Lot', accessor: 'pstoLot', width: 100, sortable: false, },
        { Header: 'Control No.', accessor: 'pstoOrderNo', width: 100, sortable: false, },
        {
            Header: 'Qty', accessor: 'qty', width: 100, sortable: false,
            Footer: true,
            "Cell": (e) => comma(e.value.toString()), filterable: false,
        },
        { Header: 'Unit', accessor: 'unitType', width: 100, sortable: false, filterable: false, },
        {
            Header: 'Base Qty', accessor: 'baseQty', width: 100, sortable: false,
            Footer: true,
            "Cell": (e) => comma(e.value.toString()), filterable: false,
        },
        { Header: 'Base Unit', accessor: 'baseUnitType', width: 100, sortable: false, filterable: false, },
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
                columnTable={columns}
                dataTable={datavalue}
                excelFooter={true}
                fileNameTable={"DAILYSTO_SUM_ISSUE"}
                typeDoc={1002}
                page={true}
                tableKey={"docID"}
            ></AmReport>
        </div>
    )

}

export default withStyles(styles)(DailySTOSumIssue);