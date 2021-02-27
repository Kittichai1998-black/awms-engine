import React from "react";
import IconStatus from "./AmIconStatus";
import PropTypes from "prop-types";
import classNames from "classnames";
import { withStyles } from "@material-ui/core/styles";

const styles = theme => ({
  root: {
    minWidth: "2.2em",
    height: "1.5em"
  }
});
const DocumentEventStatus = [
  { status: "NEW", code: 10, label: "NEW", labelShort: 'N' },
  { status: "WORKING", code: 11, label: "WORKING", labelShort: 'WK' },
  { status: "WORKED", code: 12, label: "WORKED", labelShort: 'WK' },
  { status: "REMOVING", code: 21, label: "REMOVING", labelShort: 'RM' },
  { status: "REMOVED", code: 22, label: "REMOVED", labelShort: 'RM' },
  // {status:'REJECTING' , code:23,},
  { status: "REJECTED", code: 24, label: "REJECTED", labelShort: 'RJ' },
  { status: "CLOSING", code: 31, label: "CLOSING", labelShort: 'CS' },
  { status: "CLOSED", code: 32, label: "CLOSED", labelShort: 'CS' }
];

const DocumentStatus = props => {
  const { statusCode, classes, className, styleType, labelShort, ...other } = props;
  const result = DocumentEventStatus.filter(row => {
    return row.code === statusCode;
  });
  let strStatus = "";
  let strLabel = "";
  let strLabelShort = "";
  if (result.length > 0) {
    strStatus = result[0].status;
    strLabel = result[0].label;
    strLabelShort = result[0].labelShort
  }
  return (
    <div style={{ display: "inline-block", paddingRight: "5px" }}>
      <IconStatus
        className={classNames(className, classes.root)}
        styleType={strStatus}
        {...other}
      >
        {labelShort ? strLabelShort : strLabel}
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
