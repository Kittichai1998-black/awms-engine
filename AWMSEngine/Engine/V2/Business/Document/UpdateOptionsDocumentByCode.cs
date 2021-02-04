using ADO.WMSDB;
using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.APIService.V2.Document;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.Document
{
    public class UpdateOptionsDocumentByCode : BaseEngine<UpdateOptionsDocumentByCodeAPI.TReq, dynamic>
    {
        protected override dynamic ExecuteEngine(UpdateOptionsDocumentByCodeAPI.TReq reqVO)
        {
            var doc = DataADO.GetInstant().SelectByCodeActive<amt_Document>(reqVO.doc_wcs, this.BuVO);
            if (doc != null)
            {
                var keyOptions = ObjectUtil.QryStrToKeyValues(doc.Options);
                var opt = "";
                if (keyOptions != null && keyOptions.Count > 0)
                {
                    keyOptions.RemoveAll(x => x.Key.Equals(OptionVOConst.OPT_PALLET) || x.Key.Equals(OptionVOConst.OPT_LAST_PALLET));
                    opt = ObjectUtil.ListKeyToQryStr(keyOptions);
                }
                opt += "&" + OptionVOConst.OPT_PALLET + "=" + reqVO.pallet;
                opt += "&" + OptionVOConst.OPT_LAST_PALLET + "=" + reqVO.lastPallet;
                doc.Options = opt;
                var res = DocumentADO.GetInstant().Put(doc, this.BuVO);
                return res;
            }
            else
            {
                throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "Document Not Found");
            }
        }
    }
}
