using AMWUtil.Exception;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business
{
    public class BaseStoInfo : BaseEngine<string, BaseStoInfo.TRes>
    {
        public class TRes : amt_StorageObject
        {
            public List<amt_StorageObject> mapstos;
        }
        protected override TRes ExecuteEngine(string reqVO)
        {
            var bSto = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_StorageObject>(new SQLConditionCriteria[]{
                new SQLConditionCriteria("Code", reqVO, AWMSModel.Constant.EnumConst.SQLOperatorType.EQUALS)
            }, this.BuVO).OrderByDescending(x => x.ID).FirstOrDefault();

            if (bSto == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, reqVO + " Not Found");

            var stos = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_StorageObject>(new SQLConditionCriteria[]{
                    new SQLConditionCriteria("ParentStorageObject_ID", bSto.ID, AWMSModel.Constant.EnumConst.SQLOperatorType.EQUALS)
                }, this.BuVO).OrderByDescending(x => x.ID).ToList();

            var sto = new TRes();

            foreach(var field in bSto.GetType().GetFields())
            {
                var getStoValue = bSto.GetType().GetField(field.Name).GetValue(null);
                sto.GetType().GetField(field.Name).SetValue(null, getStoValue);
            }

            sto.mapstos = stos;

            return sto;
        }
    }
}
