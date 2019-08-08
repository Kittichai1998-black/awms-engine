import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
    root: {
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
        color: '#20a8d8',
        textDecoration: 'underline',
        '&:hover': {
            color: '#f44336',
            textDecorationLine: 'none'
        }
    }
});

const LinkStyle = props => {
    const { children, classes, className, component, onClick, ...other } = props;
    const handleClick = (event) => {
        if (onClick)
          onClick(event.target.href, null, event.target, event)
      }
    return (
        <>
            <Link component={component}
                className={classNames(classes.root, className)}
                onClick={handleClick}
                {...other}>{children}</Link>
        </>
    );
};
LinkStyle.propTypes = {
    classes: PropTypes.object.isRequired,
    className: PropTypes.string,
    children: PropTypes.node.isRequired,
    component: PropTypes.any,
    onClick: PropTypes.func
};
export default withStyles(styles)(LinkStyle);