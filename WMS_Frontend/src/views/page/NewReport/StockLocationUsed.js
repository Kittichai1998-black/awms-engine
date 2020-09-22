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


const  StockLocationUsed= (props) => {
    const { t } = useTranslation()
    const { classes } = props;


    const columns = [
        { Header: 'Bank', accessor: 'bank', width: 120, sortable: false },
        { Header: 'Bank Use', accessor: 'bankUse', width: 120, sortable: false, filterable: false, Footer: true, },
        { Header: 'Total Bank', accessor: 'TotalBank', width: 100, sortable: false, Footer: true, filterable: false,},
        {
            Header: 'Percent Bank', accessor: 'PercentBank', width: 100,
            sortable: false, Footer: (data, datarow, e) => SumTotal(data, datarow, e),
            "Cell": (e) => getFormatdata(e.original.PercentBank), filterable: false,
        },
        { Header: 'Bay', accessor: 'bay', width: 120, sortable: false },
        { Header: 'Bay Use', accessor: 'bayUse', width: 150, sortable: false, filterable: false, Footer: true, },
        { Header: 'Total Bay', accessor: 'TotalBay', width: 100, sortable: false, Footer: true, filterable: false, },
        {
            Header: 'Percent Bay', accessor: 'PercentBay', width: 100, sortable: false,
            Footer: (data, datarow, e) => SumTotal(data, datarow, e),
            "Cell": (e) => getFormatdata(e.original.PercentBay),
            filterable: false,
        },
        { Header: 'Level', accessor: 'level', width: 120, sortable: false },
        { Header: 'Level Use', accessor: 'levelUse', width: 150, sortable: false, filterable: false, Footer: true, filterable: false,},
        { Header: 'Total Level', accessor: 'TotalLevel', width: 100, sortable: false, Footer: true, filterable: false, },
        {
            Header: 'Percent Level', accessor: 'PercentLevel', width: 100, sortable: false,
            Footer: (data, datarow, e) => SumTotal(data, datarow, e),
            "Cell": (e) => getFormatdata(e.original.PercentLevel),
            filterable: false,
        },
      
    ];

    const getFormatdata = (data) => {
       // console.log(data.toFixed(2))
        if (data) {
            let per = data.toFixed(3) + '%'
            return per
        }
    }

    const SumTotal = (data, datarow, e) => {
        var Totalper;
        if (e.accessor === 'PercentBank') {
            let usedata = _.sumBy(data, 'bankUse')
            let Totaldata = _.sumBy(data, 'TotalBank')
            Totalper = (usedata / Totaldata) * 100
        } else if (e.accessor === 'PercentBay') {
            let usedata = _.sumBy(data, 'bayUse')
            let Totaldata = _.sumBy(data, 'TotalBay')
            Totalper = (usedata / Totaldata) * 100
        } else if (e.accessor === 'PercentLevel') {
            let usedata = _.sumBy(data, 'levelUse')
            let Totaldata = _.sumBy(data, 'TotalLevel')
            Totalper = (usedata / Totaldata) * 100
        }
         let totalPerCent =Totalper.toFixed(3) + '%'

        return totalPerCent
    }

    return (
        <div className={classes.root}>
            <AmReport
                columnTable={columns}
                page={true}
                excelFooter={true}
                fileNameTable={"STOCKUSE"}
                tableKey={"Code"}
            ></AmReport>
        </div>
    )

}

export default withStyles(styles)(StockLocationUsed);
