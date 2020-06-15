using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSEngine.ADO.StaticValue;
using AWMSEngine.Common;
using AWMSEngine.Engine;
using AWMSEngine.Engine.V2.Business.Document;
using AWMSEngine.Engine.V2.Business.Received;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;

namespace ProjectAERP.Engine.Document
{
    public class DoneQueueClosed : BaseEngine<ERPRetuenWHInboundClosed, ERPRetuenWHInboundClosed>
    {

        protected override ERPRetuenWHInboundClosed ExecuteEngine(ERPRetuenWHInboundClosed reqVO)
        {

            if (reqVO.status == "Success")
            {
                var doc = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_Document>(
                    new SQLConditionCriteria[] {
                        new SQLConditionCriteria("Code",reqVO.amw_refId, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("EventStatus",DocumentEventStatus.CLOSING, SQLOperatorType.EQUALS),
                    }, BuVO).Select(x => x.ID.Value).ToList();

                if(doc.Count == 0)
                    throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "ไม่มีพบเอกสารของ amw_refId : "+ reqVO.amw_refId);


                new ClosedDocument().Execute(this.Logger, this.BuVO, doc);


                var docGR = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<amt_Document>(doc.FirstOrDefault(), this.BuVO);

                //remove 
                if(docGR.EventStatus == DocumentEventStatus.CLOSED)
                {
                    var listkeyRoot = ObjectUtil.QryStrToKeyValues(docGR.Options);
                    var opt_done = "";

                    if (listkeyRoot != null && listkeyRoot.Count > 0)
                    {
                        listkeyRoot.RemoveAll(x => x.Key.Equals(OptionVOConst.OPT_ERROR));
                        opt_done = ObjectUtil.ListKeyToQryStr(listkeyRoot);
                    }

                    AWMSEngine.ADO.DataADO.GetInstant().UpdateByID<amt_Document>(doc.FirstOrDefault(), this.BuVO,
                            new KeyValuePair<string, object>[] {
                        new KeyValuePair<string, object>("Options", opt_done)
                            });
                }
            }
               

            return reqVO; 
        }
    }
}
