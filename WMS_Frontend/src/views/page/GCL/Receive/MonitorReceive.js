import React, { useState, useEffect, useRef, useMemo } from "react";
import Axios from "axios";
import { makeStyles } from '@material-ui/core/styles';
import {Paper,Table,TableBody,TableCell,TableContainer,TableHead,TablePagination,TableRow,Snackbar,CircularProgress } from '@material-ui/core';
import {Button,IconButton,TextField, Dialog, DialogActions,DialogContent,DialogContentText,DialogTitle,Tooltip,Select,MenuItem} from '@material-ui/core';
// import ToastAlert from '../../../../components/function/ToastAlert';
import GCLService from '../../../../components/function/GCLService';
import Alert from '@material-ui/lab/Alert';
import {AddCircleOutline,CloseSharp,Save, Cancel,CheckCircleOutlineRounded,CheckCircle} from '@material-ui/icons'
import "../../../../assets/css/TableCustom.css";

import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';

const tableHaderColumns = [
  {id: 'status', label: 'Status', minWidth: 100},
  {id: 'warehouse', label: 'Warehouse', minWidth: 50},
  {id: 'wms_doc', label: 'WMS\u00a0Doc', minWidth: 100 },
  {id: 'customer',label: 'Cutomer', minWidth: 100, },
  {id: 'sku', label: 'Sku', minWidth: 50},
  {id: 'grade',label: 'Grade', minWidth: 100},
  {id: 'lot', label: 'Lot', minWidth: 100},
  {id: 'no_pallet', label: 'No Pallet', minWidth: 100 },
  {id: 'qty', label: 'Qty', minWidth: 100, align:'right', format: (value) => Number(value.toFixed(3)).toLocaleString('en-US') },
  {id: 'unit', label: 'Unit', minWidth: 50 },
  {id: 'waiting_pallet', label: 'Waiting(Pallet)', minWidth: 100, align:'right'},
  {id: 'receiving_pallet', label: 'Receiving(Pallet)', minWidth: 100, align:'right'},
  {id: 'received_pallet', label: 'Received(Pallet)', minWidth: 100, align:'right'},
  {id: 'action', label: '🛠', minWidth: 100, align:'center'},
];

const useStyles = makeStyles({
  root: {
    width: '100%',
    padding:15
  },
});
let intervalGetSPReportAPI=null

const MonitorReceive=(props)=>{
  const classes = useStyles();
  const [dataTable, setDataTable] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isOpenModalAddReceive,setIsOpenModalAddReceive] = useState(false);
  const [toast,setToast] = useState({msg:null,open:false,type:null});
  const [cloasing,setCloasing] = useState([]);
  const [confirmClosed,setConfirmClosed] = useState(null);

  

  useEffect(() => {
        window.loading.onLoading();
        GCLService.get('/v2/GetSPReportAPI',{spname:'Recieve_PLAN_Load_Front'}).then(res=>{
            window.loading.onLoaded();
            if(GCLService.isMockData)return setDataTable(GCLService.mockDataGCL.monitorReceive)
            if(!res.data._result.status) {
              setToast({msg:"Load data fail : "+res.data._result.message ,open:true,type:'error'})
              return ;
            }
            setDataTable(res.data.datas)
            //auto load data
            intervalGetSPReportAPI=setInterval(()=>{
                GCLService.get('/v2/GetSPReportAPI',{spname:'Recieve_PLAN_Load_Front'}).then(res=>{
                  if(!res.data._result.status) {
                    setToast({msg:"Load data fail : "+res.data._result.message ,open:true,type:'error'})
                    return ;
                  }
                  setDataTable(res.data.datas)
                })
            },5000)
        })

        //on component unmount
        return () => {
            clearInterval(intervalGetSPReportAPI);
        }
  }, [])
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const onAddReceiveSuccess=()=>{
    clearInterval(intervalGetSPReportAPI);
    intervalGetSPReportAPI=setInterval(()=>{
      GCLService.get('/v2/GetSPReportAPI',{spname:'Recieve_PLAN_Load_Front'}).then(res=>{
        if(!res.data._result.status) {
          setToast({msg:"Load data fail : "+res.data._result.message ,open:true,type:'error'})
          return ;
        }
        setDataTable(res.data.datas)
      })
    },5000)
  }

  const onClosed=(wms_doc)=>{
    setCloasing([...cloasing,wms_doc]);
    GCLService.post('/v2/Recieve_PLAN_Close_Front',{wms_doc}).then(res=>{
      const indexLoading = cloasing.indexOf(wms_doc);
      if (indexLoading > -1)cloasing.splice(indexLoading, 1);
      setCloasing(cloasing);
      if(!res.data._result.status) {
        setToast({msg:"Fail : "+res.data._result.message ,open:true,type:'error'})
        return ;
      }        
      setToast({msg:"Success",open:true,type:'success'})
    })
  }

  return (
    <Paper className={classes.root}>
      <AddReceiveModal open={isOpenModalAddReceive} handleClose={()=>setIsOpenModalAddReceive(false)} handleSetToast={setToast} handleOnSuccess={onAddReceiveSuccess} />
      <div style={{display:'flex',flexDirection:'row-reverse', marginBottom:10}}>
        <Button
            variant="contained"
            color="primary"
            size="medium"
            startIcon={<AddCircleOutline />}
            onClick={()=>setIsOpenModalAddReceive(true)}
        > Add Receive</Button>
      </div>
      <TableContainer className="tableCustom" style={{maxHeight: 440}}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {tableHaderColumns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth, backgroundColor:'#BBB',padding:10 }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {dataTable.length>0 && dataTable.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row,index) => {
              return (
                <TableRow hover key={index}>
                  {tableHaderColumns.map((column,key) => {
                    const value = row[column.id]||'';
                    if(column.id=='action'){
                      return (
                        <TableCell key={column.id+index} align={column.align} style={{padding:10}}>
                            {(row.status||"").toLowerCase()!='Closed'.toLowerCase() &&
                            <Button variant="contained" color="primary" style={{backgroundColor:'#16C050'}} size="small" onClick={()=>setConfirmClosed(row.wms_doc)} disabled={cloasing.length>0}>
                              {cloasing.indexOf(row.wms_doc)>-1 ? <CircularProgress size={20} />:<CheckCircle />} Closed
                            </Button>
                            }
                        </TableCell>
                      );
                    }
                    return (
                      column.id=='status'?
                        <TableCell key={column.id+index} align={column.align} style={{padding:10, backgroundColor: (value.toLowerCase()=='Worked'.toLowerCase()||value.toLowerCase()=='Closing'.toLowerCase()||value.toLowerCase()=='Closed'.toLowerCase())? '#33FF99' : (value.toLowerCase()=='Rejecting'.toLowerCase()||value.toLowerCase()=='Rejected'.toLowerCase()) ? '#FF5980' : '#FFF' }}>
                          {value}
                        </TableCell>
                        :
                      column.id=='wms_doc'?
                        <TableCell key={column.id+index} align={column.align} style={{padding:10}}>
                          <a target={'_blank'} href={'/receive/putawaydetail?docID='+row['id']}>{value}</a>
                        </TableCell>
                        :
                        <TableCell key={column.id+index} align={column.align} style={{padding:10}}>
                          {column.format && typeof value === 'number' ? column.format(value) : value}
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

      <Dialog maxWidth='xl' onClose={()=>setConfirmClosed(null)} aria-labelledby="simple-dialog-title" open={confirmClosed!=null}>
        <DialogTitle id="simple-dialog-title">Are you sure?</DialogTitle>
        <DialogContent>Closed "{confirmClosed}"</DialogContent>
        <DialogActions style={{backgroundColor:'#eee'}}>
          <Button size='medium' variant="contained" onClick={()=>setConfirmClosed(null)} color="secondary" startIcon={<CloseSharp/>} >
            No
          </Button>
          <Button size='medium' variant="contained" onClick={()=>{onClosed(confirmClosed);setConfirmClosed(null)}} color="primary" startIcon={<CheckCircleOutlineRounded/>} type='submit'>
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
  );
}

// model add
const AddReceiveModal=({open,handleClose,handleSetToast=()=>{},handleOnSuccess=()=>{}})=>{
  const classes = useStyles();
  const [status,setStatus]=useState("QI")
  const [priority,setPriority]=useState("1")
  const [to_wh,setToWH]=useState("")
  const [wms_doc,setWmsDoc]=useState("")
  const [customer,setCustomer]=useState("")  
  const [grade,setGrade]=useState("")
  const [lot,setLot]=useState("")
  const [booking_location,setBookingLocation]=useState("")
  const [no_strat,setNoStrat]=useState("")
  const [no_end,setNoEnd]=useState("")
  const [sku,setSKU]=useState("")  
  const [qty_pallet,setQtyPerPallet]=useState("")
  const [unit,setUnit]=useState("KG")
  const [isLoading,setIsLoading]=useState(false)

  const [booking_zone, setBooking_Zone] = useState("");

  useEffect(() => {
        //on component unmount
        return () => {}
  }, [])

  const onSubmitForm=(event)=>{
    handleOnSuccess()
    window.loading.onLoading();
    setIsLoading(true)
    let priority_value = !(priority=="") ? Number(priority) : priority;
    let no_strat_value = !(no_strat=="") ? Number(no_strat) : no_strat;
    let no_end_value = !(no_end=="") ? Number(no_end) : no_end;
    let qty_pallet_value = !(qty_pallet=="") ? Number(qty_pallet) : qty_pallet;
    GCLService.post('/v2/Recieve_PLAN_Front',{priority:priority_value, wms_doc,customer,to_wh,grade,lot,booking_location,booking_zone:booking_zone,status,no_strat: no_strat_value, no_end: no_end_value,sku,status, qty_pallet:qty_pallet_value,unit}).then(res=>{
      window.loading.onLoaded();
      setIsLoading(false)
      if(!res.data._result.status) {
        handleSetToast({msg:"Fail : "+res.data._result.message ,open:true,type:'error'})
        return ;
      }
      handleSetToast({msg:"Success",open:true,type:'success'})
      handleOnSuccess()
      handleClose()
    })
    event.preventDefault()
  }

  return <>
    <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title" maxWidth='xs'>
      <form onSubmit={onSubmitForm} autoComplete="off">
      <DialogTitle id="form-dialog-title" onClose={handleClose}><center>Add Receive</center></DialogTitle>
      <DialogContent>          
          <TextField type="text" margin="dense" id="to_wh" label="To WH" fullWidth required value={to_wh} onChange={(event)=>setToWH(event.target.value)} />
          <TextField type="text" margin="dense" id="wms_doc" label="BO" fullWidth required value={wms_doc} onChange={(event)=>setWmsDoc(event.target.value)} helperText={null}/>
          <TextField type="text" margin="dense" id="customer" label="Customer" fullWidth required value={customer} onChange={(event)=>setCustomer(event.target.value)} />          
          <TextField type="text" margin="dense" id="sku" label="SKU" fullWidth required value={sku} onChange={(event)=>setSKU(event.target.value)} />         
          <TextField type="text" margin="dense" id="grade" label="Grade" fullWidth required value={grade} onChange={(event)=>setGrade(event.target.value)} />
          <TextField type="text" margin="dense" id="lot" label="Lot" fullWidth required value={lot} onChange={(event)=>setLot(event.target.value)} />
          <div>
          <FormControl>
          <InputLabel htmlFor="outlined-age-native-simple">Booking&nbsp;Zone</InputLabel>
          <Select type="text" margin="dense" id="booking_zone" label="Booking Zone" style={{width:"150px"}} fullWidth required value={booking_zone} onChange={(event)=>setBooking_Zone(event.target.value)} >          
            <MenuItem value="inbound">{"Inbound"}</MenuItem>
            <MenuItem value="outbound">{"Outbound"}</MenuItem>
          </Select>
          </FormControl>
          </div>
          <TextField type="text" margin="dense" id="booking_location" label="Booking Count" fullWidth required  value={booking_location} onChange={(event)=>setBookingLocation(event.target.value)} />  
          <TextField type="number" margin="dense" id="no_strat" label="No Start"  required InputProps={{step:1}} value={no_strat} onChange={(event)=>setNoStrat(event.target.value)} />
          <TextField type="number" margin="dense" id="no_end" label="No End" /*style={{marginLeft:10}} */ required InputProps={{step:1}} value={no_end} onChange={(event)=>setNoEnd(event.target.value)} />          
          <TextField type="number" margin="dense" id="qty_pallet" label="Qty Per Pallet" fullWidth required value={qty_pallet} onChange={(event)=>setQtyPerPallet(event.target.value)} />
          <TextField type="text" margin="dense" id="unit" label="Unit" fullWidth required InputProps={{step:1}} value={unit} onChange={(event)=>setUnit(event.target.value)} />
          <TextField type="text" margin="dense" id="status" label="Status" fullWidth required  value={status} onChange={(event)=>setStatus(event.target.value)} />
      </DialogContent>
      <DialogActions style={{backgroundColor:'#eee'}}>
        {isLoading ?
          <CircularProgress /> :
          <>
            <Button size='small' variant="contained" onClick={handleClose} color="secondary" startIcon={<CloseSharp/>} >
              Cancel
            </Button>
            <Button size='small' variant="contained" onClick={()=>{}} color="primary" startIcon={<Save/>} type='submit'>
              Save
            </Button>
          </>
        }
      </DialogActions>
      </form>
    </Dialog>
  </>
}


export default MonitorReceive