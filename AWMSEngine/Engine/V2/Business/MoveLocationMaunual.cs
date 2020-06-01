using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.Engine.V2.Validation;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business
{
    public class MoveLocationMaunual : BaseEngine<MoveLocationMaunual.TDocReq, MoveLocationMaunual.TDocRes>
    {
        public class TDocReq
        {
            public string PalletCode;
            public long LocationID;
            public long bstosID;
        }
        public class TDocRes
        {
            public StorageObjectCriteria data;
        }

        protected override TDocRes ExecuteEngine(TDocReq reqVO)
        {
            TDocRes res = new TDocRes();
            var sto = ADO.StorageObjectADO.GetInstant().Get(reqVO.bstosID, StorageObjectType.BASE, false, true, this.BuVO);

            new ValidateObjectSizeLimit().Execute(this.Logger, this.BuVO, sto);
            //this.ValidateObjectSizeLimit(sto);
            var data = ADO.StorageObjectADO.GetInstant().UpdateLocationToChild(sto, reqVO.LocationID, this.BuVO);
            res.data = data;

            return res;
        }
    }
}
