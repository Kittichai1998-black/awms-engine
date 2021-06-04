import React, { useState, useEffect, useRef, useMemo } from "react";
import Axios from "axios";
import { makeStyles } from '@material-ui/core/styles';
import {Paper,Table,TableBody,TableCell,TableContainer,TableHead,TablePagination,TableRow,Snackbar,CircularProgress } from '@material-ui/core';
import {Button,TextField, Dialog, DialogActions,DialogContent,DialogContentText,DialogTitle,InputAdornment } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import GCLService from '../../../../components/function/GCLService'
import {AddCircleOutline,CloseSharp,BrightnessHigh,Extension,Save} from '@material-ui/icons'

const tableHaderColumns = [
    {id: 'time', label: 'Time', minWidth: 120, align: 'center'},
    {id: 'location', label: 'Gate\u00a0Code', minWidth: 170 },
    {id: 'shuttle',label: 'Shuttle Pallet', minWidth: 170, },
    {id: 'result',label: 'Result', minWidth: 170},
  ];

const ScanShuttleCheckOut=(props)=>{
  const [dataTable, setDataTable] = useState([]);
  const [isLoadingdataTable, setIsLoadingdataTable] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isLoading,setIsLoading]=useState(false)
  const [toast,setToast] = useState({msg:null,open:false,type:null});

  const [gate_code,setGateCode]=useState(props.gateCode||"");
  const [shuttle,setShuttle]=useState(props.shuttle || "");

  const textFieldForGateCode = useRef(null);

  useEffect(() => {
    textFieldForGateCode.current.focus()
    loadDataTable()
    //on component unmount
    return () => {
        
    }
  }, [])

  const loadDataTable=async()=>{
    setIsLoadingdataTable(true)
    GCLService.post('/v2/Shuttle_ActionResult_Front',{mode:2}).then(res=>{
      setIsLoadingdataTable(false)
      if(GCLService.isMockData)return setDataTable(GCLService.mockDataGCL.shuttleResult)
      if(!res.data._result.status) {
        setToast({msg:"Load data fail : "+res.data._result.message ,open:true,type:'error'})
        return ;
      }
      setDataTable(res.data.datas)
    })
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const onPost=()=>{
    if(shuttle=="")return;
    setIsLoading(true)
    let reqData={mode:2, shuttle:shuttle}
    if(gate_code!="")reqData.location=gate_code
    GCLService.post('/v2/Shuttle_CheckIn_Front',reqData).then(res=>{
      setIsLoading(false)
      textFieldForGateCode.current.focus()
      if(!res.data._result.status) {
        setGateCode("")
        setShuttle("")
        setToast({msg:"Fail : "+res.data._result.message ,open:true,type:'error'})
        return ;
      }

      loadDataTable()
      setGateCode("")
      setShuttle("")
      setToast({msg:"Success",open:true,type:'success'})
    })
  }

  return (
    <Paper elevation={0} style={{width: '100%',height:'100%', padding:10}}>
    <Paper elevation={0} style={{width: '100%',margin:'auto',marginBottom:25,maxWidth:800,padding:20}}>
        <div>
            <TextField 
                style={{marginBottom:20}}
                type="text"
                id="shuttle" 
                label="Shuttle" 
                fullWidth required 
                value={shuttle}
                inputRef={textFieldForGateCode}
                autoComplete='off'
                InputProps={{
                    startAdornment: (<InputAdornment position="start"><Extension /> </InputAdornment>),
                }}
                onChange={(event)=>setShuttle(event.target.value)}
                onKeyPress={(event)=>{if(event.key === "Enter")onPost()}}
            />
            <Button variant="contained" color="primary" fullWidth startIcon={isLoading?<CircularProgress color='inherit' size={30}/>:<Save/>} onClick={onPost}>POST</Button>
        </div>
    </Paper>
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

export default ScanShuttleCheckOut