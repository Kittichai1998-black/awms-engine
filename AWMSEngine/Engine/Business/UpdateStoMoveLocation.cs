using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business
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

            var docItemSto = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(new KeyValuePair<string, object>[] {
                    new KeyValuePair<string, object> ("StorageObject_ID",reqVO.bstosID)
                    }, this.BuVO);

            //var flag = docItemSto.TrueForAll(check => check.Status != 0);

            //if (flag == false)
            //    throw new AMWException(this.Logger, AMWExceptionCode.V1001, reqVO.PalletCode + " is Booked");


            var StorageObject = ADO.StorageObjectADO.GetInstant().Get(reqVO.bstosID, StorageObjectType.BASE, false, false, this.BuVO);

            res.data = ADO.StorageObjectADO.GetInstant().UpdateLocation(StorageObject, reqVO.LocationID,this.BuVO);

           
            return res;
        }
    }
}
