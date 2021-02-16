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
    public class UpdateLastPallet : BaseEngine<UpdateLastPallet.TReq, amt_Document>
    {

        public class TReq 
        {
            public string documentCode;
            public int lastPallet;
        }

        protected override amt_Document ExecuteEngine(TReq reqVO)
        {
            var dataDoc = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_Document>(
                  new SQLConditionCriteria[] {
                    new SQLConditionCriteria("Code",reqVO.documentCode, SQLOperatorType.EQUALS)
                  }, this.BuVO).FirstOrDefault();

            var docParent = ADO.WMSDB.DataADO.GetInstant().SelectByID<amt_Document>(dataDoc.ID, this.BuVO);
            var listDocChild = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_Document>(
                                new SQLConditionCriteria[] {
                                    new SQLConditionCriteria("ParentDocument_ID",docParent.ID, SQLOperatorType.EQUALS),
                                }, this.BuVO);

            var optionsDoc = AMWUtil.Common.ObjectUtil.QryStrSetValue(dataDoc.Options, GCLOptionVOConst.OPT_LAST_PALLET, reqVO.lastPallet);
           
            ADO.WMSDB.DataADO.GetInstant().UpdateByID<amt_Document>(dataDoc.ID.Value, this.BuVO,
                new KeyValuePair<string, object>[]
                {
                   new KeyValuePair<string, object>("Options", optionsDoc),
                });

            listDocChild.ForEach(x =>
            {
                var optionsDocChild = AMWUtil.Common.ObjectUtil.QryStrSetValue(x.Options, GCLOptionVOConst.OPT_LAST_PALLET, reqVO.lastPallet);

                ADO.WMSDB.DataADO.GetInstant().UpdateByID<amt_Document>(x.ID.Value, this.BuVO,
                    new KeyValuePair<string, object>[]
                    {
                        new KeyValuePair<string, object>("Options",optionsDocChild)
                    });
            });

            return dataDoc;

        }
       
    }
}
