using ADO.WMSDB;
using AMWUtil.Exception;
using AWMSEngine.APIService.V2.Document;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.Document
{
    public class TRes
    {
        public long? docID;
    }
    public class CloseGR : BaseEngine<UpdateOptionsDocumentByCodeAPI.TReq, TRes>
    {

        protected override TRes ExecuteEngine(UpdateOptionsDocumentByCodeAPI.TReq reqVO)
        {
            TRes res = new TRes();
            var lastQ = DataADO.GetInstant().SelectBy<amt_WorkQueue>(new SQLConditionCriteria[]{
                    new SQLConditionCriteria("IOType", 0, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("Status", 3, SQLOperatorType.EQUALS)
                }, new SQLOrderByCriteria[] {
                new SQLOrderByCriteria("ID", SQLOrderByType.DESC)
                }, 1, null, this.BuVO).FirstOrDefault();

            if (lastQ is not null)
            {
                var sto = StorageObjectADO.GetInstant().Get(lastQ.StorageObject_ID, StorageObjectType.BASE, false, true, this.BuVO);
                if (sto.mapstos.Count > 0)
                {
                    if (!(sto.mapstos[0].qty == Convert.ToDecimal(reqVO.lastPallet)))
                    {
                        throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "จำนวนสินค้าไม่ตรงกับจำนวน Last");
                    }
                    else
                    {
                        var doc = DataADO.GetInstant().SelectByCodeActive<amt_Document>(reqVO.doc_wcs, this.BuVO);
                        res.docID = doc.ID.Value;
                    }
                }
                else
                {
                    throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "ไม่พบ Pack");
                }
            }
            else
            {
                throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "ไม่พบคิวงานรับเข้าที่สำเร็จแล้ว");
            }

            return res;
        }
    }
}
