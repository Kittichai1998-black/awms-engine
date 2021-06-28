import React, { useState, useEffect } from "react";
import AmReport from '../../../../components/AmReport'
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


const WCS_Queue = (props) => {
    const { t } = useTranslation()
    const { classes } = props;

    const [datavalue, setdatavalue] = useState([]);
    const pageSize = 100;
    const [totalSize, setTotalSize] = useState(0);

    const onGetDocument = () => {
        let pathGetAPI = window.apipath + "/v2/WCS_Queue_Front?";

        Axios.get(pathGetAPI,true).then((rowselect1) => {
            if (rowselect1) {
                if (rowselect1.data._result.status !== 0) {
                    setdatavalue(rowselect1.data.datas)
                    setTotalSize(rowselect1.data.datas[0] ? rowselect1.data.datas[0].totalRecord : 0)
                }
            }
            
            setTimeout(() => {
                onGetDocument();
            }, 10000);
        });
    }

    useEffect(() => {
        onGetDocument();
    }, [true])

    
    const columns = [
        { Header: 'Time', accessor: 'ActualTime2',width: 100,  sortable: false },
        { Header: 'Warehouse', accessor: 'Warehouse_name', width: 120, sortable: false },
        { Header: 'Station', accessor: 'Station_name',width: 100, sortable: false },
        { Header: 'Bay', accessor: 'BAY', width: 50, sortable: false },
        { Header: 'Lv', accessor: 'FLOORs', width: 50, sortable: false },
        { Header: 'Machine', accessor: 'Code_shu', width: 100, sortable: false },
        { Header: 'Work', accessor: 'TypeNameWork',width: 270,  sortable: false },
        { Header: 'Status', accessor: 'QueueStatusname',width: 300,  sortable: false },
        { Header: 'Item No', accessor: 'BC_PALLET', width: 200,sortable: false },
        { Header: 'Remark', accessor: 'Remark' ,width:400,sortable: false },
    ];

    return (
        <div className={classes.root}>
            <AmReport
                columnTable={columns}
                dataTable={datavalue}
                pageSize={pageSize}
                totalSize={totalSize}
                page={false}
                excelFooter={false}
                fileNameTable={"CURINV"}
            ></AmReport>
        </div>
    )

}

export default withStyles(styles)(WCS_Queue);
