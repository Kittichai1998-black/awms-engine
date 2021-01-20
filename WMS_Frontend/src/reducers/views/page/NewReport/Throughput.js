import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import classnames from 'classnames';
import AmReport from '../../pageComponent/AmReportV2/AmReport'
//import AmReport from '../../../components/AmReport'
import AmButton from '../../../components/AmButton'
import AmFindPopup from '../../../components/AmFindPopup'
import { apicall } from '../../../components/function/CoreFunction'
import { withStyles } from '@material-ui/core/styles';
import AmDropdown from '../../../components/AmDropdown';
import styled from 'styled-components'
import AmInput from "../../../components/AmInput";
import _ from "lodash";
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


const Throughput = (props) => {
    const { t } = useTranslation()
    const { classes } = props;


    const columns = [
        {
            Header: 'Start Date', accessor: 'StartTime', type: 'datetime', width: 130, sortable: false,
            filterType: "datetime",
            filterConfig: {
                filterType: "datetime",
            }
            , customFilter: { field: "StartTime" },
            dateFormat: "DD/MM/YYYY"
        },
        { Header: 'In', accessor: 'count', width: 120, sortable: false },
        { Header: 'Out', accessor: 'IOType', width: 120, sortable: false },
        { Header: 'Hour', accessor: 'hour', width: 120, sortable: false },
        { Header: 'Day', accessor: 'day', width: 120, sortable: false },
        { Header: 'Month', accessor: 'month', width: 120, sortable: false },
        { Header: 'Year', accessor: 'year', width: 120, sortable: false }

    ];


    return (
        <>
            <AmReport
                columnTable={columns}
                page={true}
                excelFooter={true}
                fileNameTable={"THROUGHPUT"}
                tableKey={"Code"}
            ></AmReport>
        </>
    )

}

export default withStyles(styles)(Throughput);
