const StorageObjectEvenstatus = [
  { label: "RECEIVING", value: 11 },
  { label: "RECEIVED", value: 12 },
  { label: "AUDITING", value: 13 },
  { label: "AUDITED", value: 14 },
  { label: "PICKING", value: 33 },
];
const StorageObjectEvenstatusTxt = [
  { label: "RECEIVING", value: "%RECEIVING%" },
  { label: "RECEIVED", value: "%RECEIVED%" },
  { label: "AUDITING", value: "%AUDITING%" },
  { label: "AUDITED", value: "%AUDITED%" },
  { label: "PICKING", value: "%PICKING%" },
];
const StorageObjectEvenStatusAll = [
  { label: "INACTIVE", value: 0 },
  { label: "ACTIVE", value: 1 },
  { label: "REMOVE", value: 2 },
  { label: "DONE", value: 3 },
  { label: "NEW", value: 10 },
  { label: "RECEIVING", value: 11 },
  { label: "RECEIVED", value: 12 },
  { label: "AUDITING", value: 13 },
  { label: "AUDITED", value: 14 },
  { label: "COUNTING", value: 15 },
  { label: "COUNTED", value: 16 },
  { label: "REMOVING", value: 21 },
  { label: "REMOVED", value: 22 },
  { label: "CANCELING", value: 23 },
  { label: "CANCELED", value: 24 },
  { label: "ALLOCATING", value: 31 },
  { label: "ALLOCATED", value: 32 },
  { label: "PICKING", value: 33 },
  { label: "PICKED", value: 34 },
  { label: "CONSOLIDATING", value: 35 },
  { label: "CONSOLIDATED", value: 36 },
 
];
const AuditStatus = [
  { label: "QUARANTINE", value: 0 },
  { label: "PASSED", value: 1 },
  { label: "REJECTED", value: 2 },
  { label: "HOLD", value: 9 },
]
const AuditStatus1_2 = AuditStatus.map(function (x) {
  return { ...x, value: x.value.toString() }
}).filter(y => { return y.value === '1' || y.value === '2' });

export { StorageObjectEvenstatus, StorageObjectEvenstatusTxt, StorageObjectEvenStatusAll, AuditStatus, AuditStatus1_2 }

