import React from 'react';
import IconStatus from "./AmIconStatus";
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    root: {
        minWidth: '2em',
        height: '1.5em',
    }
});
const StorageObjectEventStatus = [
    { status: 'INACTIVE', code: 0, label: 'INACTIVE', labelShort: 'I' }, //เเดง
    { status: 'ACTIVE', code: 1, label: 'ACTIVE', labelShort: 'A' }, //เขียว
    { status: 'REMOVE', code: 2, label: 'REMOVE', labelShort: 'R' }, //เทา
    { status: 'DONE', code: 3, label: 'DONE', labelShort: 'D' }, //
    { status: "NEW", code: 100, label: 'NEW' },
    { status: "RECEIVING", code: 101, label: 'RECEIVING', labelShort: 'RC' },
    { status: "RECEIVED", code: 102, label: 'RECEIVED', labelShort: 'RC' },
    { status: "AUDITING", code: 103, label: 'AUDITING', labelShort: 'AD' },
    { status: "AUDITED", code: 104, label: 'AUDITEDAD', labelShort: 'AD' },
    { status: "COUNTING", code: 105, label: 'COUNTING', labelShort: 'CT' },
    { status: "COUNTED", code: 106, label: 'COUNTED', labelShort: 'CT' },
    { status: "ALLOCATING", code: 151, label: 'ALLOCATING', labelShort: 'AL' },
    { status: "ALLOCATED", code: 152, label: 'ALLOCATED', labelShort: 'AL' },
    { status: "PICKING", code: 153, label: 'PICKING', labelShort: 'PK' },
    { status: "PICKED", code: 154, label: 'PICKED', labelShort: 'PK' },
    { status: "CONSOLIDATING", code: 155, label: 'CONSOLIDATING', labelShort: 'CS' },
    { status: "CONSOLIDATED", code: 156, label: 'CONSOLIDATED', labelShort: 'CS' },
    { status: "LOADING", code: 157, label: 'LOADING', labelShort: 'LD' },
    { status: "LOADED", code: 158, label: 'LOADED', labelShort: 'LD' },
    { status: "REMOVING", code: 201, label: 'REMOVING', labelShort: 'RM' },
    { status: "REMOVED", code: 202, label: 'REMOVED', labelShort: 'RM' },
    { status: "CANCELING", code: 203, label: 'CANCELING', labelShort: 'CC' },
    { status: "CANCELED", code: 204, label: 'CANCELED', labelShort: 'CC' },
    { status: "SHIPPING", code: 301, label: 'SHIPPING', labelShort: 'SP' },
    { status: "SHIPPED", code: 302, label: 'SHIPPED', labelShort: 'SP' },

    { status: "HOLD", code: 99, label: 'HOLD', labelShort: 'HD' },
    { status: "QUALITY_CONTROL", code: 98, label: 'QUALITY_CONTROL', labelShort: 'QC' },
    { status: "PARTIAL", code: 97, label: 'PARTIAL', labelShort: 'PT' },
    { status: "RETURN", code: 96, label: 'RETURN', labelShort: 'RT' }
]

const StorageObjectStatus = props => {
    const { statusCode, classes, className, styleType, labelShort, ...other } = props;
    const result = StorageObjectEventStatus.filter(row => { return row.code === statusCode });
    let strStatus = "";
    let strLabel = "";
    let strLabelShort = "";
    if (result.length > 0) {
        strStatus = result[0].status
        strLabel = result[0].label
        strLabelShort = result[0].labelShort
    }
    return (
        <>
            <IconStatus
                className={classNames(className, classes.root)} styleType={strStatus} widthackground={strStatus}
                {...other}>{labelShort ? strLabelShort : strLabel}</IconStatus>
        </>
    );
};
StorageObjectStatus.propTypes = {
    classes: PropTypes.object.isRequired,
    className: PropTypes.string,
    statusCode: PropTypes.number,
    labelShort: PropTypes.bool
};
export default withStyles(styles)(StorageObjectStatus);