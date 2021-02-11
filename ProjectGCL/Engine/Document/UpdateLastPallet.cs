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
using AWMSEngine.Engine.V2.Business.Issued;
using static AWMSEngine.Engine.V2.Business.WorkQueue.ASRSProcessQueue.TReq;
using System.Text.RegularExpressions;

namespace ProjectGCL.Engine.Document
{
    public class UpdateLastPallet : BaseEngine<UpdateLastPallet.TReq, amt_Document>
    {

        public class TReq 
        {
            public string documentCode;
            public string lastPallet;
        }

        protected override amt_Document ExecuteEngine(TReq reqVO)
        {
            var dataDoc = ADO.WMSDB.DataADO.GetInstant().SelectByCodeActive<amt_Document>(
                  new SQLConditionCriteria[] {
                    new SQLConditionCriteria("Code",reqVO.documentCode, SQLOperatorType.EQUALS)
                  }, this.BuVO);

            var docParent = ADO.WMSDB.DataADO.GetInstant().SelectByID<amt_Document>(dataDoc.ID, this.BuVO);
            var listDocChild = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_Document>(
                                new SQLConditionCriteria[] {
                                    new SQLConditionCriteria("ParentDocument_ID",docParent.ID, SQLOperatorType.EQUALS),
                                }, this.BuVO);

            ADO.WMSDB.DataADO.GetInstant().UpdateByID<amt_Document>(dataDoc.ID.Value, this.BuVO,
                new KeyValuePair<string, object>[]
                {
                    new KeyValuePair<string, object>(GCLOptionVOConst.OPT_LAST_PALLET,reqVO.lastPallet)
                });

            listDocChild.ForEach(x =>
            {
                ADO.WMSDB.DataADO.GetInstant().UpdateByID<amt_Document>(x.ID.Value, this.BuVO,
                    new KeyValuePair<string, object>[]
                    {
                        new KeyValuePair<string, object>(GCLOptionVOConst.OPT_LAST_PALLET,reqVO.lastPallet)
                    });
            });

            return dataDoc;

        }
       
    }
}
