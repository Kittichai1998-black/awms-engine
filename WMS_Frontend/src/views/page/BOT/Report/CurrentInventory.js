import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import classnames from 'classnames';
import AmReport from '../../../pageComponent/AmReportV2/AmReport'
//import AmReport from '../../../components/AmReport'
import { apicall } from '../../../../components/function/CoreFunction'
import { withStyles } from '@material-ui/core/styles';
import styled from 'styled-components'
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
    const columns = [
        { Header: 'สินค้า', accessor: 'Code', width: 120, sortable: false },
        //{ Header: 'Item Name', accessor: 'Name', width: 150, sortable: false, filterable: false, },
        //{ Header: 'Batch', accessor: 'Batch', width: 100, sortable: false },      
        {
            Header: 'จำนวน', accessor: 'qty', width: 70, sortable: false,
            Footer: true,
            filterable: false,
            "Cell": (e) => comma(e.value.toString()),
        },
        { Header: 'หน่วย', accessor: 'unitType', filterable: false, width: 70, sortable: false },
        {
            Header: 'Receiving', accessor: 'qty_evt11', width: 85, sortable: false,
            Footer: true,
            filterable: false,
            "Cell": (e) => comma(e.value.toString()),
        },
        {
            Header: 'Received', accessor: 'qty_evt12', width: 85, sortable: false,
            Footer: true,
            filterable: false,
            "Cell": (e) => comma(e.value.toString()),
        },
        {
            Header: 'Auditing', accessor: 'qty_evt13', width: 85, sortable: false,
            Footer: true,
            filterable: false,
            "Cell": (e) => comma(e.value.toString()),
        },
        {
            Header: 'Audited', accessor: 'qty_evt14', width: 85, sortable: false,
            Footer: true,
            filterable: false,
            "Cell": (e) => comma(e.value.toString()),
        },
        {
            Header: 'Picking', accessor: 'qty_evt33', width: 85, sortable: false,
            Footer: true,
            filterable: false,
            "Cell": (e) => comma(e.value.toString()),
        },
        {
            Header: 'Picked', accessor: 'qty_evt34', width: 85, sortable: false,
            Footer: true,
            filterable: false,
            "Cell": (e) => comma(e.value.toString()),
        },
    ];

    const comma = (value) => {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    return (
        <>
            <AmReport
                columnTable={columns}
                page={true}
                excelFooter={true}
                fileNameTable={"CURINV"}
                tableKey={"Code"}
            //groupBy={true}
            ></AmReport>
        </>
    )

}

export default withStyles(styles)(CurrentInventory);
