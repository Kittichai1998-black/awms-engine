using AMWUtil.Logger;
using AWMSEngine.Engine;
using AWMSModel.Constant.EnumConst;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Exception;
using AWMSEngine.Common;
using AMWUtil.Common;
using AWMSModel.Criteria.SP.Request;
using AWMSModel.Criteria.SP.Response;
using AWMSModel.Constant.StringConst;
using AWMSEngine.Engine.V2.Business.Document;
using GCLModel.Criteria;
using AWMSEngine.Engine.V2.Business.Received;

namespace ProjectGCl.Engine.Document
{
    public class CreateDocReceive : BaseEngine<CreateDocReceive.TReq, CreateDocReceive.TRes>
    {

        public class TReq : AMWRequestCreateDoc
        {
        }
        public class TRes : AMWWHInbound
        {

        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            var StaticValue = ADO.WMSStaticValue.StaticValueManager.GetInstant();
 
            var sku = ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_SKUMaster>(
                    new SQLConditionCriteria[] {
                        new SQLConditionCriteria("Code",reqVO.sku, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status",1,SQLOperatorType.EQUALS)
                    }, this.BuVO).FirstOrDefault();

            var pack = ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_PackMaster>(
                    new SQLConditionCriteria[] {
                        new SQLConditionCriteria("SKUMaster_ID",sku.ID, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("UnitType_ID",sku.UnitType_ID, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status",1,SQLOperatorType.EQUALS)
                    }, this.BuVO).FirstOrDefault();



            return null;
        }
        private TRes CreateDocGR(AMWLogger logger, TReq reqVO, ams_SKUMaster sku, ams_PackMaster pack, VOCriteria buVO)
        {
            List<CreateGRDocument.TReq.ReceiveItem> docItemsList = new List<CreateGRDocument.TReq.ReceiveItem>();

            //var optionsDocItems = AMWUtil.Common.ObjectUtil.QryStrSetValue("", GCLOptionVOConst.OPT_WH_SEQORD, data_h.wh_seqord);
            //    optionsDocItems = AMWUtil.Common.ObjectUtil.QryStrSetValue(optionsDocItems, GCLOptionVOConst.OPT_WH_SET, data_h.wh_set);
            //    optionsDocItems = AMWUtil.Common.ObjectUtil.QryStrSetValue(optionsDocItems, GCLOptionVOConst.OPT_ORINGIN, data_h.wh_origin);
            //    optionsDocItems = AMWUtil.Common.ObjectUtil.QryStrSetValue(optionsDocItems, GCLOptionVOConst.OPT_COMPANY, data_h.company);

            docItemsList.Add(new CreateGRDocument.TReq.ReceiveItem
            {
                skuCode = sku.Code,
                quantity = reqVO.qty,
                unitType = reqVO.unit,
                batch = null,
                lot = null,
                orderNo = null,
                refID = reqVO.doc_wms,
                ref1 = reqVO.grade,
                eventStatus = DocumentEventStatus.NEW,
                //options = optionsItems

            });

            return null;

        }
    }
}
