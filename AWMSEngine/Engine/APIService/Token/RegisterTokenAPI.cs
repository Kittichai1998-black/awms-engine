using AWMSEngine.Engine.Validation;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.APIService.Token
{
    public class RegisterTokenAPI : BaseAPIService
    {
        protected override void ExecuteEngineManual()
        {
            new BuVORequiredFields().Execute(this.Logger, this.BuVO,
                new List<KeyGetSetCriteria>()
                {
                    new KeyGetSetCriteria() { KeySet = BuVORequiredFields.IN_KEY_FIELDNAMES, KeyGet="username,password" },
                    new KeyGetSetCriteria(){KeySet = BuVORequiredFields.IN_KEY_THROWFLAG, KeyGet=YesNoConst.YES}
                },
                new List<KeyGetSetCriteria>()
                {
                    new KeyGetSetCriteria(){KeyGet = BuVORequiredFields.OUT_KEY_PASSFLAG, KeySet="ValidatePassFlag"}
                });
            
        }
    }
}
