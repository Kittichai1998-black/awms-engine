import React, { useState, useEffect, useRef, useMemo } from "react";
import Axios from "axios";
import { makeStyles } from '@material-ui/core/styles';
import {Paper,Table,TableBody,TableCell,TableContainer,TableHead,TablePagination,TableRow,Snackbar,CircularProgress } from '@material-ui/core';
import {Button,TextField, Dialog, DialogActions,DialogContent,DialogContentText,DialogTitle} from '@material-ui/core';
// import ToastAlert from '../../../../components/function/ToastAlert';
import GCLService from '../../../../components/function/GCLService';
import Alert from '@material-ui/lab/Alert';
import {AddCircleOutline,CloseSharp,Save} from '@material-ui/icons'
import "../../../../assets/css/TableCustom.css";

const tableHaderColumns = [
  {id: 'status', label: 'Status', minWidth: 100},
  {id: 'wms_doc', label: 'WMS\u00a0Doc', minWidth: 100 },
  {id: 'customer',label: 'Cutomer', minWidth: 100, },
  {id: 'grade',label: 'Grade', minWidth: 100},
  {id: 'lot', label: 'Lot', minWidth: 100},
  {id: 'no_pallet', label: 'No Pallet', minWidth: 100 },
  {id: 'qty', label: 'Qty', minWidth: 100, align:'right', format: (value) => Number(value.toFixed(3)).toLocaleString('en-US') },
  {id: 'unit', label: 'Unit', minWidth: 100 },
  {id: 'waiting_pallet', label: 'Waiting(Pallet)', minWidth: 100, align:'right'},
  {id: 'received_pallet', label: 'Received(Pallet)', minWidth: 100, align:'right'},
  {id: 'action', label: '🛠', minWidth: 100, align:'center'},
];

const useStyles = makeStyles({
  root: {
    width: '100%',
  },
  container: {
    maxHeight: 440,
  },
});

const MonitorReceive=(props)=>{
  const classes = useStyles();
  const [dataTable, setDataTable] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isOpenModalAddReceive,setIsOpenModalAddReceive] = useState(false);
  const [toast,setToast] = useState({msg:null,open:false,type:null});
  const [cloasing,setCloasing] = useState({isLoading:false,id:null});
  let intervalGetSPReportAPI=null

  useEffect(() => {
        window.loading.onLoading();
        GCLService.get('/v2/GetSPReportAPI',{spname:'Recieve_PLAN_Load_Front'}).then(res=>{
            window.loading.onLoaded();
            if(GCLService.isMockData)return setDataTable(GCLService.mockDataGCL.monitorReceive)
            if(!res.data._result.status) {
              setToast({msg:"โหลดข้อมูลไม่สำเร็จ : "+res.data._result.message ,open:true,type:'error'})
              return ;
            }
            setDataTable(res.data.datas)
            //auto load data
            intervalGetSPReportAPI=setInterval(()=>{
                GCLService.get('/v2/GetSPReportAPI',{spname:'Recieve_PLAN_Load_Front'}).then(res=>{
                  if(!res.data._result.status) {
                    setToast({msg:"โหลดข้อมูลไม่สำเร็จ : "+res.data._result.message ,open:true,type:'error'})
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

  const onCloase=(wms_doc)=>{
    setCloasing({isLoading:true,id:wms_doc});
    GCLService.post('/v2/Recieve_PLAN_Close_Front',{wms_doc}).then(res=>{
      setCloasing({isLoading:false,id:null});
      if(!res.data._result.status) {
        setToast({msg:"Fail : "+res.data._result.message ,open:true,type:'error'})
        return ;
      }
      setToast({msg:"Success",open:true,type:'success'})
    })
  }

  return (
    <Paper className={classes.root}>
      <AddReceiveModal open={isOpenModalAddReceive} handleClose={()=>setIsOpenModalAddReceive(false)} handleSetToast={setToast} />
      <div style={{display:'flex',flexDirection:'row-reverse', marginBottom:10}}>
        <Button
            variant="contained"
            color="primary"
            size="medium"
            startIcon={<AddCircleOutline />}
            onClick={()=>setIsOpenModalAddReceive(true)}
        > Add </Button>
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
                    const value = row[column.id];
                    if(column.id=='action'){
                      return (
                        <TableCell>
                          <Button variant="contained" color="secondary" size="small" startIcon={<CloseSharp />} onClick={()=>onCloase(row.wms_doc)} disabled={cloasing.id==row.wms_doc && cloasing.isLoading}> {cloasing.id==row.wms_doc && cloasing.isLoading ? <CircularProgress size={20} /> : 'Closed'} </Button>
                        </TableCell>
                      );
                    }
                    return (
                      <TableCell key={column.id} align={column.align} style={{padding:10}}>
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
                  <Alert severity='info'>ไม่พบรายการ</Alert>
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
const AddReceiveModal=({open,handleClose,handleSetToast=()=>{}})=>{
  const classes = useStyles();
  const [wms_doc,setWmsDoc]=useState("")
  const [customer,setCustomer]=useState("")
  const [to_wh,setToWH]=useState("")
  const [grade,setGrade]=useState("")
  const [lot,setLot]=useState("")
  const [no_strat,setNoStrat]=useState("")
  const [no_end,setNoEnd]=useState("")
  const [sku,setSKU]=useState("")
  const [status,setStatus]=useState("")
  const [qty_pallet,setQtyPallet]=useState("")
  const [unit,setUnit]=useState("")
  const [isLoading,setIsLoading]=useState(false)

  useEffect(() => {
        //on component unmount
        return () => {}
  }, [])

  const onSubmitForm=(event)=>{
    window.loading.onLoading();
    setIsLoading(true)
    GCLService.post('/v2/Recieve_PLAN_Front',{wms_doc,customer,to_wh,grade,lot,no_strat,no_end,sku,status,qty_pallet,unit}).then(res=>{
      window.loading.onLoaded();
      setIsLoading(false)
      if(!res.data._result.status) {
        handleSetToast({msg:"Fail : "+res.data._result.message ,open:true,type:'error'})
        return ;
      }
      handleSetToast({msg:"Success",open:true,type:'success'})
      handleClose()
    })
    event.preventDefault()
  }

  return <>
    <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title" maxWidth='xs'>
      <form onSubmit={onSubmitForm} autocomplete="off">
      <DialogTitle id="form-dialog-title" onClose={handleClose}><center>Add Data</center></DialogTitle>
      <DialogContent>
          <TextField autoFocus type="text" margin="dense" id="wms_doc" label="WMS Doc" fullWidth required value={wms_doc} onChange={(event)=>setWmsDoc(event.target.value)} helperText={null}/>
          <TextField type="text" margin="dense" id="customer" label="Customer" fullWidth required value={customer} onChange={(event)=>setCustomer(event.target.value)} />
          <TextField type="text" margin="dense" id="to_wh" label="To WH" fullWidth required value={to_wh} onChange={(event)=>setToWH(event.target.value)} />
          <TextField type="text" margin="dense" id="grade" label="Grade" fullWidth required value={grade} onChange={(event)=>setGrade(event.target.value)} />
          <TextField type="text" margin="dense" id="lot" label="Lot" fullWidth required value={lot} onChange={(event)=>setLot(event.target.value)} />
          <TextField type="number" margin="dense" id="no_strat" label="No Strat"  required InputProps={{step:1}} value={no_strat} onChange={(event)=>setNoStrat(event.target.value)} />
          <TextField type="number" margin="dense" id="no_end" label="No End" style={{marginLeft:10}}  required InputProps={{step:1}} value={no_end} onChange={(event)=>setNoEnd(event.target.value)} />
          <TextField type="text" margin="dense" id="sku" label="SKU" fullWidth required value={sku} onChange={(event)=>setSKU(event.target.value)} />
          <TextField type="text" margin="dense" id="status" label="Status" fullWidth required value={status} onChange={(event)=>setStatus(event.target.value)} />
          <TextField type="number" margin="dense" id="qty_pallet" label="Qty Pallet" fullWidth required value={qty_pallet} onChange={(event)=>setQtyPallet(event.target.value)} />
          <TextField type="text" margin="dense" id="unit" label="Unit" fullWidth required InputProps={{step:1}} value={unit} onChange={(event)=>setUnit(event.target.value)} />
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