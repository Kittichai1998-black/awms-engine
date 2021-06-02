import React, { useState, useEffect, useRef, useMemo } from "react";
import Axios from "axios";
import { makeStyles } from '@material-ui/core/styles';
import {Paper,Table,TableBody,TableCell,TableContainer,TableHead,TablePagination,TableRow,Snackbar,CircularProgress } from '@material-ui/core';
import {Button,IconButton,TextField, Dialog, DialogActions,DialogContent,DialogContentText,DialogTitle,Tooltip} from '@material-ui/core';
// import ToastAlert from '../../../../components/function/ToastAlert';
import GCLService from '../../../../components/function/GCLService';
import Alert from '@material-ui/lab/Alert';
import {AddCircleOutline,CloseSharp,PlayForWork, Cancel,ExpandLess,CheckCircle} from '@material-ui/icons'
import ScanShuttleCheckIn from './ScanShuttleCheckIn'
import ScanShuttleCheckOut from './ScanShuttleCheckOut'
import "../../../../assets/css/TableCustom.css";

const tableHaderColumns = [
  {id: 'online', label: 'Online', minWidth: 100},
  {id: 'warehouse', label: 'Warehouse', minWidth: 100},
  {id: 'location', label: 'Location', minWidth: 170},
  {id: 'shuttle', label: 'Shuttle Pallet', minWidth: 170 },
  {id: 'action', label: '🛠', minWidth: 100, align:'center'},
];

const useStyles = makeStyles({
  root: {
    width: '100%',
    padding:15,
    maxWidth:1000,
    minWidth:500,
    margin:'auto'
  },
});

const MonitorReceive=(props)=>{
  const classes = useStyles();
  const [dataTable, setDataTable] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [toast,setToast] = useState({msg:null,open:false,type:null});
  const [isOpenCheckinModal,setIsOpenCheckinModal]=useState(false);
  const [isOpenCheckoutModal,setIsOpenCheckoutModal]=useState(false);
  const [inputLocation,setInputLocation]=useState("");
  const [inputShuttle,setInputShuttle]=useState("");

  useEffect(() => {
        window.loading.onLoading();
        GCLService.get('/v2/Shuttle_List_Front').then(res=>{
            window.loading.onLoaded();
            if(GCLService.isMockData)return setDataTable(GCLService.mockDataGCL.ListShuttle)
            if(!res.data._result.status) {
              setToast({msg:"Load data fail : "+res.data._result.message ,open:true,type:'error'})
              return ;
            }
            setDataTable(res.data.datas)
        })

        //on component unmount
        return () => {
        }
  }, [])
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <Paper className={classes.root}>
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
                            <Button variant="contained" color="primary" size="small" onClick={()=>{setIsOpenCheckinModal(true);setInputLocation(row.location);setInputShuttle(row.shuttle);}} style={{marginRight:5}}><PlayForWork /> in</Button>
                            <Button variant="contained" color="primary" size="small" onClick={()=>{setIsOpenCheckoutModal(true);setInputLocation(row.location);setInputShuttle(row.shuttle);}}><ExpandLess/> out</Button>
                        </TableCell>
                      );
                    }
                    return (
                      column.id=='online'?
                        <TableCell key={column.id+index} align={column.align} style={{padding:10, backgroundColor: (value.toLowerCase()=='Offile'.toLowerCase()||value.toLowerCase()=='Offline'.toLowerCase()) ? '#FF5980' : '#FFF' }}>
                          {value}
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

      {/* checkin modal */}
      <Dialog maxWidth='lg' onClose={()=>{setIsOpenCheckinModal(false);setInputLocation(null);setInputShuttle(null);}} aria-labelledby="simple-dialog-title" open={isOpenCheckinModal}>
        <DialogTitle>Shuttle Check-In</DialogTitle>
        <DialogContent>
            <ScanShuttleCheckIn shuttle={inputShuttle} gateCode={inputLocation} />
        </DialogContent>
        <DialogActions style={{backgroundColor:'#eee'}}>
          <Button size='medium' variant="contained" onClick={()=>{setIsOpenCheckinModal(false);setInputLocation(null);setInputShuttle(null);}} color="secondary" startIcon={<CloseSharp/>} >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* checkout modal */}
      <Dialog maxWidth='lg' onClose={()=>{setIsOpenCheckoutModal(false);setInputLocation(null);setInputShuttle(null);}} aria-labelledby="simple-dialog-title" open={isOpenCheckoutModal}>
        <DialogTitle>Shuttle Check-Out</DialogTitle>
        <DialogContent>
            <ScanShuttleCheckOut shuttle={inputShuttle} gateCode={inputLocation} />
        </DialogContent>
        <DialogActions style={{backgroundColor:'#eee'}}>
          <Button size='medium' variant="contained" onClick={()=>{setIsOpenCheckoutModal(false);setInputLocation(null);setInputShuttle(null);}} color="secondary" startIcon={<CloseSharp/>} >
            Close
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

export default MonitorReceive