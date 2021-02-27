using AMWUtil.Logger;
using AWMSEngine.Engine;
using AWMSModel.Constant.EnumConst;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Exception;
using AWMSEngine.Common;
using AMWUtil.Common;
using AWMSEngine.Engine.V2.Business.Document;
using GCLModel.Criteria;
using AWMSEngine.Engine.V2.Business.Received;
using AWMSEngine.Engine.V2.Business.Issued;
using static AWMSEngine.Engine.V2.Business.WorkQueue.ASRSProcessQueue.TReq;
using System.Text.RegularExpressions;
using AMSModel.Entity;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Constant.StringConst;

namespace ProjectGCL.Engine.Document
{
    public class UpdateLastPallet : BaseEngine<UpdateLastPallet.TReq, amt_DocumentItem>
    {

        public class TReq
        {
            public int docItemID;
            public int lastPallet;
        }

        protected override amt_DocumentItem ExecuteEngine(TReq reqVO)
        {
            var docitemChild = ADO.WMSDB.DataADO.GetInstant().SelectByID<amt_DocumentItem>(reqVO.docItemID, this.BuVO);
            var docitemParent = ADO.WMSDB.DataADO.GetInstant().SelectByID<amt_DocumentItem>(docitemChild.ParentDocumentItem_ID, this.BuVO);
            var convertBase = ADO.WMSStaticValue.StaticValueManager.GetInstant().ConvertToBaseUnitBySKU(docitemChild.SKUMaster_ID.Value, reqVO.lastPallet, docitemChild.UnitType_ID.Value);

            ADO.WMSDB.DataADO.GetInstant().UpdateByID<amt_DocumentItem>(docitemChild.ID.Value, this.BuVO,
                new KeyValuePair<string, object>[]
                {
                    new KeyValuePair<string, object>("Quantity",reqVO.lastPallet),
                    new KeyValuePair<string, object>("BaseQuantity",convertBase.newQty)
                });

            ADO.WMSDB.DataADO.GetInstant().UpdateByID<amt_DocumentItem>(docitemParent.ID.Value, this.BuVO,
               new KeyValuePair<string, object>[]
               {
                    new KeyValuePair<string, object>("Quantity",reqVO.lastPallet),
                    new KeyValuePair<string, object>("BaseQuantity",convertBase.newQty)
               });

            var distos = ADO.WMSDB.DocumentADO.GetInstant().ListDISTOByDoc(docitemChild.Document_ID, this.BuVO);
            if (distos != null || distos.Count != 0)
            {
                distos.ForEach(disto =>
                {
                    disto.Quantity = reqVO.lastPallet;
                    disto.BaseQuantity = convertBase.newQty;
                    ADO.WMSDB.DistoADO.GetInstant().Insert(disto, this.BuVO);
                });
             }
            return docitemChild;

        }

    }
}
