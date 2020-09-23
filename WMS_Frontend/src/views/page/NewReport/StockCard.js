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


const StockCard = (props) => {
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
        q: '[{ "f": "Status", "c":"=", "v": 1},{ "f": "DocumentType_ID", "c":"in", "v": "1001,1002,2004"},{ "f": "ReProcessType_Name", "c":"!=", "v": ""}]',
        f: "ID,Code,ReProcessType_Name as Name",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: "",
    }

    const columns = [
        {
            Header: 'Date', accessor: 'ModifyTime', width: 120, type: "datetime",
            filterType: "datetime",
            filterConfig: {
                filterType: "datetime",
            }
            , customFilter: { field: "ModifyTime" },
            dateFormat: "DD/MM/YYYY HH:mm"
        },
        { Header: 'Doc No.', accessor: 'DocCode', width: 120, sortable: false, filterable: false, },
        { Header: 'SKU Code', accessor: 'SkuCode', width: 120, sortable: false },
        { Header: 'SKU Name', accessor: 'SkuName', width: 150, sortable: false, filterable: false, },
        { Header: 'SKU Type', accessor: 'SkuTypeName', width: 140, sortable: false },
        //{ Header: 'Batch', accessor: 'Batch', width: 100, sortable: false },
        { Header: 'Lot', accessor: 'Lot', width: 100, sortable: false },
        { Header: 'Control No.', accessor: 'Order', width: 100, sortable: false },
        {
            Header: 'Issue', accessor: 'CreditQuantity', width: 70, sortable: false,
            Footer: true, filterable: false,
            //"Cell": (e) => comma(e.value.toString()), filterable: false,
        },
        {
            Header: 'Receive', accessor: 'DebitQuantity', width: 70, sortable: false,
            Footer: true, filterable: false,
            //"Cell": (e) => comma(e.value.toString()), filterable: false,
        },
        {
            Header: 'Total', accessor: 'TotalQuantity', width: 70, sortable: false,
            Footer: true, filterable: false,
            //"Cell": (e) => comma(e.value.toString()), filterable: false,
        },
        { Header: 'Unit', accessor: 'UnitTypeCode', width: 70, sortable: false, filterable: false, },
        {
            Header: 'Process No.', accessor: 'DocProcessTypeName', width: 220, sortable: false, filterable: false
            //filterType: "DocProcessTypeName",
            // filterConfig: {
            //     filterType: "dropdown",
            //     fieldLabel: ["Code", "Name"],
            //     dataDropDown: MVTQuery,
            //     typeDropDown: "normal",
            //     widthDD: 220,
            // },
        },

    ];

    const comma = (value) => {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    return (
        <div className={classes.root}>
            <AmReport
                columnTable={columns}
                dataTable={datavalue}
                fileNameTable={"STC"}
                excelFooter={true}
                tableKey={"stoID"}
            ></AmReport>
        </div>
    )

}

export default withStyles(styles)(StockCard);
