using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business
{
    public class DocGoodsIssuedCreate : BaseEngine<DocGoodsIssuedCreate.TDocReq, amt_Document>
    {

        public class TDocReq
        {
            public int dealerID;
            public int warehouseID;
            public DateTime actionTime;
            public string transportNo;
            public List<KeyValuePair<string, object>> options;
            public List<SKUItem> SKUItems;
            public class SKUItem
            {
                public int skuID;
                public int? packID;
                public int quantity;
            }
        }

        protected override amt_Document ExecuteEngine(TDocReq reqVO)
        {
            var newDoc = new amt_Document()
            {
                Dealer_ID = reqVO.dealerID,
                Sou_Warehouse_ID = reqVO.warehouseID,
                ActionTime = reqVO.actionTime,
                TransportNo = reqVO.transportNo,
                Options = AMWUtil.Common.ObjectUtil.ListKeyToQueryString(reqVO.options),
                DocumentItems = reqVO.SKUItems.Select(x => new amt_DocumentItem() { SKU_ID = x.skuID, PackMaster_ID = x.packID }).ToList()
            };



            var res = ADO.DocumentADO.GetInstant().Create(newDoc, this.BuVO);
            return res;
        }

    }
}
