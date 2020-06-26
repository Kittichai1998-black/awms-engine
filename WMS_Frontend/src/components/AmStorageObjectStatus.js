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
    { status: "NEW", code: 10, label: 'NW' },
    { status: "RECEIVING", code: 101, label: 'RECEIVING' },
    { status: "RECEIVED", code: 102, label: 'RECEIVED' },
    { status: "AUDITING", code: 103, label: 'AUDITING' },
    { status: "AUDITED", code: 104, label: 'AUDITEDAD' },
    // {status: "ISSUING",code: 15},
    // {status: "ISSUED",code: 16},
    { status: "PICKING", code: 153, label: 'PICKING' },
    { status: "PICKED", code: 154, label: 'PICKED' },
    { status: "REMOVING", code: 21, label: 'REMOVING' },
    { status: "REMOVED", code: 22, label: 'REMOVED' },
    { status: "REJECTING", code: 23, label: 'RJ' },
    { status: "REJECTED", code: 24, label: 'RJ' },
    // {status: "CORRECTING",code: 25, label: 'C'},
    // {status: "CORRECTED",code: 26, label: 'C'},
    // {status: "LOADING",code: 31, label: 'L'},
    // {status: "LOADED",code: 32, label: 'L'},
    // {status: "SHIPPING",code: 33, label: 'S'},
    // {status: "SHIPPED", code: 34, label: 'S'},
    // {status: "CONSOLIDATING",code: 111, label: 'C'},
    // {status: "CONSOLIDATED",code: 112, label: 'C'},
    // {status: "MOVING",code: 113, label: 'M'},
    // {status: "MOVED",code: 114, label: 'M'},
    // {status: "TRANSFERING",code: 115, label: 'T'},
    // {status: "TRANSFERED",code: 116, label: 'T'}
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