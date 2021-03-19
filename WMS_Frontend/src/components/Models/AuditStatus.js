const AuditStatus = [
  { label: "QUARANTINE", value: "QUARANTINE" },
  { label: "PASSED", value: "PASSED" },
  { label: "NOTPASS", value: "NOTPASS" },
  { label: "REJECTED", value: "REJECTED" },
  { label: "HOLD", value: "HOLD" },
  { label: 'QI', value: 'QI' },
  { label: 'ACC', value: 'ACC' },
  { label: 'ACD', value: 'ACD' },
  { label: 'ACN', value: 'ACN' },
  { label: 'ACM', value: 'ACM' },
  { label: 'HOLD', value: 'HOLD' },
  { label: 'BLOCK', value: 'BLOCK' },
  { label: 'UR', value: 'UR' },
];
const AuditStatusGCL = [
  { label: 'QI', value: '4' },
  { label: 'ACC', value: '5' },
  { label: 'ACD', value: '6' },
  { label: 'ACN', value: '7' },
  { label: 'ACM', value: '8' },
  { label: 'HOLD', value: '9' },
  { label: 'BLOCK', value: '10' },
  { label: 'UR', value: '11' },

];
const AuditStatusVal = [
  // { label: "QUARANTINE", value: 0 },
  // { label: "PASSED", value: 1 },
  // { label: "REJECTED", value: 2 },
  // { label: "NOTPASSED", value: 3 },
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

export { AuditStatus, AuditStatusGCL, AuditStatusVal }