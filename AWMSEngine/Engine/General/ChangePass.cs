using System;
using System.Collections.Generic;
using AWMSModel.Entity;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.General
{
    public class ChangePass : BaseEngine<ChangePass.TReqModel, ChangePass.TRes>
    {
        public class TReqModel
        {
            public int? User_ID;
            public string CurPass;
            public string NewPass;
            public string Token;
        }
        public class TRes
        {
            public string Password;
            public string SoftPassword;
        }
        protected override TRes ExecuteEngine(ChangePass.TReqModel reqVO)
        {
            int? userId = reqVO.User_ID;
            if (!userId.HasValue)
            {
                amt_User user_Model = ADO.DataADO.GetInstant().SelectByID<amt_User>(
                        reqVO.User_ID,this.BuVO);

            }

                return new TRes() { Password = "", SoftPassword = "" };
        }
    }
}
