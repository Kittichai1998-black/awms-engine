using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business
{
    public class NewVirtualMapStorageObject : BaseEngine<NewVirtualMapStorageObject.TReqModel, StorageObjectCriteria>
    {
        public class TReqModel
        {
            public string code;
            public decimal amount;
            public List<KeyValuePair<string,string>> options;
        }
        protected override StorageObjectCriteria ExecuteEngine(TReqModel reqVO)
        {
            StorageObjectCriteria res = new StorageObjectCriteria();
            var dataADO = ADO.DataADO.GetInstant();
            var areaMst = dataADO.SelectByCode<ams_AreaLocation>(reqVO.code).FirstOrDefault();
            if (areaMst == null)
            {
                var baseMst = dataADO.SelectByCode<ams_BaseMaster>(reqVO.code).FirstOrDefault();
                if (baseMst == null)
                {
                    var packMst = dataADO.SelectByCode<ams_PackMaster>(reqVO.code).FirstOrDefault();
                    if (packMst != null)
                        res = new StorageObjectCriteria()
                        {
                            code = packMst.Code,
                            name = packMst.Name,
                            type = StorageObjectChildType.PACK,
                            isFocus = true,
                            amount = reqVO.amount,
                            mapstos = new List<StorageObjectCriteria>(),
                            options = reqVO.options
                        };
                }
                else
                {
                    res = new StorageObjectCriteria()
                    {
                        code = baseMst.Code,
                        name = baseMst.Name,
                        type = StorageObjectChildType.BASE,
                        isFocus = true,
                        amount = 1,
                        mapstos = new List<StorageObjectCriteria>(),
                        options = reqVO.options
                    };
                }
            }
            else
            {
                res = new StorageObjectCriteria()
                {
                    code = areaMst.Code,
                    name = areaMst.Name,
                    type = StorageObjectChildType.LOCATION,
                    isFocus = true,
                    amount = 1,
                    mapstos = new List<StorageObjectCriteria>(),
                    options = reqVO.options
                };
            }
            return res;
        }

    }
}
