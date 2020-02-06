using AWMSEngine.Common;
using AWMSModel.Constant.StringConst;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.DirectoryServices;
using System.Threading.Tasks;
using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;

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
                    throw new AMWException(this.Logger, AMWExceptionCode.A0001, "LDAP Login Fail");
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
                amt_Token tokenModel = ADO.TokenADO.GetInstant().Register(
                        reqVO.Username,
                        reqVO.Password,
                        reqVO.SecretKey,
                        0,
                        true,
                         this.BuVO);
                return tokenModel;
            }
        }
    }
}
