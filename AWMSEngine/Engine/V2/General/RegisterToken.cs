using AWMSModel.Entity;
using System;
using System.Linq;
using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AMWUtil.Common;

namespace AWMSEngine.Engine.V2.General
{
    public class RegisterToken : BaseEngine<RegisterToken.TReqModel, amt_Token>
    {
        public class TReqModel
        {
            public string Username;
            public string Password;
            public string SecretKey;
        }

        protected override amt_Token ExecuteEngine(RegisterToken.TReqModel reqVO)
        {
            if (ADO.StaticValue.StaticValueManager.GetInstant().IsFeature("AUTHENLDAP"))
            {
                var appProp = AMWUtil.PropertyFile.PropertyFileManager.GetInstant().GetPropertyDictionary("app");

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
                    amt_Token tokenModel = ADO.TokenADO.GetInstant().Register(
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
                var user = ADO.DataADO.GetInstant().SelectBy<ams_User>(new SQLConditionCriteria[]
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

                var permissions = ADO.PermissionADO.GetInstant().ListByUser(user.ID.Value, this.BuVO);

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
                        exp = DateTime.Now.AddHours(this.StaticValue.GetConfigValue(ConfigCode.TOKEN_EXPIRE_HR).Get<int>()),
                        extend = DateTime.Now.AddHours(this.StaticValue.GetConfigValue(ConfigCode.TOKEN_EXTEND_HR).Get<int>()),
                        pms = permissions.Select(x=>x.ID.Value).ToArray()
                    }
                };
                string tokenVal = EncryptUtil.Base64Encode(token.HeadDecode.Json()) + "." + EncryptUtil.Base64Encode(token.BodyDecode.Json());
                token.SignatureEncode = EncryptUtil.GenerateSHA256String(tokenVal + "." + user.SecretKey);
                tokenVal = tokenVal + "." + token.SignatureEncode;

                amt_Token tokenModel = new amt_Token()
                {
                    ExpireTime = token.BodyDecode.exp,
                    Token = tokenVal
                };
                return tokenModel;
            }
        }
    }
}
