import React, { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { LayoutContext } from '../reducers/context';
import { makeStyles } from '@material-ui/core/styles';
import * as signalR from '@aspnet/signalr';
import AmDropdownMenu from "../components/AmDropDownMenu";
import Axios from "axios";
import NotificationsIcon from '@material-ui/icons/Notifications';

const useStyles = makeStyles((theme) => ({
    grow: {
      flexGrow: 1,
    }
  }));

const NotifyBox = React.memo(({notify}) => {
  const customToggleBTN = React.forwardRef(({ children, onClick }, ref) => (
    <div
      ref={ref}
      onClick={(e) => {
          e.preventDefault();
          onClick(e);
      }}
      style={{cursor:"pointer", height:54,margin:"auto", userSelect:"none", padding:"15px 0", verticalAlign:"middle"}}
      >
      {children}
    </div>
  ));
  const reCreateItems = notify.notifyList.map(x=> {return {label:
        <div style={{cursor:"pointer", fontSize:"14px",width:"200px",textOverflow:"ellipsis",overflow:"hidden",whiteSpace: "nowrap"}}><label style={{fontWeight:"bold", margin:0}}>{x.Title} : </label>{x.Message}</div>
        , action:() => {
        notify.setNotifyState(false)
      }, selectable:true
    }
  });
  reCreateItems.push({label:"", action:() => {}, divider:true})
  reCreateItems.push({label:
      <div><label style={{fontWeight:"bold", margin:0}}><Link to={"/Notify"}>More...</Link></label></div>
      , action:() => {notify.setNotifyState(false)}
  })
  return <AmDropdownMenu customToggle={customToggleBTN} title={<div><NotificationsIcon /></div>} 
  id={"notifyBox"} 
  items={reCreateItems}/>
});

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

    return <>
      <NotifyBox notify={notify}/>
        {/* <Popper style={{zIndex:9999}} open={notify.notifyState} anchorEl={props.btnRef.current} role={undefined} transition disablePortal>
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
        </Popper> */}
    </>
}