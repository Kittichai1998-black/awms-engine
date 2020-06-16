using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
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
            var getDiSTO = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<amt_DocumentItemStorageObject>(reqVO.distoID.Value, this.BuVO);

            if (getDiSTO == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบข้อมูล Document Item Storage Object");

            var getSto = ADO.StorageObjectADO.GetInstant().Get(reqVO.rootID.Value, StorageObjectType.BASE, false, true, BuVO);

            var stoLists = getSto.ToTreeList();
            var stoPack = stoLists.Find(x => x.id == getDiSTO.Sou_StorageObject_ID);

            stoPack.eventStatus = StorageObjectEventStatus.REMOVED;

            ADO.StorageObjectADO.GetInstant().UpdateStatus(getDiSTO.Sou_StorageObject_ID, null, null, StorageObjectEventStatus.REMOVED, this.BuVO);

            if (stoPack.parentID.HasValue)
                remove_parent_empty(stoPack.parentID.Value, stoPack.parentType.Value);
            void remove_parent_empty(long parent_id, StorageObjectType parent_type)
            {
                if (parent_type != StorageObjectType.LOCATION)
                {
                    if (stoLists.FindAll(x => x.parentID == parent_id && x.parentType == parent_type).TrueForAll(x => x.eventStatus == StorageObjectEventStatus.REMOVED))
                    {
                        var parentRemove = stoLists.Find(x => x.id == parent_id);

                        parentRemove.eventStatus = StorageObjectEventStatus.REMOVED;
                        ADO.StorageObjectADO.GetInstant().UpdateStatus(parentRemove.id.Value, null, null, StorageObjectEventStatus.REMOVED, this.BuVO);
                        if (parentRemove.parentID.HasValue)
                            remove_parent_empty(parentRemove.parentID.Value, parentRemove.parentType.Value);
                    }
                }
            }

            ADO.DocumentADO.GetInstant().UpdateMappingSTO(getDiSTO.ID.Value, EntityStatus.REMOVE, this.BuVO);


            return null;

        }


    }
}