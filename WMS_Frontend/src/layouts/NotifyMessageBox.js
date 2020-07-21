import React, { useContext } from "react";
import { LayoutContext } from "./reducers/context";
import Grow from '@material-ui/core/Grow';

const NotifyBox = (props) => {
    const {notify} = useContext(LayoutContext);

    return <>
        {({ TransitionProps, placement }) => (
            <Grow {...TransitionProps} style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}>
              
            </Grow>
        )}
    </>
}