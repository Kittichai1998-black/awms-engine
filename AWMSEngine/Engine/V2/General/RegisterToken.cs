using AMSModel.Entity;
using System;
using System.Linq;
using AMWUtil.Exception;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMWUtil.Common;

namespace AWMSEngine.Engine.V2.General
{
    public class RegisterToken : BaseEngine<RegisterToken.TReqModel, TokenObject>
    {
        public class TReqModel
        {
            public string Username;
            public string Password;
            public string SecretKey;
        }

        protected override TokenObject ExecuteEngine(RegisterToken.TReqModel reqVO)
        {
            if (ADO.WMSStaticValue.StaticValueManager.GetInstant().GetConfigValue("AUTHEN.LDAP").Get<bool>())
            {
                var appProp = AMWUtil.PropertyFile.PropertyFileManager.GetInstant().Get("app");

                var userdn = appProp["ldap.binddn"];
                userdn = userdn.Replace("{username}", reqVO.Username);
                userdn = userdn.Replace("{host}", appProp["ldap.host"]);
                userdn = userdn.Replace("{port}", appProp["ldap.port"] == null ? "389" : appProp["ldap.port"]);
                userdn = userdn.Replace("{version}", appProp["ldap.version"] == null ? "" : appProp["ldap.version"]);
                userdn = userdn.Replace("{basedn}", appProp["ldap.basedn"] == null ? "" : appProp["ldap.basedn"]);

                var ldapRes = AMWUtil.DataAccess.LDAPAuthenticate.ValidateUser(
                    userdn, 
                    reqVO.Password,
                    appProp["ldap.host"],
                    appProp["ldap.port"] == null ? 389 : int.Parse(appProp["ldap.port"]),
                    appProp["ldap.version"] == null ? (int?)null : int.Parse(appProp["ldap.version"]),
                    appProp["ldap.starttls"] == null ? (bool?)null : Convert.ToBoolean(appProp["ldap.starttls"])
                    );

                if (!ldapRes)
                    throw new AMWException(this.Logger, AMWExceptionCode.A0014);
                else
                {
                    TokenObject tokenModel = ADO.WMSDB.TokenADO.GetInstant().Register(
                        reqVO.Username,
                        null,
                        reqVO.SecretKey,
                        0,
                        false,
                         this.BuVO);
                    return tokenModel;
                }

            }
            else
            {
                var user = ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_User>(new SQLConditionCriteria[]
                             {
                                new SQLConditionCriteria("code",reqVO.Username, SQLOperatorType.EQUALS),
                                new SQLConditionCriteria("status",EntityStatus.ACTIVE, SQLOperatorType.EQUALS)
                             }, this.BuVO).FirstOrDefault();

                if (user == null || 
                    !user.Password.Equals(
                        EncryptUtil.GenerateSHA256String(EncryptUtil.GenerateSHA256String(reqVO.Password)+user.SaltPassword)))
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.A0010);
                }

                var prodOwner = ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_User_ProductOwner>(new SQLConditionCriteria[]
                             {
                                new SQLConditionCriteria("User_ID",user.ID, SQLOperatorType.EQUALS),
                                new SQLConditionCriteria("Status",EntityStatus.ACTIVE, SQLOperatorType.EQUALS)
                             }, this.BuVO);

                var permissions = ADO.WMSDB.PermissionADO.GetInstant().ListByUser(user.ID.Value, this.BuVO);

                TokenCriteria token = new TokenCriteria()
                {
                    HeadDecode = new TokenCriteria.TokenHead()
                    {
                        typ = "jwt",
                        enc = "sha256",
                    },
                    BodyDecode = new TokenCriteria.TokenBody()
                    {
                        uid = user.ID.Value,
                        ucode = user.Code,
                        uname = user.Name,
                        exp = DateTime.Now.AddHours(this.StaticValue.GetConfigValue(ConfigCommon.TOKEN_EXPIRE_HR).Get<int>()),
                        extend = DateTime.Now.AddHours(this.StaticValue.GetConfigValue(ConfigCommon.TOKEN_EXTEND_HR).Get<int>()),
                        pms = permissions.Select(x=>x.ID.Value).ToArray(),
                        pos = prodOwner.Select(x=> x.ProductOwner_ID).ToArray()
                    }
                };
                string tokenVal = EncryptUtil.Base64Encode(token.HeadDecode.Json()) + "." + EncryptUtil.Base64Encode(token.BodyDecode.Json());
                token.SignatureEncode = EncryptUtil.GenerateSHA256String(tokenVal + "." + user.SecretKey);
                tokenVal = tokenVal + "." + token.SignatureEncode;

                TokenObject tokenModel = new TokenObject()
                {
                    ExpireTime = token.BodyDecode.exp,
                    Token = tokenVal
                };
                return tokenModel;
            }
        }
    }
}
