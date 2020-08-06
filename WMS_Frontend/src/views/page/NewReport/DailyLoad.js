import React, { useState, useEffect } from "react";

import AmReport from '../../pageComponent/AmReportV2/AmReport'
import AmButton from '../../../components/AmButton'
import { apicall } from '../../../components/function/CoreFunction'
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



const DailyLoad = (props) => {
    const { t } = useTranslation()
    const { classes } = props;

    const [datavalue, setdatavalue] = useState([]);


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
        { Header: 'Transport Code', accessor: 'TransportObjectCode', width: 120, sortable: false },
        { Header: 'Transport Car', accessor: 'transportCar', width: 120, sortable: false },
        { Header: 'Driver Name', accessor: 'DriverName', width: 120, sortable: false },
        { Header: 'Doc No.', accessor: 'docCode', width: 120, sortable: false },
        { Header: 'Pallet', accessor: 'bstoCode', width: 120, sortable: false, filterable: false, },

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
                fileNameTable={"DAILY_LOAD"}
                typeDoc={1001}
                page={true}
                tableKey={"ID"}
            ></AmReport>
        </div>
    )

}

export default withStyles(styles)(DailyLoad);