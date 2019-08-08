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
    margin: `${theme.spacing(1)}px 0`
  }
});

const RadioButtonsGroup = props => {
  const [Data, setData] = useState({});
  const [value, setValue] = useState();

  useEffect(() => {
    props.onChange(Data);
  });

  const handleChange = event => {
    setValue(value);
  };

  var RadioValue = props.value;
  const { classes } = props;
  return (
    <div className={classes.root}>
      <FormControl component='fieldset' className={classes.formControl}>
        <FormLabel component='legend' />
        <RadioGroup
          aria-label='Gender'
          name='gender1'
          className={classes.group}
          value={value}
          onChange={handleChange}
        >
          {RadioValue.map(row => {
            return (
              <FormControlLabel
                value={row.value}
                control={<Radio color='primary' />}
                label={row.label}
                onChange={e => {
                  setData({ checked: e.target.checked, value: e.target.value });
                }}
              />
            );
          })}
        </RadioGroup>
      </FormControl>
    </div>
  );
};

RadioButtonsGroup.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(RadioButtonsGroup);
