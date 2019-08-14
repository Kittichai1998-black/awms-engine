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
const EntityEventStatus = [
    { status: 'INACTIVE', code: 0, label: 'I' }, //เเดง
    { status: 'ACTIVE', code: 1, label: 'A' }, //เขียว
    { status: 'REMOVE', code: 2, label: 'R' }, //เทา
    { status: 'DONE', code: 3, label: 'D' }, //
]


const EntityStatus = props => {
    const { statusCode, classes, className, styleType, ...other } = props;
    const result = EntityEventStatus.filter(row => { return row.code === statusCode });
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
EntityStatus.propTypes = {
    classes: PropTypes.object.isRequired,
    className: PropTypes.string,
    statusCode: PropTypes.number
};
export default withStyles(styles)(EntityStatus);