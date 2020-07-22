import React from 'react';
import IconStatus from "./AmIconStatus";
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
const styles = theme => ({
    root: {
        minWidth: '2.2em',
        height: '1.5em',
    }
});
const EventsStatus = [
    { status: 'NEW', code: 10, label: 'NW' },
    { status: 'WORKING', code: 11, label: 'WK' },
    { status: 'WORKED', code: 12, label: 'WK' },
    { status: 'REMOVING', code: 21, label: 'RM' },
    { status: 'REMOVED', code: 22, label: 'RM' },
    { status: 'CLOSING', code: 31, label: 'CS' },
    { status: 'CLOSED', code: 32, label: 'CS' },
    { status: 'WARNING', code: 90, label: 'WN' },
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