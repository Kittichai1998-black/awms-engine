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

const DailySTOReceive = (props) => {
    const { t } = useTranslation()
    const { classes } = props;

    const [datavalue, setdatavalue] = useState([]);
    const pageSize = 100;
    const [page, setPage] = useState(0);
    const [totalSize, setTotalSize] = useState(0);
    const [valueText, setValueText] = useState({});

    const MVTQuery = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "DocumentProcessType",
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
        q: '[{ "f": "DocumentType_ID", "c":"=", "v": 2004},{ "f": "Status", "c":"<", "v": 2}]',
        f: "ID,Code",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: "",
    }

    const columns = [
        {
            Header: 'Date', accessor: 'createTime', type: 'datetime', width: 130, sortable: false,
            filterType: "datetime",
            filterConfig: {
                filterType: "datetime",
            }
            , customFilter: { field: "CreateTime" },
            dateFormat: "DD/MM/YYYY HH:mm"
        },
        { Header: 'Pallet', accessor: 'bstoCode', width: 120, sortable: false, filterable: false, },
        { Header: 'Doc No.', accessor: 'docCode', width: 120, sortable: false },
        {
            Header: 'Process No.', accessor: 'DocProcessName', width: 220, sortable: false, filterType: "dropdown",
            filterConfig: {
                filterType: "dropdown",
                fieldLabel: ["Name"],
                dataDropDown: MVTQuery,
                typeDropDown: "normal",
                widthDD: 220,
            },
        },
        { Header: 'SKU Code', accessor: 'pstoCode', width: 120, sortable: false, filterable: false, },
        { Header: 'SKU Name', accessor: 'pstoName', width: 150, sortable: false, filterable: false, },
        { Header: 'Batch', accessor: 'pstoBatch', width: 100, sortable: false, filterable: false, },
        { Header: 'Lot', accessor: 'pstoLot', width: 100, sortable: false, filterable: false, },
        { Header: 'Order No.', accessor: 'pstoOrderNo', width: 100, sortable: false, filterable: false, },
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
    const comma = (value) => {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    return (
        <div className={classes.root}>
            <AmReport
                columnTable={columns}
                dataTable={datavalue}
                excelFooter={true}
                fileNameTable={"DAILYSTO_COUNTING"}
                typeDoc={2004}
                page={true}
                tableKey={"docID"}
            ></AmReport>
        </div>
    )

}

export default withStyles(styles)(DailySTOReceive);
