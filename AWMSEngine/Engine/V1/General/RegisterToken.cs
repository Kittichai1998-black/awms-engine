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
                var serverName = ADO.StaticValue.StaticValueManager.GetInstant().Configs.FirstOrDefault(x => x.Code == "LDAP_SERVER").DataValue;
                var ldapDNFormat = ADO.StaticValue.StaticValueManager.GetInstant().Configs.FirstOrDefault(x => x.Code == "LDAP_FORMAT").DataValue;
                var ldapRes = AMWUtil.DataAccess.LDAPAuthenticate.ValidateUser("users", "guest1password", serverName, ldapDNFormat);
                if (!ldapRes)
                    throw new AMWException(this.Logger, AMWExceptionCode.A0001, "LDAP Login False");
                else
                {
                    amt_Token tokenModel = ADO.TokenADO.GetInstant().Register(
                        reqVO.Username,
                        null,
                        reqVO.SecretKey,
                        0,
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
                         this.BuVO);
                return tokenModel;
            }
        }
    }
}
