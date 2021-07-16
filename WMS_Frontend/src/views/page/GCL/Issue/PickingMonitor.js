import React, { useState, useEffect, useRef, useMemo } from "react";
import Axios from "axios";
import { makeStyles } from '@material-ui/core/styles';
import {Paper,Table,TableBody,TableCell,TableContainer,TableHead,TablePagination,TableRow,Snackbar,CircularProgress } from '@material-ui/core';
import {Button,IconButton,TextField, Dialog, DialogActions,DialogContent,DialogContentText,DialogTitle,Tooltip} from '@material-ui/core';
// import ToastAlert from '../../../../components/function/ToastAlert';
import GCLService from '../../../../components/function/GCLService';
import Alert from '@material-ui/lab/Alert';
import {AddCircleOutline,CloseSharp,Save, Cancel, CheckCircleOutlineRounded,CheckCircle} from '@material-ui/icons'
import "../../../../assets/css/TableCustom.css";

const tableHaderColumns = [
  {id: 'status', label: 'Status', minWidth: 100},
  {id: 'priority', label: 'Priority', minWidth: 50},
  {id: 'dock', label: 'Dock', minWidth: 50},
  {id: 'wms_doc', label: 'WMS\u00a0Doc', minWidth: 100 },
  {id: 'customer',label: 'Customer', minWidth: 100, },
  {id: 'sku',label: 'Sku', minWidth: 100, },
  // {id: 'grade',label: 'Grade', minWidth: 100},
  {id: 'lot', label: 'Lot', minWidth: 100},
  {id: 'qty', label: 'Qty', minWidth: 100, align:'right', format: (value) => Number(value.toFixed(3)).toLocaleString('en-US') },
  {id: 'unit', label: 'Unit', minWidth: 50 },
  {id: 'waiting_pallet', label: 'Waiting(Pallet)', minWidth: 100, align:'right'},
  {id: 'picking_pallet', label: 'Picking(Pallet)', minWidth: 100, align:'right'},
  {id: 'picked_pallet', label: 'Picked(Pallet)', minWidth: 100, align:'right'},
  {id: 'action', label: '🛠', minWidth: 100, align:'center'},
];

const useStyles = makeStyles({
  root: {
    width: '100%',
    padding:15
  },
});

let intervalGetSPReportAPI=null

const PickingMonitor=(props)=>{
  const classes = useStyles();
  const [dataTable, setDataTable] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isOpenModalAddPicking,setIsOpenModalAddPicking] = useState(false);
  const [toast,setToast] = useState({msg:null,open:false,type:null});
  const [cloasing,setCloasing] = useState([]);
  const [confirmClosed,setConfirmClosed] = useState(null);

  useEffect(() => {
        window.loading.onLoading();
        GCLService.get('/v2/GetSPReportAPI',{spname:'Picking_PLAN_Load_Front'}).then(res=>{
            window.loading.onLoaded();
            if(GCLService.isMockData)return setDataTable(GCLService.mockDataGCL.monitorReceive)
            if(!res.data._result.status) {
              setToast({msg:"Load data fail : "+res.data._result.message ,open:true,type:'error'})
              return ;
            }
            setDataTable(res.data.datas)
            //auto load data
            intervalGetSPReportAPI=setInterval(()=>{
                GCLService.get('/v2/GetSPReportAPI',{spname:'Picking_PLAN_Load_Front'}).then(res=>{
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

  const onAddPickingSuccess=()=>{
    clearInterval(intervalGetSPReportAPI);
    intervalGetSPReportAPI=setInterval(()=>{
      GCLService.get('/v2/GetSPReportAPI',{spname:'Picking_PLAN_Load_Front'}).then(res=>{
        if(!res.data._result.status) {
          setToast({msg:"Load data fail : "+res.data._result.message ,open:true,type:'error'})
          return ;
        }
        setDataTable(res.data.datas)
      })
    },5000);
  }

  const onClosed=(wms_doc)=>{
    setCloasing([...cloasing,wms_doc]);
    GCLService.post('/v2/Picking_Plan_Close_Front',{wms_doc}).then(res=>{
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
      <AddPickingModal open={isOpenModalAddPicking} handleClose={()=>setIsOpenModalAddPicking(false)} handleSetToast={setToast} handleOnSuccess={onAddPickingSuccess} />
      <div style={{display:'flex',flexDirection:'row-reverse', marginBottom:10}}>
        <Button
            variant="contained"
            color="primary"
            size="medium"
            startIcon={<AddCircleOutline />}
            onClick={()=>setIsOpenModalAddPicking(true)}
        > Add Picking </Button>
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
                    const value = row[column.id] || "";
                    if(column.id=='action'){
                      return (
                        <TableCell key={column.id+index} align={column.align} style={{padding:10}}>
                          {(row.status||"").toLowerCase()!='Working'.toLowerCase()&&(row.status||"").toLowerCase()!='Closing'.toLowerCase()||(row.status||"").toLowerCase()!='Rejected'.toLowerCase()&&
                          // (row.status||"").toLowerCase()!='Closed'.toLowerCase() || (row.status||"").toLowerCase()!='Rejecting'.toLowerCase() || (row.status||"").toLowerCase()!='Rejected'.toLowerCase()&&
                            <Button variant="contained" color="primary" style={{backgroundColor:'#16C050'}} color="secondary" size="small" onClick={()=>setConfirmClosed(row.wms_doc)} disabled={cloasing.length>0}>
                              {cloasing.indexOf(row.wms_doc)>-1 ? <CircularProgress size={20} />:<CheckCircle />} Closed
                            </Button>
                          }
                        </TableCell>
                      );
                    }
                    return (
                      column.id=='status'?
                        <TableCell key={column.id+index} align={column.align} style={{padding:10, backgroundColor: 
                            (value.toLowerCase()=='Worked'.toLowerCase()||value.toLowerCase()=='Closing'.toLowerCase())?'#FFFF66':
                                value.toLowerCase()=='Closed'.toLowerCase()? '#33FF99' : 
                                (value.toLowerCase()=='Rejecting'.toLowerCase()||value.toLowerCase()=='Rejected'.toLowerCase()) ? '#FF5980' : '#FFF' }}>
                          {value}
                        </TableCell>
                      :column.id=='wms_doc'?
                        <TableCell key={column.id+index} align={column.align} style={{padding:10}}>
                          <a target={'_blank'} href={'/issue/pickingdetail?docID='+row['id']}>{value}</a>
                        </TableCell>
                        :<TableCell key={column.id+index} align={column.align} style={{padding:10}}>
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
        <DialogActions style={{backgroundColor:'#eee'}} >
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
const AddPickingModal=({open,handleClose,handleSetToast=()=>{},handleOnSuccess=()=>{}})=>{
  const classes = useStyles();
  const [priority,setPriority]=useState("")
  const [wms_doc,setWmsDoc]=useState("")
  const [customer,setCustomer]=useState("")
  const [to_wh,setToWH]=useState("")
  const [grade,setGrade]=useState("")
  const [lot,setLot]=useState("")
  const [sku,setSKU]=useState("")
  const [status,setStatus]=useState("")
  const [qty_pick,setQtyPick]=useState("")
  const [unit,setUnit]=useState("")
  const [dock,setDock]=useState("")
  const [isLoading,setIsLoading]=useState(false)

  useEffect(() => {
        //on component unmount
        return () => {}
  }, [])

  const onSubmitForm=(event)=>{
    window.loading.onLoading();
    setIsLoading(true)
    let priority_value = !(priority=="") ? Number(priority) : priority;
    let qty_pick_value = !(qty_pick=="") ? Number(qty_pick) : qty_pick
    GCLService.post('/v2/Picking_Plan_Front',{priority:priority_value,wms_doc,customer,to_wh,grade,lot,sku,status,qty_pick:qty_pick_value,unit,dock}).then(res=>{
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
      <DialogTitle id="form-dialog-title" onClose={handleClose}><center>Add Picking</center></DialogTitle>
      <DialogContent>
          <TextField autoFocus type="number" margin="dense" id="priority" label="Priority" fullWidth required InputProps={{step:1}} value={priority} onChange={(event)=>setPriority(event.target.value)} />
          <TextField type="text" margin="dense" id="to_wh" label="From WH" fullWidth required value={to_wh} onChange={(event)=>setToWH(event.target.value)} />
          <TextField type="text" margin="dense" id="wms_doc" label="DO" fullWidth required value={wms_doc} onChange={(event)=>setWmsDoc(event.target.value)} helperText={null}/>
          <TextField type="text" margin="dense" id="customer" label="Customer" fullWidth required value={customer} onChange={(event)=>setCustomer(event.target.value)} />
          <TextField type="text" margin="dense" id="sku" label="SKU" fullWidth required value={sku} onChange={(event)=>setSKU(event.target.value)} />
          {/* <TextField type="text" margin="dense" id="grade" label="Grade" fullWidth required value={grade} onChange={(event)=>setGrade(event.target.value)} /> */}
          <TextField type="text" margin="dense" id="lot" label="Lot" fullWidth required value={lot} onChange={(event)=>setLot(event.target.value)} />          
          <TextField type="text" margin="dense" id="status" label="Status" fullWidth required value={status} onChange={(event)=>setStatus(event.target.value)} />
          <TextField type="number" margin="dense" id="qty_pick" label="Qty Pick" fullWidth required value={qty_pick} onChange={(event)=>setQtyPick(event.target.value)} />
          <TextField type="text" margin="dense" id="unit" label="Unit" fullWidth required value={unit} onChange={(event)=>setUnit(event.target.value)} />
          <TextField type="text" margin="dense" id="dock" label="Dock" fullWidth required value={dock} onChange={(event)=>setDock(event.target.value)} />
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

export default PickingMonitor