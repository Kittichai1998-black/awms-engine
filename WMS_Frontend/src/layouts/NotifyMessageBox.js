import React, { useContext, useEffect, useState } from "react";
import { LayoutContext } from '../reducers/context';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import { fade, makeStyles } from '@material-ui/core/styles';
import Popper from '@material-ui/core/Popper';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import * as signalR from '@aspnet/signalr';
import Axios from "axios";

const useStyles = makeStyles((theme) => ({
    grow: {
      flexGrow: 1,
    }
  }));

export default (props) => {
    const {notify} = useContext(LayoutContext);
    const classes = useStyles();

    useEffect(() => {
      let url = `${window.apipath}/v2/get_notify?userId=${localStorage.User_ID}&l=10&sk=0&apikey=free01`;
      Axios.get(url).then(res => {
        notify.setNotifyAddList(res.data.messageDetails);
      });
    }, [localStorage.User_ID])

    let connection = new signalR.HubConnectionBuilder()
    .withUrl(`${window.apipath}`, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets //1
    })
    .build();

    // const signalrStart = () => {
    //     connection.start()
    //         .then(() => {
    //             connection.on('notify', res => {
    //                 console.log(res);
    //             })
    //         })
    //         .catch((err) => {
    //             console.log(err);
    //             setTimeout(() => signalrStart(), 5000);
    //         })
    // };

    // useEffect(() => {
    //     signalrStart()

    //     connection.onclose((err) => {
    //         if (err) {
    //             signalrStart()
    //         }
    //     });
    //     return () => {
    //         connection.stop()
    //     }
    // }, [])

    const handleListKeyDown = (event) =>{
      if (event.key === 'Tab') {
        event.preventDefault();
        notify.notifyState(false);
      }
    }

    return <>
        <Popper style={{zIndex:9999}} open={notify.notifyState} anchorEl={props.btnRef.current} role={undefined} transition disablePortal>
            {({ TransitionProps, placement }) => (
                <Grow {...TransitionProps} style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}>
                  <Paper>
                    <ClickAwayListener onClickAway={() => notify.setNotifyState(false)}>
                      <MenuList autoFocusItem={notify.notifyState} id="menu-list-grow" onKeyDown={handleListKeyDown}>
                        {notify.notifyList.map(noti => <MenuItem onClick={() => {notify.setNotifyState(false)}}>
                          <div style={{fontSize:"14px",width:"200px",textOverflow:"ellipsis",overflow:"hidden",whiteSpace: "nowrap"}}><label style={{fontWeight:"bold"}}>{noti.Title} : </label>{noti.Message}</div>
                        </MenuItem>)}
                        <MenuItem style={{borderTop:"1px rgba(0,0,0,.5) solid"}} onClick={() => {window.open("/Notify");notify.setNotifyState(false)}}>More...</MenuItem>
                      </MenuList>
                    </ClickAwayListener>
                  </Paper>
                </Grow>
            )}
        </Popper>
    </>
}