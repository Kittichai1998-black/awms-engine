using AMWUtil.Common;
using AMWUtil.Exception;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business
{
    public class RemoveSTOandDiSTOfromDoc : BaseEngine<RemoveSTOandDiSTOfromDoc.TReq, NullCriteria>
    {

        public class TReq
        {
            public long? distoID;
            public long? rootID;
        }

        protected override NullCriteria ExecuteEngine(TReq reqVO)
        {
            var getDiSTO = ADO.WMSDB.DataADO.GetInstant().SelectByID<amt_DocumentItemStorageObject>(reqVO.distoID.Value, this.BuVO);

            if (getDiSTO == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบข้อมูล Document Item Storage Object");

            var getSto = ADO.WMSDB.StorageObjectADO.GetInstant().Get(reqVO.rootID.Value, StorageObjectType.BASE, false, true, BuVO);

            var stoLists = getSto.ToTreeList();
            var stoPack = stoLists.Find(x => x.id == getDiSTO.Sou_StorageObject_ID);

            stoPack.eventStatus = StorageObjectEventStatus.PACK_REMOVED;

            ADO.WMSDB.StorageObjectADO.GetInstant().UpdateStatus(getDiSTO.Sou_StorageObject_ID, null, null, StorageObjectEventStatus.PACK_REMOVED, this.BuVO);

            if (stoPack.parentID.HasValue)
                remove_parent_empty(stoPack.parentID.Value, stoPack.parentType.Value);
            void remove_parent_empty(long parent_id, StorageObjectType parent_type)
            {
                if (parent_type != StorageObjectType.LOCATION)
                {
                    if (stoLists.FindAll(x => x.parentID == parent_id && x.parentType == parent_type).TrueForAll(x => x.eventStatus == StorageObjectEventStatus.PACK_REMOVED))
                    {
                        var parentRemove = stoLists.Find(x => x.id == parent_id);

                        parentRemove.eventStatus = StorageObjectEventStatus.PACK_REMOVED;
                        ADO.WMSDB.StorageObjectADO.GetInstant().UpdateStatus(parentRemove.id.Value, null, null, StorageObjectEventStatus.PACK_REMOVED, this.BuVO);
                        if (parentRemove.parentID.HasValue)
                            remove_parent_empty(parentRemove.parentID.Value, parentRemove.parentType.Value);
                    }
                }
            }

            ADO.WMSDB.DistoADO.GetInstant().Update(getDiSTO.ID.Value, EntityStatus.REMOVE, this.BuVO);


            return null;

        }


    }
}