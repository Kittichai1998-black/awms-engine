using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;

namespace AWMSEngine.Engine.General
{
    public class MasterPut<T> : BaseEngine<List<T>, List<T>>
        where T : BaseEntitySTD
    {

        protected override List<T> ExecuteEngine(List<T> reqVO)
        {
            var ADOData = ADO.DataADO.GetInstant();
            foreach (var e in reqVO)
            {
                var param = e.FieldKeyValuePairs();
                //param.RemoveAll(x => x.Key.Equals("Status", "CreateBy", "CreateDate", "ModifyBy", "ModifyTime"));
                if (e.ID.HasValue)
                {
                    ADOData.UpdateByCode<T>(e.Code, this.BuVO, param.ToArray());
                }
                else
                {
                    ADOData.Insert<T>(this.BuVO, param.ToArray());
                }
            }
            return reqVO;

        }
    }
}
