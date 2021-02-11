import React from 'react';
import IconStatus from "./AmIconStatus";
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
const styles = theme => ({
    root: {
        minWidth: '1.725em',
        height: '1.5em',
    }
});
// const Status = [
//     { status: 'QUARANTINE', code: 0, label: 'QUARANTINE', labelShort: 'Q' }, //เเดง
//     { status: 'PASSED', code: 1, label: 'PASSED', labelShort: 'P' }, //เขียว
//     { status: 'REJECTED', code: 2, label: 'REJECTED', labelShort: 'R' }, //เทา
//     { status: 'NOTPASS', code: 3, label: 'NOTPASS', labelShort: 'N' }, //เขียว
//     { status: 'HOLD', code: 9, label: 'HOLD', labelShort: 'H' }, //
// ]

const Status = [
    { status: 'QI', code: 0, label: 'QI', labelShort: 'Q' }, //เเดง
    { status: 'ACC', code: 1, label: 'ACC', labelShort: 'CC' }, //เขียว
    { status: 'ACD', code: 2, label: 'ACD', labelShort: 'CD' }, //เทา
    { status: 'ACN', code: 3, label: 'ACN', labelShort: 'CN' }, //เขียว
    { status: 'ACM', code: 9, label: 'ACM', labelShort: 'CH' }, //
]
const AuditStatus = props => {
    const { statusCode, classes, className, styleType, labelShort, ...other } = props;
    const result = Status.filter(row => { return row.code === parseInt(statusCode) });
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
                className={classNames(className, classes.root)} styleType={strStatus}
                {...other}>{labelShort ? strLabelShort : strLabel}</IconStatus>
        </>
    );
};
AuditStatus.propTypes = {
    classes: PropTypes.object.isRequired,
    className: PropTypes.string,
    statusCode: PropTypes.number
};
export default withStyles(styles)(AuditStatus);