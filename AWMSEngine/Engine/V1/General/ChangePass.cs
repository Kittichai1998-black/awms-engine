using System;
using System.Collections.Generic;
using AWMSModel.Entity;
using System.Linq;
using System.Threading.Tasks;
using AWMSModel.Criteria;
using AWMSModel.Constant.EnumConst;
using AMWUtil.Common;
using AMWUtil.Exception;

namespace AWMSEngine.Engine.General
{
    public class ChangePass : BaseEngine<ChangePass.TReq, ChangePass.TRes>
    {
        public class TReq
        {
            public string CurPass;
            public string NewPass;
        }
        public class TRes
        {
            public string token;
            public string extendKey;
            public DateTime expireTime;
        }
        protected override TRes ExecuteEngine(ChangePass.TReq reqVO)
        {
            var token = this.TokenInfo;
            var user = ADO.DataADO.GetInstant()
                .SelectBy<ams_User>(new SQLConditionCriteria("ID",token.User_ID, SQLOperatorType.EQUALS), this.BuVO)
                .FirstOrDefault();

            string hashCurPass = ams_User.HashPassword(reqVO.CurPass, user.SaltPassword);
            if (hashCurPass != user.Password)
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, "รหัสผ่านเก่าไม่ถูกต้อง");
            if (reqVO.NewPass.Length < 6)
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, "รหัสผ่านต้องมีจำนวนอักขระมากกว่า 6 ตัวอักษร");

            string newSalt = EncryptUtil.GenerateMD5(DateTime.Now.Ticks.ToString() + (new Random()).Next(0, 99999));
            string hashNewPass = ams_User.HashPassword(reqVO.NewPass, newSalt);
            ADO.DataADO.GetInstant().UpdateByID<ams_User>(user.ID.Value, this.BuVO,
                new KeyValuePair<string, object>("Password", hashNewPass),
                new KeyValuePair<string, object>("SaltPassword", newSalt));

            ADO.TokenADO.GetInstant().Remove(token.Token, token.ClientSecret_SecretKey, this.BuVO.ActionBy, this.BuVO);
            var resToken = ADO.TokenADO.GetInstant().Register(user.Code, reqVO.NewPass, token.ClientSecret_SecretKey, this.BuVO.ActionBy, true, this.BuVO);
            return new TRes { token = resToken.Token, extendKey = token.ExtendKey, expireTime = token.ExpireTime };
        }
    }
}
