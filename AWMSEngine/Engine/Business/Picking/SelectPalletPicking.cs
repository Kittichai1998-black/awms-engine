using AMWUtil.Common;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Response;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.Picking
{
    public class SelectPalletPicking : BaseEngine<SelectPalletPicking.TReq, SelectPalletPicking.TRes>
    {
        public class TReq
        {
            public string palletCode;
            public long? warehouseID;
            public long? areaID;
            public long? docID;
        }

        public class TRes
        {
            public string palletCode;
            public List<amt_Document> docList;
            public List<palletItem> sto;
        }

        public class palletItem
        {
            public string packCode;
            public int qty;
            public string unittype;
            public int willPick;
            public int maxPick;
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            var selectPallet = ADO.StorageObjectADO.GetInstant().Get(reqVO.palletCode, reqVO.warehouseID, reqVO.areaID, false, true, this.BuVO);

            var selectPack = selectPallet.ToTreeList().Where(x => x.type == StorageObjectType.PACK).Distinct().ToList();
            
            List<amt_Document> docList = new List<amt_Document>();
            List<palletItem> palletItem = new List<palletItem>();

            foreach (var row in selectPack)
            {
                var itemCanMap = (ADO.DocumentADO.GetInstant().ListItemCanMap(row.code, DocumentTypeID.GOODS_ISSUED, (long?)null, String.Empty, this.BuVO));

                if (reqVO.docID == null)
                {
                    itemCanMap.ForEach(x =>
                    {
                        docList.AddRange(ADO.DocumentADO.GetInstant().ListDocumentCanMap(reqVO.palletCode, DocumentTypeID.PICKING, this.BuVO));
                    });
                }
                else
                {
                    var docItem = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItem>(new KeyValuePair<string, object>[] {
                    new KeyValuePair<string,object>("Document_ID",reqVO.docID),
                    new KeyValuePair<string,object>("Status", EntityStatus.ACTIVE)
                }, this.BuVO);

                    docItem.ForEach(x =>
                    {
                        var packCode = ADO.DataADO.GetInstant().SelectByID<ams_PackMaster>(x.PackMaster_ID, this.BuVO).Code;
                    });
                }
            }

            var res = new TRes()
            {
                palletCode = reqVO.palletCode,
                docList = docList
            };
            return res;
        }
    }
}
