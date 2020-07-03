import React from "react";
import IconStatus from "./AmIconStatus";
import PropTypes from "prop-types";
import classNames from "classnames";
import { withStyles } from "@material-ui/core/styles";

const styles = theme => ({
  root: {
    minWidth: "2.2em",
    height: "1.725em"
  }
});
const DocumentEventStatus = [
  { status: "NEW", code: 10, label: "NEW" },
  { status: "WORKING", code: 11, label: "WORKING" },
  { status: "WORKED", code: 12, label: "WORKED" },
  { status: "REMOVING", code: 21, label: "REMOVING" },
  { status: "REMOVED", code: 22, label: "REMOVED" },
  // {status:'REJECTING' , code:23,},
  { status: "REJECTED", code: 24, label: "REJECTED" },
  { status: "CLOSING", code: 31, label: "CLOSING" },
  { status: "CLOSED", code: 32, label: "CLOSED" }
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
    <div style={{ display: "inline-block" }}>
      <IconStatus
        className={classNames(className, classes.root)}
        styleType={strStatus}
        {...other}
      >
        {strLabel}
      </IconStatus>
    </div>
  );
};
DocumentStatus.propTypes = {
  classes: PropTypes.object.isRequired,
  className: PropTypes.string,
  statusCode: PropTypes.number
};
export default withStyles(styles)(DocumentStatus);
