using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.Common;
using AMSModel.Constant.EnumConst;
using AMSModel.Constant.StringConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.General
{
    public class ExtendToken : BaseEngine<ExtendToken.TReqModel, TokenObject>
    {
        public class TReqModel
        {
            public string Token;
        }

        protected override TokenObject ExecuteEngine(TReqModel reqVO)
        {
            var tk = reqVO.Token.Split('.');
            TokenCriteria tokenInfo = new TokenCriteria();
            tokenInfo.HeadEncode = tk[0];
            tokenInfo.BodyEncode = tk[1];
            tokenInfo.SignatureEncode = tk[2];
            tokenInfo.HeadDecode = EncryptUtil.Base64Decode(tk[0]).Json<TokenCriteria.TokenHead>();
            tokenInfo.BodyDecode = EncryptUtil.Base64Decode(tk[1]).Json<TokenCriteria.TokenBody>();


            ams_User userInfo = ADO.WMSDB.DataADO.GetInstant().SelectByID<ams_User>(tokenInfo.BodyDecode.uid, this.BuVO);
            if (tokenInfo != null)
            {
                if (DateTime.Now > tokenInfo.BodyDecode.extend)
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.A0012);
                }
                if (tokenInfo.HeadDecode.typ.Equals("jwt"))
                {

                    if (tokenInfo.HeadDecode.enc.Equals("sha256"))
                    {
                        if (!tokenInfo.SignatureEncode.Equals(
                            EncryptUtil.GenerateSHA256String(tokenInfo.HeadEncode + "." + tokenInfo.BodyEncode + "." + userInfo.SecretKey)))
                        {
                            throw new AMWException(this.Logger, AMWExceptionCode.A0013);
                        }
                    }
                    else
                    {
                        throw new AMWException(this.Logger, AMWExceptionCode.A0013);
                    }
                }
                else
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.A0013);
                }
            }
            tokenInfo.BodyDecode.exp = DateTime.Now.AddHours(this.StaticValue.GetConfigValue(ConfigCommon.TOKEN_EXPIRE_HR).Get<int>());
            tokenInfo.BodyDecode.extend = DateTime.Now.AddHours(this.StaticValue.GetConfigValue(ConfigCommon.TOKEN_EXTEND_HR).Get<int>());

            tokenInfo.BodyEncode = EncryptUtil.Base64Encode(tokenInfo.BodyDecode.Json());
            tokenInfo.SignatureEncode = EncryptUtil.GenerateSHA256String(tokenInfo.HeadDecode + "." + tokenInfo.BodyEncode + "." + userInfo.SecretKey);
            return new TokenObject() { Token = tokenInfo.HeadEncode + "." + tokenInfo.BodyEncode + "." + tokenInfo.SignatureEncode };
        }
    }
}
