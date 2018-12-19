using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.Received
{
    public class CloseGRDocument : BaseEngine<CloseGRDocument.TDocReq, CloseGRDocument.SAPCloseGRDocCriteria>
    {
        public class TDocReq
        {
            public long[] docIDs;
        }
        public class TDocRes
        {
            public SAPCloseGRDocCriteria dataSAP;
        }
        public class SAPCloseGRDocCriteria
        {
            public header GOODSMVT_HEADER;
            public List<body> GOODSMVT_ITEM;
        }
        public class header
        {
            public DateTime PSTNG_DATE;
            public DateTime DOC_DATE;
            public string REF_DOC_NO;
            public string HEADER_TXT;
            public string GOODSMVT_CODE;
        }
        public class body
        {
            public string MATERIAL;
            public string PLANT;
            public string STGE_LOC;
            public string BATCH;
            public string MOVE_TYPE;
            public decimal ENTRY_QNT;
            public string ENTRY_UOM;
            public string MOVE_STLOC;
        }
        protected override SAPCloseGRDocCriteria ExecuteEngine(TDocReq reqVO)
        {
            var doc = ADO.DataADO.GetInstant().SelectByID<amv_Document>(reqVO.docIDs[0], this.BuVO);

            if (doc == null || doc.Status == EntityStatus.REMOVE)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "DocumnetID " + doc.ID);

        
            if (doc.EventStatus == DocumentEventStatus.IDEL || doc.EventStatus == DocumentEventStatus.REMOVED || doc.EventStatus == DocumentEventStatus.REJECTED)
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, "เอกสารไม่อยู่ในสถานะ WORKING และ WORKED ไม่สามารถ Close เอกสารได้ ");
            }


            foreach (var num in reqVO.docIDs)
            {
                var docItem = ADO.DataADO.GetInstant().SelectByID<amv_DocumentItem>(num, this.BuVO);

                var items = new List<body>();
                items.Add(new body()
                {
                    MATERIAL = docItem.Code,
                    PLANT = doc.SouBranch,
                    STGE_LOC = doc.SouWarehouse,
                    BATCH = docItem.Batch,
                    MOVE_TYPE = doc.Ref2,
                    ENTRY_QNT = docItem.Quantity,
                    ENTRY_UOM = docItem.UnitType_Code,
                    MOVE_STLOC = doc.DesWarehouse,
                });
                var data = new SAPCloseGRDocCriteria()
                {
                    GOODSMVT_HEADER = new header()
                    {
                        PSTNG_DATE = doc.ActionTime.Value,
                        DOC_DATE = doc.DocumentDate,
                        REF_DOC_NO = doc.ID.ToString(),
                        HEADER_TXT = "ASRS RECEIVED",
                        GOODSMVT_CODE = "04"

                    },

                    GOODSMVT_ITEM = items

                };
            }
             
            


            if (doc.EventStatus == DocumentEventStatus.WORKING || doc.EventStatus == DocumentEventStatus.WORKED)
            {
                
            }

 



            return null;
        }

    }
}