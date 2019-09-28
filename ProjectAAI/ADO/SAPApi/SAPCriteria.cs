using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectAAI.ADO.SAPApi
{
    public class SAPCriteria
    {
        public class SAPReq
        {
            public string environmentName;
            public string functionName;
            public string inStructureName;
            public string inTableName;
            public string outTableName;
            public object datas;
        }

        public class SAPReqMulti
        {
            public string environmentName;
            public string functionName;
            public List<SAPList> sapLists;
            public string outTableNames;
            public class SAPList
            {
                public string inStructureName;
                public string inTableName;
                public dynamic datas;
            }
        }

        public class ZSWMRF001_IN_SU
        {
            /// <summary>Warehouse Code</summary>
            public string LGNUM;
            /// <summary>Storage Unit Number</summary>
            public string LENUM;
        }
        public class ZSWMRF001_OUT_SU : ZSWMRF001_IN_SU
        {
            /// <summary>Storage Type</summary>
            public string LGTYP;
            /// <summary>Material Number</summary>
            public string MATNR;
            /// <summary>Batch Number</summary>
            public string CHARG;
            /// <summary>Material Description</summary>
            public string MAKTX;
            /// <summary>Stock Category</summary>
            public string BESTQ;
            /// <summary>Available Stock</summary>
            public decimal VERME;
            /// <summary>Base Unit of Measure</summary>
            public string MEINS;
            /// <summary>Shelf Life Expiration or Best-Before Date</summary>
            public string VFDAT;
            /// <summary>Date of Manufacture</summary>
            public string HSDAT;
            /// <summary>Incubated Time</summary>
            public decimal WEBAZ;
            /// <summary>Gross Weight</summary>
            public decimal BRGEW;
            /// <summary>Weight Unit</summary>
            public string GEWEI;
            /// <summary>approved batch number </summary>
            public string FVDT1;
            /// <summary>Standard Instruction (sales order)</summary>
            public string VBELN;
            /// <summary>Error message</summary>
            public string ERR_MSG;
        }

        public class ZSWMRF002_IN_SU
        {
            /// <summary>Warehouse Number</summary>
            public string LGNUM;
            /// <summary>Destination Storage Type</summary>
            public string LGTYP;
            /// <summary>Destination Storage</summary>
            public string LGPLA;
            /// <summary>Storage Section</summary>
            public string NLBER;
            /// <summary>Storage Unit Number</summary>
            public string LENUM;
        }
        public class OUT_SU
        {   ///ZSWMRF002_OUT_SU
            /// <summary>Warehouse Number</summary>
            public string LGNUM;
            /// <summary>Destination Storage Type</summary>
            public string LGTYP;
            /// <summary>Destination Storage BIN</summary>
            public string LGPLA;
            /// <summary>Storage Section</summary>
            public string NLBER;
            /// <summary>Storage Unit Number</summary>
            public string LENUM;
            /// <summary>Transfer Order</summary>
            public long TANUM;
            /// <summary>Error message</summary>
            public string ERR_MSG;
        }

        /// <summary>
        /// เบิก
        /// </summary>
        public class ZSWMRF003_IN_REQ
        {
            /// <summary>Stock Removal Mode</summary>
            public string ZMODE;
            /// <summary>Warehouse Code</summary>
            public string LGNUM;
            /// <summary>Storage Unit Number</summary>
            public string LENUM = "";
            /// <summary>Reservation Number</summary>
            public long? RSNUM;
            /// <summary>Delivery Order Number</summary>
            public string VBELN_VL = "";
            /// <summary>Delivery Item</summary>
            public long? POSNR;
            /// <summary>Material Number</summary>
            public string MATNR = "";
            /// <summary>Batch Number</summary>
            public string CHARG = "";
            /// <summary>Quantity</summary>
            public decimal? BDMNG;
            /// <summary>Destination Storage Type</summary>
            public string LGTYP = "";
            /// <summary>Destination Storage Section</summary>
            public string LGBER = "";
            /// <summary>Destination Storage BIN</summary>
            public string LGPLA = "";
            /// <summary>Include Stock Category = “” – Available Stock, ระบุ Y – Include, N – Exclude</summary>
            public string BESTQ_UR = "";
            /// <summary>Include Stock Category = Q – Stock in Quality Control, ระบุ Y – Include, N – Exclude</summary>
            public string BESTQ_QI = "";
            /// <summary>Include Stock Category = S – Blocked Stock, ระบุ Y – Include, N – Exclude</summary>
            public string BESTQ_BLK = "";
        }
        public class ZSWMRF003_OUT_REQ : ZSWMRF003_IN_REQ
        {
            /// <summary>Base unit of Measure</summary>
            public string MEINS;
            /// <summary>WM Movement type จาก mode หรือใน reservation </summary>
            public string BWLVS;
            /// <summary>Sales Instruction</summary>
            public string VBELN;
            /// <summary>แสดงข้อผิดพลาด</summary>
            public string ERR_MSG;
        }

        /// <summary>
        /// RESPONSE TO SAP
        /// </summary>
        public class IN_AWS
        {
            /// <summary>Stock Removal Mode</summary>
            public string ZMODE;
            /// <summary>Warehouse Code</summary>
            public string LGNUM;
            /// <summary>Storage Unit Number</summary>
            public string LENUM;
            /// <summary>เลขที่เอกสาร GI Document จากระบบ AWS</summary>
            public string GI_DOC;
        }
        public class OUT_SAP
        {/// <summary>Material Number</summary>
            public string MATNR;
            /// <summary>Batch Number</summary>
            public string CHARG;
            /// <summary>Stock Category</summary>
            public string BESTQ;
            /// <summary>Delivery Order</summary>
            public string VBELN_VL;
            /// <summary>Delivery Item</summary>
            public string POSNR;
            /// <summary>Requirement Type</summary>
            public string BETYP;
            /// <summary>Requirement Number</summary>
            public string BENUM;
            /// <summary>Quantity</summary>
            public decimal ANFME;
            /// <summary>Unit</summary>
            public string ALTME;
            /// <summary>Stock Removal Mode</summary>
            public string ZMODE;
            /// <summary>Warehouse Code</summary>
            public string LGNUM;
            /// <summary>Destination Storage Type</summary>
            public string LGTYP;
            /// <summary>Storage Unit Number</summary>
            public string LENUM;
            /// <summary>Destination Storage Section</summary>
            public string LGBER;
            /// <summary>Destination Storage BIN</summary>
            public string LGPLA;
            /// <summary>WM Movement type</summary>
            public string BWLVS;
            /// <summary>เลขที่เอกสาร GI Document จากระบบ AWS</summary>
            public string GI_DOC;
            /// <summary>Transfer Order</summary>
            public long TANUM;
            /// <summary>แสดงข้อความผิดพลาด</summary>
            public string ERR_MSG;
        }
        public class IN_REQ
        {
            /// <summary>Stock Removal Mode</summary>
            public string ZMODE;
            /// <summary>Warehouse Code</summary>
            public string LGNUM;
            /// <summary>Storage Unit Number</summary>
            public string LENUM;
            /// <summary>Reservation Number</summary>
            public long? RSNUM;
            /// <summary>Delivery Order Number</summary>
            public string VBELN_VL;
            /// <summary>Material Number</summary>
            public string MATNR;
            /// <summary>Batch Number</summary>
            public string CHARG;
            /// <summary>Quantity</summary>
            public decimal? BDMNG;
            /// <summary>Base unit of Measure</summary>
            public string MEINS;
            /// <summary>Destination Storage Type</summary>
            public string LGTYP;
            /// <summary>Destination Storage Section</summary>
            public string LGBER;
            /// <summary>Destination Storage BIN</summary>
            public string LGPLA;
            /// <summary>WM Movement type</summary>
            public string BWLVS;
            /// <summary>Include Stock Category = “” – Available Stock, ระบุ Y – Include, N – Exclude</summary>
            public string BESTQ_UR;
            /// <summary>Include Stock Category = Q – Stock in Quality Control, ระบุ Y – Include, N – Exclude</summary>
            public string BESTQ_QI;
            /// <summary>Include Stock Category = S – Blocked Stock, ระบุ Y – Include, N – Exclude</summary>
            public string BESTQ_BLK;
            /// <summary>Sales Instruction</summary>
            public string VBELN;
            /// <summary>Delivery Item</summary>
            public long? POSNR;
            /// <summary>เลขที่เอกสาร GI Document จากระบบ AWS</summary>
            public string GI_DOC;
        }
        public class OUT_SU_BAL
        {
            public string ZMODE;
            public string LGNUM;
            public string LGTYP;
            public string LENUM;
            public string MATNR;
            public string CHARG;
            public string BESTQ;
            public decimal VERME;
            public string MEINS;
            public string HSDAT;
            public decimal WEBAZ;
            public string BRGEW;
            public string GEWEI;
            public string VBELN;
            public decimal BALNC;
        }

        public class ZSWMRF007_IN_REQ
        {
            public string LGNUM;
            public string MATNR;
            public string CHARG;
        }
        public class ZSWMRF007_OUT_SAP
        {
            public string LGNUM;
            public string MATNR;
            public string CHARG;
            public string FVDT1;
            public string ERR_MSG;
        }

    }
}
