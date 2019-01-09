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
    public class ReturnGIFromPicking : BaseEngine<ReturnGIFromPicking.TDocReq, ReturnGIFromPicking.TDocRes>
    {
        public class TDocReq
        {
            public long[] docIDs;
            public string palletIDs;
        }
        public class TDocRes
        {
            public List<amt_Document> documents;
        }

        protected override TDocRes ExecuteEngine(TDocReq reqVO)
        {
            var doc = ADO.DataADO.GetInstant().SelectByID<amt_Document>(reqVO.docIDs, this.BuVO);

            var docItem = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItem>(new KeyValuePair<string, object>[] {
                    new KeyValuePair<string, object> ("Document_ID",doc.ID)
                }, this.BuVO);


            var skuPallet = ADO.StorageObjectADO.GetInstant().ListPallet(reqVO.palletIDs, this.BuVO);

            if (skuPallet == null)
            {
                //พาเลทว่าง
            }
            else
            {
                //พาเลทมีของ

                    foreach (var item in docItem)
                    {
                        var Pallet = skuPallet.Where(x => x.Lot == doc.Lot && x.Batch == doc.Batch && x.Code == item.Code).First();
                    }
   
            }

            return null;
        }

           
     }

    
}
