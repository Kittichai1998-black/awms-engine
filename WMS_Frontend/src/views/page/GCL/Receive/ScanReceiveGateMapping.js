import React, { useState, useEffect, useRef, useMemo } from "react";
import Axios from "axios";
import { makeStyles } from '@material-ui/core/styles';
import {Paper,Table,TableBody,TableCell,TableContainer,TableHead,TablePagination,TableRow,Snackbar,CircularProgress } from '@material-ui/core';
import {Button,TextField, Dialog, DialogActions,DialogContent,DialogContentText,DialogTitle,InputAdornment } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import GCLService from '../../../../components/function/GCLService'
import {AddCircleOutline,CloseSharp,BrightnessHigh,Apps,CheckCircleOutlineRounded,Save} from '@material-ui/icons'

const tableHaderColumns = [
    {id: 'time', label: 'Time', minWidth: 120, align: 'center',format: (value) => `${new Date(value).toLocaleDateString()} ${new Date(value).toLocaleTimeString()}`},
    {id: 'gate_code', label: 'Gate\u00a0Code', minWidth: 170 },
    {id: 'product_qr',label: 'Product QR', minWidth: 170, },
    {id: 'msg',label: 'Message', minWidth: 170},
    {id: 'action',label: ' 🛠 ', minWidth: 100, }
  ];

const ScanReceiveGateMapping=(props)=>{
    const [dataTable, setDataTable] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [isLoading,setIsLoading]=useState(false)
    const [toast,setToast] = useState({msg:null,open:false,type:null});
    const [canceling,setCanceling] = useState([]);
    const [gate_code,setGateCode]=useState("")
    const [product_qr,setProductQR]=useState("")
    const textFieldForGateCode = useRef(null);
    const textFieldForProduct_qr = useRef(null);
    const [confirmCancel,setConfirmCancel] = useState(null);

    const dataTableModel=(time,gate_code,product_qr,msg)=>{return {time,gate_code,product_qr,msg}}

    useEffect(() => {
        textFieldForGateCode.current.focus()
        window.loading.onLoading();
        setDataTable(GCLService.getScanReceiveGateMappingData().reverse())
        window.loading.onLoaded();
        //on component unmount
        return () => {
            
        }
  }, [isLoading])

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const onPost=()=>{
    if(gate_code=="" && product_qr=="")return;
    setIsLoading(true)
    GCLService.post('/v2/Recieve_MappingGate_Front',{gate_code,product_qr}).then(res=>{
      setIsLoading(false)
      textFieldForGateCode.current.focus()
      if(!res.data._result.status) {
        setGateCode("")
        setProductQR("")
        setToast({msg:"Fail : "+res.data._result.message ,open:true,type:'error'})      
        return ;       
      }
      GCLService.pushScanReceiveGateMappingData(dataTableModel(new Date(),gate_code,product_qr, res.data._result.message))
      setDataTable(GCLService.getScanReceiveGateMappingData().reverse())
      setGateCode("")
      setProductQR("")
      setToast({msg:"Success",open:true,type:'success'})
    })
    
  }
  const onCancel=(id)=>{
    setCanceling([...canceling,id])
    GCLService.post('/v2/Recieve_MappingGate_Front',{id:id,mode:99}).then(res=>{
        const indexLoading = canceling.indexOf(id);
        if (indexLoading > -1)canceling.splice(indexLoading, 1);
        setCanceling(canceling);
        if(!res.data._result.status) {
          setToast({msg:"Fail : "+res.data._result.message ,open:true,type:'error'})
          return ;
        }
        // loadDataTable()
        setToast({msg:"Success",open:true,type:'success'})
      })
  }

  return (
    <Paper elevation={0} style={{width: '100%',height:'100%', padding:10}}>
    <Paper elevation={0} style={{width: '100%',margin:'auto',marginBottom:25,maxWidth:800,padding:20}}>
        <div>
            <form autoComplete="off">
                <TextField  
                                     
                    style={{marginBottom:20}}
                    type="text"
                    id="gate_code" 
                    label="Gate Code" 
                    fullWidth required 
                    value={gate_code} 
                    inputRef={textFieldForGateCode}
                    InputProps={{
                        startAdornment: (<InputAdornment position="start"><BrightnessHigh /> </InputAdornment>),
                    }}
                    disabled={isLoading}
                    onChange={(event)=>setGateCode(event.target.value)}
                    onKeyPress={(event)=>{if(event.key === "Enter")textFieldForProduct_qr.current.focus()}}
                  
                />
                <TextField                     
                    style={{marginBottom:20,width: '87%',margin:'auto',marginBottom:20}}
                    type="text"
                    id="product_qr" 
                    label="Product QR" 
                    fullWidth required 
                    value={product_qr} 
                    inputRef={textFieldForProduct_qr}
                    InputProps={{
                        startAdornment: (<InputAdornment position="start"><Apps /> </InputAdornment>),
                    }}
                    disabled={gate_code==null || gate_code=="" || isLoading}
                    onChange={(event)=>setProductQR(event.target.value)}
                    onKeyPress={(event)=>{if(event.key === "Enter")onPost()}}                    
                />
                <Button variant="contained" color="primary" startIcon={isLoading?<CircularProgress color='inherit' size={30}/>:<Save/>} onClick={onPost}>POST</Button>
            </form >
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
                        style={{ minWidth: column.minWidth, backgroundColor:'#DDD',padding:10 }}
                        >
                        {column.label}
                        </TableCell>
                    ))}
                    </TableRow> 
                </TableHead>
                <TableBody>
                    {dataTable.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row,index) => {
                    return (
                        <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                        {tableHaderColumns.map((column) => {
                            const value = row[column.id]|| "";
                            if(column.id=='action'){
                                return (
                                  <TableCell key={column.id+index} align={column.align} style={{padding:10}}>
                                      <Button variant="contained" color="secondary" size="small" onClick={()=>setConfirmCancel(row.id)} disabled={canceling.length>0}>
                                        {canceling.indexOf(row.id)>-1 ? <CircularProgress size={20} />:<CloseSharp />} Cancel
                                      </Button>
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
                    {dataTable.length<=0 &&
                    <TableRow>
                        <TableCell colSpan='11'>
                        <Alert severity='info'>Empty Data</Alert>
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
    <Dialog maxWidth='xl' onClose={()=>setConfirmCancel(null)} aria-labelledby="simple-dialog-title" open={confirmCancel!=null}>
        <DialogTitle id="simple-dialog-title">Are you sure?</DialogTitle>
        <DialogContent>Cancel "{confirmCancel}"</DialogContent>
        <DialogActions style={{backgroundColor:'#eee'}}>
          <Button size='medium' variant="contained" onClick={()=>setConfirmCancel(null)} color="secondary" startIcon={<CloseSharp/>} >
            No
          </Button>
          <Button size='medium' variant="contained" onClick={()=>{onCancel(confirmCancel);setConfirmCancel(null)}} color="primary" startIcon={<CheckCircleOutlineRounded/>} type='submit'>
            Yes
          </Button>
        </DialogActions>
    </Dialog>
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

export default ScanReceiveGateMapping