using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.ADO.SAPApi
{
    public class TREQ_MMI0008_1_DO_INFO
    {
        public THeader HEADER_DATA;
        public class THeader
        {
            public string DELIV_NUMB;
            public string DELIV_ITEM;
        }
    }
    public class TRES_MMI0008_1_DO_INFO
    {
        public string DOCSTATUS;

        public List<TItem> ITEM_DATA;
        public class TItem
        {
            public string DELIV_NUMB;
            public string DLV_TYPE;
            public string SOLDTO_CODE;
            public string SOLDTO_NAME;
            public string SHIPTO_CODE;
            public string SHIPTO_NAME;
            public string DELIV_ITEM;
            public string MATERIAL;
            public string PLANT;
            public string STGE_LOC;
            public string BATCH;
            public decimal DLV_QTY_IMUNIT;
            public string BASE_UOM;
            public decimal DLV_QTY;
            public string SALES_UNIT;
        }

        public List<TReturn> RETURN;
        public class TReturn
        {
            public string TYPE;
            public string ID;
            public string NUMBER;
            public string MESSAGE;
            public string LOG_NO;
            public string LOG_MSG_NO;
            public string MESSAGE_V1;
            public string MESSAGE_V2;
            public string MESSAGE_V3;
            public string MESSAGE_V4;
            public string PARAMETER;
            public string ROW;
            public string FIELD;
            public string SYSTEM;
        }
    }
}
