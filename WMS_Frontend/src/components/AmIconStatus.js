import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import AmToolTip from "./AmToolTip";

const styles = theme => ({
    root: {
        display: 'inline-flex',
        justifyContent: 'center',
        background: '#fff',
        color: "#23282c",
        border: '2px solid #c8ced3',
        borderRadius: '0.25rem',
        fontWeight: 'bold',
        fontSize: '90%',
        textAlign: 'center',
        alignItems: 'center',
        // lineHeight: 1,
        whiteSpace: 'nowrap',
        verticalAlign: 'baseline',
        // padding: '0.175rem 0.45rem 0.2rem 0.5rem',
        width: 'auto',
        fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
        ].join(','),
        '&.label': {
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        },
    },
    NEW: {
        background: '#fff',
        border: '2px solid #c8ced3',
        color: '#23282c',
    },
    WORKING: {
        background: '#fffbf1',
        border: '2px solid #ffc107',
        color: '#ffc107',
    },
    WORKED: {
        background: '#ffc107',
        border: '2px solid #ffc107',
        color: '#fff',
    },
    REMOVING: {
        background: '#f0f3f5',
        border: '2px solid #73818f',
        color: '#73818f',
    },
    REMOVED: {
        background: '#73818f',
        border: '2px solid #73818f',
        color: '#fff',
    },
    RECEIVING: {
        background: '#fffbf1',
        border: '2px solid #ffc107',
        color: '#2f353a',
    },
    RECEIVED: {
        background: '#ffc107',
        border: '2px solid #ffc107',
        color: '#2f353a',
    },
    REJECTING: {
        background: '#fff',
        border: '2px solid #f86c6b',
        color: '#f86c6b',
    },
    REJECTED: {
        background: '#f86c6b',
        border: '2px solid #f86c6b',
        color: '#fff',
    },
    CLOSING: {
        background: '#f0f3f5',
        border: '2px solid #3d6dff',
        color: '#3d6dff',
    },
    CLOSED: {
        background: '#3d6dff',
        border: '2px solid #3d6dff',
        color: '#fff',
    },
    PICKING: {
        background: '#f0f3f5',
        border: '2px solid #3d6dff',
        color: '#000',
    },
    PICKED: {
        background: '#3d6dff',
        border: '2px solid #3d6dff',
        color: '#000',
    },
    AUDITING: {
        background: '#eafff1',
        border: '2px solid #08c249',
        color: '#2f353a',
    },
    AUDITED: {
        background: '#08c249',
        border: '2px solid #08c249',
        color: '#eafff1',
    },
    PENDING: {
        background: '#3d6dff',
        border: '2px solid #3d6dff',
        color: '#e3e6e9',
    },
    HOLD: {
        background: '#212121',
        border: '2px solid #212121',
        color: '#fff',
    },
    RETURN: {
       /* background: '#ffc107',
        border: '2px solid #ffc107',
        color: '#fff',*/
        background: '#ffc107',
        border: '2px solid #ffc107',
        color: '#2f353a',
    },
    WARNING: {
        background: '#ffc107',
        border: '2px solid #ffc107',
        color: '#2f353a',
    },
    COMPLETING: {
        background: '#eafff1',
        border: '2px solid #08c249',
        color: '#2f353a',
    },
    INACTIVE: {
        background: '#effcf4',
        border: '2px solid #3a9d5d',
        color: '#3a9d5d',
    },
    ACTIVE: {
        background: '#4dbd74',
        border: '2px solid #4dbd74',
        color: '#fff',
    },
    REMOVE: {
        background: '#73818f',
        border: '2px solid #73818f',
        color: '#fff',
    },
    DONE: {
        background: '#3d6dff',
        border: '2px solid #3d6dff',
        color: '#fff',
    },
    WAIT_FOR_WORKED: {
        background: '#ffc107',
        border: '2px solid #ffc107',
        color: '#000',
    },
    QUALITY_CONTROL:{
        /*background: '#fffbf1',
        border: '2px solid #212121',
        color: '#212121',*/
        background: '#ffc107',
        border: '2px solid #ffc107',
        color: '#2f353a',
    },
    PARTIAL:{
       /* background: '#fffbf1',
        border: '2px solid #ffc107',
        color: '#ffc107',*/
        background: '#ffc107',
        border: '2px solid #ffc107',
        color: '#2f353a',
    }
});

function IconStatus(props) {
    const { children, classes, className, styleType, ...other } = props;
    return (
        <AmToolTip textTitle={styleType} placement={"top"} >
            <div className={classNames(
                classes.root, classes[`${styleType}`],
                className,
            )}
                {...other} >{children}</div>
        </AmToolTip>
    );
};

IconStatus.propTypes = {
    classes: PropTypes.object.isRequired,
    className: PropTypes.string,
    children: PropTypes.node.isRequired,
    styleType: PropTypes.string
}
export default withStyles(styles)(IconStatus);