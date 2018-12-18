using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSModel.Criteria;
using AWMSModel.Constant.EnumConst;

namespace AWMSEngine.Engine.General
{
    public class MasterPut<T> : BaseEngine<MasterPut<T>.TReq, List<T>>
        where T : BaseEntityID
    {
        public class TReq
        {
            public List<T> datas;
            public List<string> whereFields;
        }

        protected override List<T> ExecuteEngine(TReq reqVO)
        {
            var ADOData = ADO.DataADO.GetInstant();
            
            foreach (T data in reqVO.datas)
            {
                List<SQLConditionCriteria> wheres = new List<SQLConditionCriteria>();
                foreach(var field in reqVO.whereFields)
                {
                    wheres.Add(new SQLConditionCriteria(field, data.GetType().GetField(field).GetValue(data), SQLOperatorType.EQUALS));
                }
                var param = AMWUtil.Common.ObjectUtil.FieldKeyValuePairs<T>(data);//((object)data).FieldKeyValuePairs();
                var select = ADOData.SelectBy<T>(wheres.ToArray(), this.BuVO).FirstOrDefault();
                //param.RemoveAll(x => x.Key.Equals("Status", "CreateBy", "CreateDate", "ModifyBy", "ModifyTime"));
                if (select != null)
                {
                    data.ID = ADOData.UpdateByID<T>(select.ID.Value, this.BuVO, param.ToArray());
                }
                else
                {
                    data.ID = ADOData.Insert<T>(this.BuVO, param.ToArray());
                }
            }
            return reqVO.datas;

        }
    }
}
