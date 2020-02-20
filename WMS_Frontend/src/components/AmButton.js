import Button from '@material-ui/core/Button';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { withStyles } from '@material-ui/core/styles';

import {
    red,
    purple,
    indigo,
    blue,
    lightBlue,
    green,
    lightGreen,
    yellow,
    amber,
    grey,
    blueGrey,
    brown,
    orange
} from '@material-ui/core/colors';
import { useTranslation } from 'react-i18next'

// 1. We define the styles.
const styles = theme => ({
    root: {
        fontWeight: '600',
        color: '#fff',
        textTransform: 'none',
        lineHeight: 1.75,
        width: 'auto',
        // minWidth: '130px',
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
        '&:active': {
            boxShadow: '0 5px 12px rgba(0,0,0,0.4)',
            transition: 'opacity 0.3s ease-in-out',
        }
    },
    add: {
        border: '0',
        boxShadow: '0px 1px 5px 0px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 3px 1px -2px rgba(0,0,0,0.12)',
        backgroundColor: green[500],
        '&:hover': {
            backgroundColor: green[800],
        },
        '&:disabled': {
            color: green[900],
            backgroundColor: green[800],
        },
        '&:active': {
            backgroundColor: green[800],
        }
    },
    add_clear: {
        color: green[900],
        '&:hover': {
            backgroundColor: green[50],
        },
        '&:disabled': {
            color: grey[600],
        },
        '&:active': {
            boxShadow: 'none',
            backgroundColor: green[50],
        }
    },
    add_outline: {
        color: green[900],
        border: '1px solid rgba(76, 175, 80, 0.79)',
        '&:hover': {
            backgroundColor: green[100],
        },
        '&:active': {
            boxShadow: 'none',
            backgroundColor: green[100],
            borderColor: green[600],
        },
        '&:disabled': {
            color: green[900],
            backgroundColor: green[50],
        }
    },
    delete: {
        border: '0',
        boxShadow: '0px 1px 5px 0px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 3px 1px -2px rgba(0,0,0,0.12)',
        backgroundColor: red[500],
        '&:hover': {
            backgroundColor: red[700],
        },
        '&:disabled': {
            color: red[900],
            backgroundColor: red[700],
        },
        '&:active': {
            backgroundColor: red[700],
        }
    },
    delete_clear: {
        color: red[900],
        '&:hover': {
            backgroundColor: red[50],
        },
        '&:disabled': {
            color: grey[600],
        },
        '&:active': {
            boxShadow: 'none',
            backgroundColor: red[50],
        }
    },
    delete_outline: {
        color: red[900],
        border: '1px solid rgba(183,28,28, 0.79)',
        '&:hover': {
            backgroundColor: red[100],
        },
        '&:active': {
            boxShadow: 'none',
            backgroundColor: red[100],
            borderColor: red[600],
        },
        '&:disabled': {
            color: red[900],
            backgroundColor: red[50],
        }
    },
    confirm: {
        border: '0',
        boxShadow: '0px 1px 5px 0px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 3px 1px -2px rgba(0,0,0,0.12)',
        backgroundColor: indigo[500],
        '&:hover': {
            backgroundColor: indigo[700],
        },
        '&:disabled': {
            color: indigo[900],
            backgroundColor: indigo[700],
        },
        '&:active': {
            backgroundColor: indigo[700],
        }
    },
    confirm_clear: {
        color: indigo[900],
        '&:hover': {
            backgroundColor: indigo[50],
        },
        '&:disabled': {
            color: grey[600],
        },
        '&:active': {
            boxShadow: 'none',
            backgroundColor: indigo[50],
        }
    },
    confirm_outline: {
        color: indigo[900],
        border: '1px solid rgba(13,71,161,0.79)',
        '&:hover': {
            backgroundColor: indigo[100],
        },
        '&:active': {
            boxShadow: 'none',
            backgroundColor: indigo[100],
            borderColor: indigo[600],
        },
        '&:disabled': {
            color: indigo[900],
            backgroundColor: indigo[50],
        }
    },
    info: {
        border: '0',
        boxShadow: '0px 1px 5px 0px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 3px 1px -2px rgba(0,0,0,0.12)',
        backgroundColor: lightBlue[400],
        '&:hover': {
            color: '#fff',
            backgroundColor: lightBlue[600],
        },
        '&:disabled': {
            color: lightBlue[900],
            backgroundColor: lightBlue[600],
        },
        '&:active': {
            backgroundColor: lightBlue[600],
        }
    },
    info_clear: {
        color: lightBlue[900],
        '&:hover': {
            backgroundColor: lightBlue[50],
        },
        '&:disabled': {
            color: grey[600],
        },
        '&:active': {
            boxShadow: 'none',
            backgroundColor: lightBlue[50],
        }
    },
    info_outline: {
        color: lightBlue[700],
        border: '1px solid rgba(3,155,229,0.79)',
        '&:hover': {
            backgroundColor: lightBlue[100],
        },
        '&:active': {
            boxShadow: 'none',
            backgroundColor: lightBlue[100],
            borderColor: lightBlue[200],
        },
        '&:disabled': {
            color: lightBlue[900],
            backgroundColor: lightBlue[50],
        }
    },
    warning: {
        color: grey[900],
        border: '0',
        boxShadow: '0px 1px 5px 0px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 3px 1px -2px rgba(0,0,0,0.12)',
        backgroundColor: yellow[700],
        '&:hover': {
            backgroundColor: yellow[800],
        },
        '&:disabled': {
            color: orange[800],
            backgroundColor: yellow[800],
        },
        '&:active': {
            backgroundColor: yellow[800],
        }
    },
    warning_clear: {
        color: yellow[900],
        '&:hover': {
            backgroundColor: amber[100],
        },
        '&:disabled': {
            color: grey[600],
        },
        '&:active': {
            boxShadow: 'none',
            backgroundColor: amber[100],
        }
    },
    warning_outline: {
        color: orange[800],
        border: '1px solid rgba(255,111,0,0.79)',
        '&:hover': {
            backgroundColor: amber[100],
        },
        '&:active': {
            boxShadow: 'none',
            backgroundColor: amber[100],
            borderColor: amber[600],
        },
        '&:disabled': {
            color: orange[800],
            backgroundColor: amber[50],
        }
    },
    default: {
        color: grey[900],
        border: '0',
        boxShadow: '0px 1px 5px 0px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 3px 1px -2px rgba(0,0,0,0.12)',
        backgroundColor: grey[200],
        '&:hover': {
            backgroundColor: grey[300],
        },
        '&:disabled': {
            color: grey[500],
            backgroundColor: grey[300],
        },
        '&:active': {
            backgroundColor: grey[300],
        }
    },
    default_clear: {
        color: grey[800],
        '&:hover': {
            backgroundColor: grey[200],
        },
        '&:disabled': {
            color: grey[600],
        },
        '&:active': {
            boxShadow: 'none',
            backgroundColor: grey[50],
        }
    },
    default_outline: {
        color: grey[900],
        border: '1px solid rgba(158,158,158,0.79)',
        '&:hover': {
            backgroundColor: grey[300],
        },
        '&:active': {
            boxShadow: 'none',
            backgroundColor: grey[200],
            borderColor: grey[500],
        },
        '&:disabled': {
            color: grey[900],
            backgroundColor: grey[200],
            borderColor: grey[300],
        }
    },
    dark: {
        color: grey[900],
        border: '0',
        boxShadow: '0px 1px 5px 0px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 3px 1px -2px rgba(0,0,0,0.12)',
        backgroundColor: grey[500],
        '&:hover': {
            color: '#fff',
            backgroundColor: grey[800],
        },
        '&:disabled': {
            color: grey[900],
            backgroundColor: grey[800],
        },
        '&:active': {
            backgroundColor: grey[800],
        }
    },
    dark_clear: {
        color: grey[900],
        '&:hover': {
            backgroundColor: grey[500],
        },
        '&:disabled': {
            color: grey[600],
        },
        '&:active': {
            boxShadow: 'none',
            backgroundColor: grey[500],
        }
    },
    dark_outline: {
        color: grey[900],
        border: '1px solid rgba(33,33,33,0.79)',
        '&:hover': {
            backgroundColor: grey[400],
        },
        '&:active': {
            boxShadow: 'none',
            backgroundColor: grey[100],
            borderColor: grey[400],
        },
        '&:disabled': {
            color: grey[900],
            backgroundColor: grey[400],
            borderColor: grey[500],
        }
    },
});

function ButtonStyle(props) {
    const {
        children,
        classes,
        className,
        styleType,
        onClick,
        onMouseDown,
        onMouseUp,
        append,
        ...other } = props;
    const { t } = useTranslation();
    const handleMouseDown = (event) => {
        if (onMouseDown)
            onMouseDown(null, null, event.target, event)
    }
    const handleMouseUp = (event) => {
        if (onMouseUp)
            onMouseUp(null, null, event.target, event)
    }
    const handleClick = (event) => {
        if (onClick)
            onClick(null, null, event.target, event)
    }
    return (
        <Button
            className={classNames(
                classes.root, classes[`${styleType}`],
                className,
            )}
            onClick={handleClick}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            {...other}
        >
            {t(children)}
            {append}

        </Button>
    );
}

ButtonStyle.propTypes = {
    children: PropTypes.node.isRequired,
    classes: PropTypes.object.isRequired,
    className: PropTypes.string,
    styleType: PropTypes.string,
    onClick: PropTypes.func,
    onMouseDown: PropTypes.func,
    onMouseUp: PropTypes.func,
};

export default withStyles(styles)(ButtonStyle);