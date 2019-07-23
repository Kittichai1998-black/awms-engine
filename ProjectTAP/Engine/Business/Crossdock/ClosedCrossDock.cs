using AWMSEngine.Engine;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectTAP.Engine.Business.Crossdock
{
    public class ClosedCrossDock : BaseEngine<long, amt_Document>
    {
        protected override amt_Document ExecuteEngine(long reqVO)
        {
            var DocumentADO = AWMSEngine.ADO.DocumentADO.GetInstant();
            var getGRDoc = DocumentADO.Get(reqVO, this.BuVO);
            var getGIDoc = DocumentADO.Get(getGRDoc.ParentDocument_ID.Value, this.BuVO);

            DocumentADO.UpdateStatusToChild(getGRDoc.ID.Value, null, null, DocumentEventStatus.CLOSED, this.BuVO);

            var GIDisto = AWMSEngine.ADO.DocumentADO.GetInstant().ListDISTOByDoc(getGIDoc.ID.Value, this.BuVO);
            var chkGR = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_Document>("ParentDocument_ID", getGIDoc.ID, this.BuVO);
            if (chkGR.TrueForAll(grDoc => grDoc.EventStatus == DocumentEventStatus.CLOSED) && GIDisto.TrueForAll(gidisto => gidisto.Status == EntityStatus.ACTIVE))
                DocumentADO.UpdateStatusToChild(getGIDoc.ID.Value, null, null, DocumentEventStatus.CLOSED, this.BuVO);

            return getGRDoc;
        }
    }
}
