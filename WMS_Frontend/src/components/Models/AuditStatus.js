const AuditStatus = [
  { label: "QUARANTINE", value: "QUARANTINE" },
  { label: "PASSED", value: "PASSED" },
  { label: "NOTPASS", value: "NOTPASS" },
  { label: "REJECTED", value: "REJECTED" },
  { label: "HOLD", value: "HOLD" }

];

const AuditStatusVal = [
  { label: "QUARANTINE", value: 0 },
  { label: "PASSED", value: 1 },
  { label: "REJECTED", value: 2 },
  { label: "NOTPASSED", value: 3 },
  { label: 'QI', value: 4 },
  { label: 'ACC', value: 5 },
  { label: 'ACD', value: 6 },
  { label: 'ACN', value: 7 },
  { label: 'ACM', value: 8 },
  { label: 'HOLD', value: 9 },
  { label: 'BLOCK', value: 10 },
  { label: 'UR', value: 11 },
]

// const AuditStatus1_2 = AuditStatus.map(function (x) {
//   return { ...x, value: x.value.toString() }
// }).filter(y => { return y.value === '1' || y.value === '2' });

export { AuditStatus, AuditStatusVal }