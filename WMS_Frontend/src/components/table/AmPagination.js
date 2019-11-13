import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import TablePagination from '@material-ui/core/TablePagination';
import IconButton from '@material-ui/core/IconButton';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import LastPageIcon from '@material-ui/icons/LastPage';

export default props => {
  const [page, setPage] = useState(0);

  useEffect(() => {
    props.onPageChange(page);
  }, [page]);

  useEffect(() => {
    if (props.resetPage) setPage(0);
  }, [props.resetPage]);

  return (
    <TablePagination
      style={{ marginRight: '20px', float:"right" }}
      colSpan={3}
      rowsPerPageOptions={[]}
      component='div'
      count={props.totalSize ? props.totalSize : 0}
      rowsPerPage={props.pageSize}
      page={page}
      backIconButtonProps={{
        'aria-label': 'Previous Page'
      }}
      nextIconButtonProps={{
        'aria-label': 'Next Page'
      }}
      SelectProps={{ displayEmpty: 'false' }}
      labelRowsPerPage={null}
      onChangePage={(e, page) => setPage(page)}
      onChangeRowsPerPage={(e, page) => setPage(page)}
      ActionsComponent={TablePaginationActionsWrapped}
    />
  );
};

const actionsStyles = theme => ({
  root: {
    flexShrink: 0,
    color: theme.palette.text.secondary,
    marginLeft: theme.spacing(2.5),
  }
});

const TablePaginationActions = props => {
  const handleFirstPageButtonClick = event => {
    props.onChangePage(event, 0);
  };

  const handleBackButtonClick = event => {
    props.onChangePage(event, props.page - 1);
  };

  const handleNextButtonClick = event => {
    props.onChangePage(event, props.page + 1);
  };

  const handleLastPageButtonClick = event => {
    props.onChangePage(
      event,
      Math.max(0, Math.ceil(props.count / props.rowsPerPage) - 1)
    );
  };

  const { classes, count, page, rowsPerPage, theme } = props;

  return (
    <div className={classes.root}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label='First Page'
      >
        {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label='Previous Page'
      >
        {theme.direction === 'rtl' ? (
          <KeyboardArrowRight />
        ) : (
          <KeyboardArrowLeft />
        )}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label='Next Page'
      >
        {theme.direction === 'rtl' ? (
          <KeyboardArrowLeft />
        ) : (
          <KeyboardArrowRight />
        )}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label='Last Page'
      >
        {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </div>
  );
};

TablePaginationActions.propTypes = {
  classes: PropTypes.object.isRequired,
  count: PropTypes.number.isRequired,
  onChangePage: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  theme: PropTypes.object.isRequired,
  resetPage: PropTypes.object
};

const TablePaginationActionsWrapped = withStyles(actionsStyles, {
  withTheme: true
})(TablePaginationActions);
