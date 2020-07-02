import { DocumentEventStatus } from "../../../components/Models/DocumentEventStatus";
import queryString from "query-string";


const DataGeneratePopup = (data) => {
  var qryStr = [{ label: "", value: 0, status: "", statusValue: null }];
  var qryStrOptions = queryString.parse(data.Options);
  let status = DocumentEventStatus.find(x => x.value === data.EventStatus).label;
  let statusValue = DocumentEventStatus.find(x => x.value === data.EventStatus).value;
  var _error = qryStrOptions._error
  var _info = qryStrOptions._info
  var _warning = qryStrOptions._warning

  if (_error != undefined && _error != "") {
    qryStr = [{ label: "error", value: _error, status: status, statusValue: statusValue }];
  } else if (_info != undefined && _info != "") {
    qryStr = [{ label: "info", value: _info, status: status, statusValue: statusValue }];
  } else if (_warning != undefined && _warning != "") {
    qryStr = [{ label: "warning", value: _warning, status: status, statusValue: statusValue }];
  }
  return qryStr
}
const DataGenerateStatus = (data) => {
  var qryStrStatus = [{ status: "", statusValue: null }];
  let status = DocumentEventStatus.find(x => x.value === data.EventStatus).label;
  let statusValue = DocumentEventStatus.find(x => x.value === data.EventStatus).value;

  qryStrStatus = [{ status: status, statusValue: statusValue }];

  return qryStrStatus
}

export { DataGeneratePopup, DataGenerateStatus }