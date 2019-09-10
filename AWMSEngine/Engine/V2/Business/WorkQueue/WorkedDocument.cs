using AMWUtil.Exception;
using AWMSEngine.APIService.V2.ASRS;
using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.WorkQueue
{
    public class WorkedDocument : BaseEngine<List<long>, List<long>>
    {
        protected override List<long> ExecuteEngine(List<long> reqVO)
        {
            var res = this.ExectProject<List<long>, List<long>>(FeatureCode.EXEWM_DoneQueueWorked, reqVO);
            if (res == null)
            {

                reqVO.ForEach(x =>
                {
                    var docs = ADO.DocumentADO.GetInstant().Get(x, this.BuVO);
                    if (docs != null)
                    {
                        if(docs.DocumentType_ID != DocumentTypeID.AUDIT)
                        {
                            var distos = ADO.DocumentADO.GetInstant().ListDISTOByDoc(x, this.BuVO).ToList();
                            var docItemID = distos.Select(y => y.DocumentItem_ID).Distinct().ToList();

                            docItemID.ForEach(y =>
                            {
                                if (distos.FindAll(z => z.DocumentItem_ID == y).TrueForAll(z => z.Status == EntityStatus.ACTIVE))
                                {
                                    ADO.DocumentADO.GetInstant().UpdateItemEventStatus(y.Value, DocumentEventStatus.WORKED, this.BuVO);
                                }
                            });
                            var listItem = AWMSEngine.ADO.DocumentADO.GetInstant().ListItem(x, this.BuVO);
                            if (listItem.TrueForAll(y => y.EventStatus == DocumentEventStatus.WORKED))
                            {
                                ADO.DocumentADO.GetInstant().UpdateStatusToChild(x, DocumentEventStatus.WORKING, null, DocumentEventStatus.WORKED, this.BuVO);
                            }
                        }
                    }
                     
                });
                res = reqVO;
            }

            return res;
        }

    }
}
