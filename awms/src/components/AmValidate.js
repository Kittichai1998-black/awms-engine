import React, { useState, useEffect } from "react";
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { green, red } from '@material-ui/core/colors';

const AmValidate = withStyles(theme => ({
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
    },
    success: {
        color: green[500]
    },
    error: {
        color: red[800]
    }
}))(props => {
    const {
        classes,
        value,
        msgSuccess,
        msgError,
        regExp,
        customValidate
    } = props;
    const [resValid, setResValid] = useState(true);
    const [showValid, setShowValid] = useState(true);
    useEffect(() => {
         var values = value.toString();
        if (regExp) {
            if (values.match(regExp)) {
                // console.log("true")
                setResValid(true);
            } else {
                // console.log("false")
                setResValid(false);
            }
            if(values.length > 0){
                setShowValid(true)
            }else{
                setShowValid(false)
            }
            if(regExp == "/^.+$/"){
                // console.log(regExp)
                setShowValid(true)
            } 
        } else if (customValidate) {
            // console.log("func")
            setResValid(customValidate(values))
            if(values.length > 0){
                setShowValid(true)
            }else{
                setShowValid(false)
            }
        }

    }, [value, regExp, customValidate])

    return (
        showValid ?
            resValid ?
                <label className={classNames(classes.success, classes.root)}>{msgSuccess}</label>
                : <label className={classNames(classes.error, classes.root)}>{msgError}</label>
            : null
    );
});
AmValidate.propTypes = {
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]).isRequired,
    msgSuccess: PropTypes.string,
    msgError: PropTypes.string,
    regExp: PropTypes.any,
    customValidate: PropTypes.func
}
AmValidate.defaultProps = {
    value: "",
    msgSuccess: "",
    msgError: ""
}
export default AmValidate;
