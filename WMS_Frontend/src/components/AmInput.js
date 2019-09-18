import React, { useState } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import {
  createMuiTheme,
  MuiThemeProvider,
  withStyles
} from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import AmValidate from '../components/AmValidate';
import { indigo, grey, red } from '@material-ui/core/colors';
const styles = theme => ({
  root: {
    width: 'auto',
    backgroundColor: 'white',
    '&:after': {
      borderBottomColor: theme.status.primary.dark
    }
  },
  primary: {
    '&:after': {
      borderBottomColor: theme.status.primary.dark
    }
  },
  error: {
    '&:after': {
      borderBottomColor: theme.status.error.main
    }
  },
  default: {
    '&:after': {
      borderBottomColor: theme.status.default.main
    }
  },
  required: {
    color: red[600]
  }
});

function CustomTextField(props) {
  const {
    classes,
    className,
    styleType,
    defaultValue,
    disabled,
    required,
    onChange,
    onMouseOver,
    onMouseOut,
    onKeyPress,
    onKeyDown,
    onClick,
    onFocus,
    onBlur,
    InputProps = {},
    validate,
    msgError,
    msgSuccess,
    regExp,
    customValidate,
    styleValidate,
    ...other
  } = props;

  const [value, setValue] = useState(defaultValue ? defaultValue : '');

  const handleChange = event => {
    if (onChange) {
      setValue(event.target.value);
      onChange(event.target.value, null, event.target, event);
    }
  };
  const handleMouseOver = event => {
    if (onMouseOver) {
      setValue(event.target.value);
      onMouseOver(event.target.value, null, event.target, event);
    }
  };
  const handleMouseOut = event => {
    if (onMouseOut) {
      setValue(event.target.value);
      onMouseOut(event.target.value, null, event.target, event);
    }
  };
  const handleKeyPress = event => {
    if (onKeyPress) {
      setValue(event.target.value);
      onKeyPress(event.target.value, null, event.target, event);
    }
  };
  const handleKeyDown = event => {
    if (onKeyDown) {
      setValue(event.target.value);
      onKeyDown(event.target.value, null, event.target, event);
    }
  };
  const handleClick = event => {
    if (onClick) {
      setValue(event.target.value);
      onClick(event.target.value, null, event.target, event);
    }
  };
  const handleFocus = event => {
    if (onFocus) {
      setValue(event.target.value);
      onFocus(event.target.value, null, event.target, event);
    }
  };
  const handleBlur = event => {
    if (onBlur) {
      setValue(event.target.value);
      onBlur(event.target.value, null, event.target, event);
    } else if (onChange) {
      setValue(event.target.value);
      onChange(event.target.value, null, event.target, event);
    }
  };
  return (
    <>
      <TextField
        className={classNames(className)}
        InputProps={{
          classes: {
            root: classNames(classes.root, classes[`${styleType}`])
          },
          ...InputProps
        }}
        disabled={disabled}
        defaultValue={defaultValue}
        // onChange={handleChange}
        onMouseOver={handleMouseOver}
        onKeyPress={handleKeyPress}
        onKeyDown={handleKeyDown}
        onMouseOut={handleMouseOut}
        onClick={handleClick}
        onBlur={handleBlur}
        onFocus={handleFocus}
        {...other}
      />

      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          ...styleValidate
        }}
      >
        {required ? <label className={classes.required}>*</label> : null}
        {validate ? (
          <AmValidate
            value={value}
            msgSuccess={msgSuccess}
            msgError={msgError}
            customValidate={customValidate}
            regExp={regExp}
          />
        ) : null}
      </div>
    </>
  );
}
CustomTextField = withStyles(styles)(CustomTextField);

InputStyle.propTypes = {
  classes: PropTypes.object,
  className: PropTypes.string,
  color: PropTypes.string,
  styleType: PropTypes.string,
  InputProps: PropTypes.object,
  onChange: PropTypes.func,
  onMouseOver: PropTypes.func,
  onMouseOut: PropTypes.func,
  onKeyPress: PropTypes.func,
  onClick: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  validate: PropTypes.bool,
  defaultValue: PropTypes.any,
  disabled: PropTypes.bool
};
const theme = createMuiTheme({
  status: {
    primary: {
      light: indigo[100],
      main: indigo[400],
      dark: indigo[800],
      contrastText: '#fff'
    },
    error: {
      light: red[100],
      main: red[400],
      dark: red[800],
      contrastText: '#000'
    },
    default: {
      light: grey[100],
      main: grey[600],
      dark: grey[800],
      contrastText: '#000'
    },
    disabled: grey[500]
  },
  typography: { useNextVariants: true }
});

function InputStyle(props) {
  return (
    <MuiThemeProvider theme={theme}>
      <CustomTextField {...props} />
      {props.children}
    </MuiThemeProvider>
  );
}
export default InputStyle;
