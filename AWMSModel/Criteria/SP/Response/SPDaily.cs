using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Criteria.SP.Response
{
    public class SPDaily
    {
        public int totalRecord;
        public string bstoCode;
        public string bstoName { get; set; }
        public string pstoCode { get; set; }
        public string pstoName { get; set; }
        public string pstoBatch { get; set; }
        public string pstoLot { get; set; }
        public string pstoOrderNo { get; set; }
        public string qty { get; set; }
        public string unitType { get; set; }
        public string baseQty { get; set; }
        public string baseUnitType { get; set; }
        public string docID { get; set; }
        public string docCode { get; set; }
        public string docRefID { get; set; }
        public string docRef1 { get; set; }
        public string docRef2 { get; set; }
        public string createBy { get; set; }
        public string createTime { get; set; }
    }
}
