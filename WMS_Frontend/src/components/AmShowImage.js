import React from 'react';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import PhotoIcon from '@material-ui/icons/Photo';
import classNames from 'classnames';

const useStyles = makeStyles((theme) => ({
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    }
}));

export default function SimpleBackdrop(props) {
    const classes = useStyles();
    // const [open, setOpen] = React.useState(false);
    const [imgFile, setImgFile] = React.useState(null);
    const [circleLoad, setCircleLoad] = React.useState(null);

    React.useEffect(() => {
        if (props.open) {
            console.log("ddd")
            setCircleLoad(<CircularProgress color='secondary' />)
            setImgFile(<img src={props.src} onLoad={loadImage} style={{ height: '100%' }} />)
        }
        // return () => {
        //     cleanup
        // }
    }, [props.open])
    const loadImage = () => {
        setCircleLoad(null)
    }
    const handleClose = () => {
        // setOpen(false);
        props.onClose(!props.open)
        setImgFile(null);
        setCircleLoad(null);
    };
    // const handleToggle = () => {
    //     setOpen(!open);
    // };

    return (
        <div>
            {/* <IconButton
                size="small"
                aria-label="info"
                onClick={handleToggle}
                style={{ marginLeft: "3px" }}
            >
                <PhotoIcon fontSize="small" color="primary" />
            </IconButton> */}
            <Backdrop 
            className={classNames(classes.backdrop, classes.root)} 
            open={props.open} onClick={handleClose}
            // transitionDuration={1000}
            >
                {circleLoad ? circleLoad : null}
                {imgFile ? imgFile : null}
            </Backdrop>
        </div>
    );
}
