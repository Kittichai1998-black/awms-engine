import React, { useState, useEffect, useRef, useMemo } from "react";
import Axios from "axios";
import { makeStyles } from '@material-ui/core/styles';
import {Paper,Table,TableBody,TableCell,TableContainer,TableHead,TablePagination,TableRow,Snackbar,CircularProgress } from '@material-ui/core';
import {Button,TextField, Dialog, DialogActions,DialogContent,DialogContentText,DialogTitle,InputAdornment } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import GCLService from '../../../components/function/GCLService'
import {AddCircleOutline,CloseSharp,BrightnessHigh,Extension,Save} from '@material-ui/icons'

const tableHaderColumns = [
    {id: 'CreateTime', label: 'Time', minWidth: 120, align: 'center'},
    {id: 'Title', label: 'Title', minWidth: 120 ,align:'center'},
    {id: 'Message',label: 'Message', minWidth: 120,align:'center' },

  ];

const NotifyDaily=(props)=>{
  const [dataTable, setDataTable] = useState([]);
  const [isLoadingdataTable, setIsLoadingdataTable] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [toast,setToast] = useState({msg:null,open:false,type:null});

  useEffect(() => {
    // textFieldForGateCode.current.focus()
    loadDataTable()
    //on component unmount
    return () => {
        
    }
  }, [])

  const loadDataTable=async()=>{
    setIsLoadingdataTable(true)
    let pathGetAPI = window.apipath + "/v2/get_notify?userId=1&l=100&sk=0&apikey=free01"
    setIsLoadingdataTable(false)
        Axios.get(pathGetAPI).then((rowselect1) => {
            if (rowselect1) {
                if (!rowselect1.data._result.status) {
                  setToast({msg:"Load data fail : "+rowselect1.data._result.message ,open:true,type:'error'})
                return ;
                }
                setDataTable(rowselect1.data.messageDetails)
            }
        })
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };


  return (
    <Paper elevation={0} style={{width: '100%',height:'100%', padding:10}}>
    <Paper elevation={2} style={{width: '100%',minWidth:500,margin:'auto',marginBottom:20,maxWidth:800}}>
        <div>
            <TableContainer className="tableCustom" style={{maxHeight: 400}}>
                <Table stickyHeader aria-label="sticky table">
                <TableHead>
                    <TableRow>
                    {tableHaderColumns.map((column) => (
                        <TableCell
                        key={column.id}
                        align={column.align}
                        style={{ minWidth: column.minWidth, backgroundColor:'#DDD',padding:10 }} >
                        {column.label}
                        </TableCell>
                    ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {isLoadingdataTable &&
                      <TableRow>
                        <TableCell align='center' colSpan='11'>
                          <CircularProgress color='primary' size={50}/>
                        </TableCell>
                      </TableRow>
                    }
                    {dataTable.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row,index) => {
                    return (
                      <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                        {tableHaderColumns.map((column) => {
                            const value = row[column.id];
                            if(column.id=='CreateTime'){
                              return (
                                <TableCell key={column.id} align={column.align} style={{padding:10}}>
                                    {value.split("T").join("\n").split(".")[0]}
                                </TableCell>
                              );
                            }
                            return (
                            <TableCell key={column.id} align={column.align} style={{padding:10, overflowWrap: 'anywhere'}}>
                                {column.format ? column.format(value) : value}
                            </TableCell>
                            );
                        })}
                      </TableRow>
                    );
                    })}
                    {(dataTable.length<=0 && !isLoadingdataTable) &&
                    <TableRow>
                        <TableCell colSpan='11' align='center'>
                          <Alert severity='info' >Empty Data</Alert>
                        </TableCell>
                    </TableRow>
                    }
                </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[10, 30, 100]}
                component="div"
                count={dataTable.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onChangePage={handleChangePage}
                onChangeRowsPerPage={handleChangeRowsPerPage}
            />
        </div>
    </Paper>
    
    {toast.open &&
      <Snackbar anchorOrigin={{ vertical:'top', horizontal:'center' }} open={toast.open} autoHideDuration={5000} onClose={()=>setToast({msg:"",open:false,type:""})}>
        <Alert elevation={6} variant="filled" onClose={()=>setToast({msg:"",open:false,type:""})} severity={toast.type}>
          {toast.msg}
        </Alert>
      </Snackbar>
      }
    </Paper>
  )
}

export default NotifyDaily