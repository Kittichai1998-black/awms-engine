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


namespace AWMSEngine.Engine.Business.Issued
{
    public class InsertToDocItemSto : BaseEngine<InsertToDocItemSto.TDocReq, InsertToDocItemSto.TDocRes>
    {
        public class TDocReq
        {
            public long? ID;
            public long documentItemID;
            public long StorageObjectID;
            public long qty;
            public long unitID;
            public long baseUnitID;
            public long status;
            public long actionBy;
            public long sku;

        }
        public class TDocRes
        {
            public List<amt_Document> documents;
        }

        protected override TDocRes ExecuteEngine(TDocReq reqVO)
        {

            var basemodel = this.StaticValue.ConvertToNewUnitBySKU(reqVO.sku, reqVO.qty, reqVO.unitID, reqVO.baseUnitID);


            List<amt_DocumentItemStorageObject> data = new List<amt_DocumentItemStorageObject>();

                data.Add(new amt_DocumentItemStorageObject()
                {
                    ID = reqVO.ID,
                    DocumentItem_ID = reqVO.documentItemID,
                    StorageObject_ID = reqVO.StorageObjectID,
                    Quantity = (reqVO.qty*(-1)),
                    UnitType_ID = reqVO.unitID,
                    BaseQuantity = (basemodel.baseQty*(-1)),
                    BaseUnitType_ID = reqVO.baseUnitID,
                    Status = reqVO.status
                });
                      
            var dataInsert = ADO.DocumentADO.GetInstant().MappingSTO(data, this.BuVO);



            return null;
        }

           
     }

    
}
