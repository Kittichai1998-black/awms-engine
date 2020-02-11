using AMWUtil.Exception;
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

            if (getGRDoc == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, "Cross Dock Document Not Found");
            if (getGRDoc.DocumentProcessType_ID != DocumentProcessTypeID.FG_CROSSDOCK_CUS)
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, "This Document is not Cross Dock Document");

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
