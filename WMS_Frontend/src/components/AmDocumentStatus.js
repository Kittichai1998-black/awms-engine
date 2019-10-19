import React from "react";
import IconStatus from "./AmIconStatus";
import PropTypes from "prop-types";
import classNames from "classnames";
import { withStyles } from "@material-ui/core/styles";

const styles = theme => ({
  root: {
    minWidth: '1.85em',
    height: "1.725em"
  }
});
const DocumentEventStatus = [
  { status: "NEW", code: 10, label: "N" },
  { status: "WORKING", code: 11, label: "WK" },
  { status: "WORKED", code: 12, label: "WK" },
  { status: "WAIT_FOR_WORKED", code: 812, label: "WA" },
  { status: "REMOVING", code: 21, label: "RM" },
  { status: "REMOVED", code: 22, label: "RM" },
  // {status:'REJECTING' , code:23,},
  { status: "REJECTED", code: 24, label: "RJ" },
  { status: "CLOSING", code: 31, label: "CL" },
  { status: "CLOSED", code: 32, label: "CL" }
];

const DocumentStatus = props => {
  const { statusCode, classes, className, styleType, ...other } = props;
  const result = DocumentEventStatus.filter(row => {
    return row.code === statusCode;
  });
  let strStatus = "";
  let strLabel = "";
  if (result.length > 0) {
    strStatus = result[0].status;
    strLabel = result[0].label;
  }
  return (
    <>
      <IconStatus
        className={classNames(className, classes.root)}
        styleType={strStatus}
        {...other}
      >
        {strLabel}
      </IconStatus>
    </>
  );
};
DocumentStatus.propTypes = {
  classes: PropTypes.object.isRequired,
  className: PropTypes.string,
  statusCode: PropTypes.number
};
export default withStyles(styles)(DocumentStatus);
