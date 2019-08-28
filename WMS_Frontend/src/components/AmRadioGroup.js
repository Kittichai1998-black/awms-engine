import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';

const styles = theme => ({
  root: {
    display: 'flex'
  },
  formControl: {
    margin: theme.spacing(0)
  },
  group: {
    margin: theme.spacing(1, 0)  //`${theme.spacing(1)}px 0`
  },
  radio: {
    '&$checked': {
      color: '#4B8DF8'
    }
  },
  checked: {}
});

const RadioButtonsGroup = props => {
  const { classes, dataValue, name, formLabel, onChange, defaultValue, returnDefaultValue } = props;

  // const [Data, setData] = useState({});
  const [value, setValue] = useState(defaultValue.value);

  useEffect(() => {
    if (returnDefaultValue) {
      onChange(defaultValue.value, null, null, true);
    }
  }, []);

  const handleChange = event => {
    setValue(event.target.value);
    onChange(event.target.value, null, event.target, event);
  };

  //var RadioValue = props.value;
  return (
    <div className={classes.root}>
      <FormControl component='fieldset' className={classes.formControl}>
        <FormLabel component="legend">{formLabel}</FormLabel>
        <RadioGroup
          aria-label={name}
          name={name}
          className={classes.group}
          value={value}
          onChange={handleChange}
        >
          {dataValue ? dataValue.map((row, i) => {
            return (
              <FormControlLabel
                key={i}
                value={row.value}
                control={<Radio
                  color='primary'
                // disableRipple
                // classes={{root: classes.radio, checked: classes.checked}}
                />}
                checked={row.checked}
                disabled={row.value === defaultValue.value ? defaultValue.disabled !== null  ? defaultValue.disabled : row.disabled : row.disabled !== null  ? row.disabled : false}
                label={row.label} 
              />
            );
          }) : null}
        </RadioGroup>
      </FormControl>
    </div>
  );
};

RadioButtonsGroup.propTypes = {
  classes: PropTypes.object.isRequired,
  formLabel: PropTypes.string,
  name: PropTypes.string,
  dataValue: PropTypes.array,
  returnDefaultValue: PropTypes.bool,
  defaultValue: PropTypes.object,
  onChange: PropTypes.func,
};

export default withStyles(styles)(RadioButtonsGroup);
