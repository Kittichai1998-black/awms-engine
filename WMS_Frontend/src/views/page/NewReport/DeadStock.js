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


const  DeadStock = (props) => {
    const { t } = useTranslation()
    const { classes } = props;


    const columns = [
        {
            Header: 'Recive Date', accessor: 'ReciveDate', type: 'datetime', width: 130, sortable: false,
            filterType: "datetime",
            filterConfig: {
                filterType: "datetime",
            }
            , customFilter: { field: "ReciveDate" },
            dateFormat: "DD/MM/YYYY"
        },
        { Header: 'Code', accessor: 'Code', width: 120, sortable: false },
        { Header: 'Name', accessor: 'Name', width: 120, sortable: false },
        { Header: 'Recive Date', accessor: 'ReciveDate', width: 120, sortable: false, filterable: false, type: 'datetime', dateFormat: "DD/MM/YYYY" },
        { Header: 'ShelfLife Date', accessor: 'ShelfLifeDate', width: 120, sortable: false, filterable: false, type: 'datetime', dateFormat: "DD/MM/YYYY"},
        { Header: 'Shelf Day', accessor: 'TotalShelfDay', width: 120, sortable: false, filterable: false, },
        { Header: 'Recive Day', accessor: 'TotalRecive', width: 120, sortable: false, filterable: false, },
      
    ];

    const getFormatdata = (data) => {
       // console.log(data.toFixed(2))
        let per = data.toFixed(3) + '%'
        return per
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
         let totalPerCent = Totalper.toFixed(3) + '%'

        return totalPerCent
    }

    return (
        <div className={classes.root}>
            <AmReport
                columnTable={columns}
                page={true}
                excelFooter={true}
                fileNameTable={"DEADSTOCK"}
                tableKey={"Code"}
            ></AmReport>
        </div>
    )

}

export default withStyles(styles)(DeadStock);
