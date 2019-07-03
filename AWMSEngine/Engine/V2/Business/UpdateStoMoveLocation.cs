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
    public class UpdateStoMoveLocation : BaseEngine<UpdateStoMoveLocation.TDocReq, UpdateStoMoveLocation.TDocRes>
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

            var docItemSto = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(
                    new SQLConditionCriteria[] {
                        new SQLConditionCriteria("Sou_StorageObject_ID",
                            string.Join(',', sto.ToTreeList().Where(x => x.type == StorageObjectType.PACK).Select(x => x.id.Value).ToArray()),
                            SQLOperatorType.IN),
                        new SQLConditionCriteria("status",EntityStatus.INACTIVE, SQLOperatorType.EQUALS)
                    }
                    , this.BuVO);


            if (docItemSto.Any(x=>x.Status == EntityStatus.INACTIVE))
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, reqVO.PalletCode + " is " + sto.eventStatus.ToString());


            
            var data = ADO.StorageObjectADO.GetInstant().UpdateLocationToChild(sto,StorageObjectEventStatus.RECEIVED ,reqVO.LocationID,this.BuVO);

            var stoValidateRes = new ValidateObjectSizeOverLimit().Execute(this.Logger, this.BuVO, data);
            res.data = data;
            return res;
        }
    }
}
