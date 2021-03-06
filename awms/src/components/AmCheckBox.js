import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Checkbox from '@material-ui/core/Checkbox';

const styles = theme => ({
  root: {
    display: 'flex'
  },
  formControl: {
    margin: theme.spacing(0)
  }
});

const AmCheckBox = props => {
  const [data, setdata] = useState({});

  useEffect(() => {
    props.onChange(data);
  });

  const handleChange = event => {
    setdata({ checked: event.target.checked, value: event.target.value });
    console.log(data);
  };

  const { classes } = props;

  return (
    <div className={classes.root}>
      <FormControl component='fieldset' className={classes.formControl}>
        <FormLabel component='legend' />
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                color='primary'
                onChange={handleChange}
                value={props.value}
                checked={props.checked}
              />
            }
            label={props.label}
          />
        </FormGroup>
      </FormControl>
    </div>
  );
};

AmCheckBox.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(AmCheckBox);
