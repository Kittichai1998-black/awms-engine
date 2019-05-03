using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Exception;
using AWMSEngine.Engine.V2.Business;
using AWMSEngine.Engine.V2.Validation;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
namespace ProjectTAP.Engine.Business.Received
{
    public class ScanBoxReceiveWCS : AWMSEngine.Engine.BaseEngine<ScanBoxReceiveWCS.TReq, ScanBoxReceiveWCS.TRes>
    {
        public class TReq
        {
            public string code;
            public string receivedDate;
            public long qty;
            public string lot;
            public string itemNo;
            public string baseCode;

        }
        public class TRes
        {
            //public long areaID;
            //public long areaLocationID;
            //public string areaCode;
            //public string areaLocationCode;
        }
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            if (reqVO.code == "" || string.IsNullOrEmpty(reqVO.code) || reqVO.code.Equals(null))
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, "SKU is null");

            if (reqVO.qty == 0 || reqVO.qty.Equals(null))
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, "Quantity is null");

            if (reqVO.itemNo == "" || string.IsNullOrEmpty(reqVO.itemNo) || reqVO.itemNo.Equals(null))
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, "ItemNo is null");

            //if (reqVO.receivedDate.Equals(null))
            //    throw new AMWException(this.Logger, AMWExceptionCode.V1002, "Received date is null");

            if (reqVO.baseCode == "" || string.IsNullOrEmpty(reqVO.baseCode) || reqVO.baseCode.Equals(null))
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, "baseCode is null");


            var date =   Convert.ToDateTime(reqVO.receivedDate);

            var docItems = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_DocumentItem>(
                new SQLConditionCriteria[] {
                            new SQLConditionCriteria("Code",reqVO.code, SQLOperatorType.EQUALS),
                            new SQLConditionCriteria("Lot",reqVO.lot, SQLOperatorType.EQUALS, SQLConditionType.AND),
                            new SQLConditionCriteria("Quantity",reqVO.qty, SQLOperatorType.EQUALS, SQLConditionType.AND),                 
                            new SQLConditionCriteria("ItemNo",reqVO.itemNo, SQLOperatorType.EQUALS, SQLConditionType.AND),
                }, new SQLOrderByCriteria[] { }, null, null, this.BuVO);


            if(docItems.Count > 0)
            {

                //ADO.DataADO.GetInstant().UpdateByID<amt_Document>(x.ID.Value, this.BuVO,
                //new KeyValuePair<string, object>[]
                //{
                //    new KeyValuePair<string, object>("EventStatus",DocumentEventStatus.CLOSED)
                //});
            }
            else
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, "No SKU waiting to be received");
            }
            return null;
        }
    }
}
