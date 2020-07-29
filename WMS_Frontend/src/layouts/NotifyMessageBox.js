import React, { useContext, useEffect, useState } from "react";
import { LayoutContext } from '../reducers/context';
import Grow from '@material-ui/core/Grow';
import { fade, makeStyles } from '@material-ui/core/styles';
import Popper from '@material-ui/core/Popper';

const useStyles = makeStyles((theme) => ({
    grow: {
      flexGrow: 1,
    }
  }));

const useNotify = (props) => {
  const [state, setstate] = useState([])
  useEffect(() => {}, [])
}

export default (props) => {
    const {notify} = useContext(LayoutContext);
    const classes = useStyles();
    console.log(props)
    return <>
        <Popper style={{zIndex:9999}} open={notify.notifyState} anchorEl={props.btnRef.current} role={undefined} transition disablePortal>
            {({ TransitionProps, placement }) => (
                <Grow {...TransitionProps} style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}>
                
                </Grow>
            )}
        </Popper>
    </>
}