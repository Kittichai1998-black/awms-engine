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
    { status: "NEW", code: 10, label: 'NEW' },
    { status: "RECEIVING", code: 11, label: 'RECEIVING', labelShort: 'RC' },
    { status: "RECEIVED", code: 12, label: 'RECEIVED', labelShort: 'RC' },
    { status: "AUDITING", code: 13, label: 'AUDITING', labelShort: 'AD' },
    { status: "AUDITED", code: 14, label: 'AUDITEDAD', labelShort: 'AD' },
    { status: "COUNTING", code: 15, label: 'COUNTING', labelShort: 'CT' },
    { status: "COUNTED", code: 16, label: 'COUNTED', labelShort: 'CT' },
   
    { status: "REMOVING", code: 21, label: 'REMOVING', labelShort: 'RM' },
    { status: "REMOVED", code: 22, label: 'REMOVED', labelShort: 'RM' },
    { status: "CANCELING", code: 23, label: 'CANCELING', labelShort: 'CC' },
    { status: "CANCELED", code: 24, label: 'CANCELED', labelShort: 'CC' },

    { status: "ALLOCATING", code: 31, label: 'ALLOCATING', labelShort: 'AL' },
    { status: "ALLOCATED", code: 32, label: 'ALLOCATED', labelShort: 'AL' },
    { status: "PICKING", code: 33, label: 'PICKING', labelShort: 'PK' },
    { status: "PICKED", code: 34, label: 'PICKED', labelShort: 'PK' },
    { status: "CONSOLIDATING", code: 35, label: 'CONSOLIDATING', labelShort: 'CS' },
    { status: "CONSOLIDATED", code: 36, label: 'CONSOLIDATED', labelShort: 'CS' },

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