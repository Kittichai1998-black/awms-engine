import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';

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
      '"Segoe UI Symbol"'
    ].join(',')
  },
  progress: {
    margin: theme.spacing(2)
  },
  divfull: {
    top: '0 !important',
    left: '0 !important',
    position: 'fixed',
    boxOrient: 'horizontal',
    display: '-webkit-box',
    display: '-moz-box',
    display: '-ms-flexbox',
    display: '-moz-flex',
    display: '-webkit-flex',
    display: 'flex',
    padding: '0',
    margin: '0',
    width: '100%',
    height: '100%',
    textAlign: 'center',
    verticalAlign: 'middle !important',
    padding: '1em',
    backgroundColor: 'rgba(0,0,0,.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: '99999999'
  },
  divsub: {
    flex: '0 1 auto',
    display: 'flex',
    position: 'relative',
    textAlign: 'center',
    height: '100%',
    verticalAlign: 'center !important',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
function CircularIndeterminate(props) {
  const { classes } = props;
  return (
    <div
      id='divloading'
      style={{ display: 'none' }}
      className={classNames(classes.divfull, classes.root)}
    >
      <div className={classes.divsub}>
        <CircularProgress className={classes.progress} color='secondary' />
        <h5 style={{ color: '#fff' }}>{props.textshow}</h5>
      </div>
    </div>
  );
}

CircularIndeterminate.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(CircularIndeterminate);
