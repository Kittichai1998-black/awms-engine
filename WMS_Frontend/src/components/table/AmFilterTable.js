import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import Collapse from '@material-ui/core/Collapse';
import Paper from '@material-ui/core/Paper';
import AmButton from '../AmButton';
import { useTranslation } from 'react-i18next'

const styles = theme => ({
  root: {
    width: '100%'
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular
  },
  expand: {
    transform: 'rotate(0deg)',
    transition: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms'
  },
  collapse: {
    transform: 'rotate(180deg)',
    transition: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms'
  },
  container: {
    width: '100%',
    overflow: 'hidden',
    height: 'auto',
    background: 'red'
  },
  paper: {
    padding: '3px'
  }
});

const AmFilterTable = props => {
  const { t } = useTranslation()
  const [toggle, setToggle] = useState(false);
  const { classes } = props;
  return (
    <div className={classes.root}>
      {props.primarySearch ? (
        <div style={{ display: 'inline-block' }}>
          {props.primarySearch.map((row, idx) => {
            return row.component(props.defaultCondition, row, idx);
          })}
        </div>
      ) : null}
      {props.extensionSearch ? (
        <div style={{ display: 'inline', float: 'right' }}>
          <AmButton
            id='Filter_Advanced'
            styleType='confirm_clear'
            onClick={() => setToggle(!toggle)}
            append={ <ExpandLessIcon
              className={toggle ? classes.expand : classes.collapse}
            />}
          >Advanced Search</AmButton>
          <AmButton
            id='Filter_Search'
            styleType='confirm'
            onClick={() => {
              props.onAccept(true, props.extensionSearch);
              setToggle(false);
            }}
          >
            {t("Search")}
          </AmButton>
        </div>
      ) : <div style={{ display: 'inline', float: 'right' }}>
          <AmButton
            id='Filter_Search'
            styleType='confirm'
            onClick={() => {
              props.onAccept(true, props.extensionSearch);
              setToggle(false);
            }}
          >
            {t("Search")}
          </AmButton>
          </div>
        }
      <div style={{ clear: 'both' }} />
      <Collapse in={toggle}>
        <Paper elevation={4} className={classes.paper}>
          {props.extensionSearch ? props.extensionSearch.map((row, idx) => {
            return row.component(props.defaultCondition, row, idx);
          }) : null}
        </Paper>
      </Collapse>
    </div>
  );
};

AmFilterTable.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(AmFilterTable);