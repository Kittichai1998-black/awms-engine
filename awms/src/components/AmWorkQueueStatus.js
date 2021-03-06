import React from 'react';
import IconStatus from "./AmIconStatus";
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
const styles = theme => ({
    root: {
        width: '1.725em',
        height: '1.725em',
    }
});
const EventsStatus = [
    { status: 'NEW', code: 10, label: 'N' },
    { status: 'WORKING', code: 11, label: 'W' },
    { status: 'WORKED', code: 12, label: 'W' },
    { status: 'REMOVING', code: 21, label: 'R' },
    { status: 'REMOVED', code: 22, label: 'R' },
    { status: 'CLOSING', code: 31, label: 'C' },
    { status: 'CLOSED', code: 32, label: 'C' },
    { status: 'WARNING', code: 90, label: 'W' },
]


const WorkQueueEventStatus = props => {
    const { statusCode, classes, className, styleType, ...other } = props;
    const result = EventsStatus.filter(row => { return row.code === statusCode });
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
WorkQueueEventStatus.propTypes = {
    classes: PropTypes.object.isRequired,
    className: PropTypes.string,
    statusCode: PropTypes.number
};
export default withStyles(styles)(WorkQueueEventStatus);