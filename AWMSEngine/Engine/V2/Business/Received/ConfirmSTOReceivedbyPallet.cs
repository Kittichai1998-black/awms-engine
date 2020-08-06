using AMWUtil.Exception;
using AWMSEngine.ADO;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.Received
{
    public class ConfirmSTOReceivedbyPallet : BaseEngine<ConfirmSTOReceivedbyPallet.TReqModle, StorageObjectCriteria>
    {

        public class TReqModle
        {
            public long rootStoID;
            public bool isConfirm;
            public StorageObjectType type;
        }

        protected override StorageObjectCriteria ExecuteEngine(ConfirmSTOReceivedbyPallet.TReqModle reqVO)
        {
            List<dynamic> updates = new List<dynamic>();
            if (reqVO.type == StorageObjectType.LOCATION)
            {
                var sto = ADO.DataADO.GetInstant().SelectBy<amt_StorageObject>(
                    new SQLConditionCriteria[]
                    {
                        new SQLConditionCriteria("AreaLocationMaster_ID",reqVO.rootStoID, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("status", EntityStatus.REMOVE, SQLOperatorType.LESS)
                    }, this.BuVO);
                if (sto == null && sto.Count() == 0)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบสินค้าใน Area");
                sto.ForEach(x => updates.Add(new { rootStoID = x.ID, type = x.ObjectType }));
            }
            else
            {
                updates.Add(new { rootStoID = reqVO.rootStoID, type = reqVO.type });
            }

            foreach (var u in updates)
            {
                if (reqVO.isConfirm)
                {
                    ADO.StorageObjectADO.GetInstant()
                        .UpdateStatusToChild(
                            u.rootStoID,
                            StorageObjectEventStatus.NEW,
                            null,
                            StorageObjectEventStatus.RECEIVED,
                            this.BuVO);
                }
                else
                {
                    ADO.StorageObjectADO.GetInstant()
                        .UpdateStatusToChild(
                            u.rootStoID,
                            StorageObjectEventStatus.NEW,
                            null,
                            StorageObjectEventStatus.REMOVED,
                            this.BuVO);
                }
            }
            
            StorageObjectCriteria res = ADO.StorageObjectADO.GetInstant().Get(reqVO.rootStoID, reqVO.type, false, true, this.BuVO);
            //if (res == null) res = new StorageObjectCriteria();

            return res;
        }

        /*private void ConfirmReceive(bool isConfirm, StorageObjectCriteria mapsto)
        {
            if(mapsto.eventStatus == StorageObjectEventStatus.IDEL)
            {
                this.ADOSto.ReceivingConfirm(mapsto.id.Value, mapsto.type, isConfirm, this.BuVO);
                mapsto._onchange = true;
                mapsto.eventStatus = isConfirm ? StorageObjectEventStatus.RECEIVED : StorageObjectEventStatus.IDEL;
            }
            if (mapsto.mapstos != null)
            {
                mapsto.mapstos.ForEach(x => ConfirmReceive(isConfirm, x));
            }

            if (!isConfirm)
                mapsto.mapstos.RemoveAll(x => x.eventStatus == StorageObjectEventStatus.IDEL);
        }*/
    }
}
