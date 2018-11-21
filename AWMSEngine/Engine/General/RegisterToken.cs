using AWMSEngine.Common;
using AWMSModel.Constant.StringConst;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.DirectoryServices;
using System.Threading.Tasks;
using AMWUtil.Exception;

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
            var config = this.StaticValue.GetConfig("LDAP_USE");
                if(config == "Y"){   
                    DirectoryEntry drentry = new DirectoryEntry(this.StaticValue.GetConfig("LDAP_HOST"));
                    drentry.Username = reqVO.Username;
                    drentry.Password = reqVO.Password;
                    object native = drentry.NativeObject;

                    DirectorySearcher search = new DirectorySearcher(drentry);

                    search.Filter = "(SAMAccountName=" + reqVO.Username + ")";
                    search.PropertiesToLoad.Add("cn");
                    SearchResult result = search.FindOne();

                if (result == null) {
                    throw new AMWException(this.Logger, AMWExceptionCode.A0001,"ไม่สามารถเข้าสู่ระบบ LDAP ได้");
                } else {
                    amt_Token tokenModel = ADO.TokenADO.GetInstant().LDAP(
                        reqVO.SecretKey,
                        0,
                         this.BuVO);
                    return tokenModel;
                }
            }
            else {
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
