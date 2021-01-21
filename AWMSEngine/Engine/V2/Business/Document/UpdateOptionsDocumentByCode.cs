using ADO.WCSDB;
using AWMSEngine.APIService.V2.Document;
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
            var document = DataADO.GetInstant().SelectByCodeActive<amt_Document>(reqVO.code, this.BuVO);

            throw new NotImplementedException();
        }
    }
}
