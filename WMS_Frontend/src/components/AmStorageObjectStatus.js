import React from 'react';
import IconStatus from "./AmIconStatus";
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    root: {
        minWidth: '2em',
        height: '1.725em',
    }
});
const StorageObjectEventStatus = [
    { status: "NEW", code: 100, label: 'NEW' },
    { status: "RECEIVING", code: 101, label: 'RECEIVING' },
    { status: "RECEIVED", code: 102, label: 'RECEIVED' },
    { status: "AUDITING", code: 103, label: 'AUDITING' },
    { status: "AUDITED", code: 104, label: 'AUDITEDAD' },
    { status: "COUNTING", code: 105, label: 'COUNTING' },
    { status: "COUNTED", code: 106, label: 'COUNTED' },
    { status: "ALLOCATING", code: 151, label: 'ALLOCATING' },
    { status: "ALLOCATED", code: 152, label: 'ALLOCATED' },
    { status: "PICKING", code: 153, label: 'PICKING' },
    { status: "PICKED", code: 154, label: 'PICKED' },
    { status: "CONSOLIDATING", code: 155, label: 'CONSOLIDATING' },
    { status: "CONSOLIDATED", code: 156, label: 'CONSOLIDATED' },
    { status: "LOADING", code: 157, label: 'LOADING' },
    { status: "LOADED", code: 158, label: 'LOADED' },
    { status: "REMOVING", code: 201, label: 'REMOVING' },
    { status: "REMOVED", code: 202, label: 'REMOVED' },
    { status: "CANCELING", code: 203, label: 'CANCELING' },
    { status: "CANCELED", code: 204, label: 'CANCELED' },
    { status: "SHIPPING", code: 301, label: 'SHIPPING' },
    { status: "SHIPPED", code: 302, label: 'SHIPPED' },

    { status: "HOLD", code: 99, label: 'HD' },
    { status: "QUALITY_CONTROL", code: 98, label: 'QC' },
    { status: "PARTIAL", code: 97, label: 'PT' },
    { status: "RETURN", code: 96, label: 'RT' }
]

const StorageObjectStatus = props => {
    const { statusCode, classes, className, styleType, ...other } = props;
    const result = StorageObjectEventStatus.filter(row => { return row.code === statusCode });
    let strStatus = "";
    let strLabel = "";
    if (result.length > 0) {
        strStatus = result[0].status
        strLabel = result[0].label
    }
    return (
        <>
            <IconStatus
                className={classNames(className, classes.root)} styleType={strStatus}
                {...other}>{strLabel}</IconStatus>
        </>
    );
};
StorageObjectStatus.propTypes = {
    classes: PropTypes.object.isRequired,
    className: PropTypes.string,
    statusCode: PropTypes.number
};
export default withStyles(styles)(StorageObjectStatus);