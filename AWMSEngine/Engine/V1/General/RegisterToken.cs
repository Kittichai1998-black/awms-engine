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

namespace AWMSEngine.Engine.General
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
            if (ADO.StaticValue.StaticValueManager.GetInstant().IsFeature(FeatureCode.AUTHENLDAP))
            {
                var host = AMWUtil.PropertyFile.PropertyFileManager.GetInstant().GetPropertyDictionary("ldap.host");
                var port = AMWUtil.PropertyFile.PropertyFileManager.GetInstant().GetPropertyDictionary("ldap.port");
                var binddn = AMWUtil.PropertyFile.PropertyFileManager.GetInstant().GetPropertyDictionary("ldap.binddn");
                var version = AMWUtil.PropertyFile.PropertyFileManager.GetInstant().GetPropertyDictionary("ldap.version");
                var starttls = AMWUtil.PropertyFile.PropertyFileManager.GetInstant().GetPropertyDictionary("ldap.starttls");
                var basedn = AMWUtil.PropertyFile.PropertyFileManager.GetInstant().GetPropertyDictionary("ldap.basedn");

                var userdn = binddn["ldap.binddn"];
                userdn = userdn.Replace("{username}", reqVO.Username);
                userdn = userdn.Replace("{host}", host["ldap.host"]);
                userdn = userdn.Replace("{port}", port == null ? "389" : port["ldap.host"]);
                userdn = userdn.Replace("{version}", version == null ? "" : version["ldap.version"]);
                userdn = userdn.Replace("{basedn}", basedn == null ? "" : basedn["ldap.basedn"]);

                var ldapRes = AMWUtil.DataAccess.LDAPAuthenticate.ValidateUser(
                    userdn, 
                    reqVO.Password, 
                    host["ldap.host"],
                    port == null ? 389 : int.Parse(port["ldap.host"]),
                    version == null ? (int?)null : int.Parse(version["ldap.version"]),
                    starttls == null ? (bool?)null : Convert.ToBoolean(starttls["ldap.starttls"])
                    );

                if (!ldapRes)
                    throw new AMWException(this.Logger, AMWExceptionCode.A0001, "LDAP Login False");
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
