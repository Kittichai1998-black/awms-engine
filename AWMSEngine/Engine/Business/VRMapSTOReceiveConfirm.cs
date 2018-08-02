using AWMSEngine.ADO;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business
{
    public class VRMapSTOReceiveConfirm : BaseEngine<VRMapSTOReceiveConfirm.TReqModle, StorageObjectCriteria>
    {

        public class TReqModle
        {
            public int rootStoID;
            public bool isConfirm;
            public StorageObjectType type;
        }

        private StorageObjectADO ADOSto { get; set; }
        protected override StorageObjectCriteria ExecuteEngine(VRMapSTOReceiveConfirm.TReqModle reqVO)
        {
            this.ADOSto = ADO.StorageObjectADO.GetInstant();
            var mapsto = this.ADOSto.Get(reqVO.rootStoID, reqVO.type, false, true, this.BuVO);
            this.ConfirmReceive(reqVO.isConfirm, mapsto);
            //mapsto = this.ADOSto.Get(reqVO.rootStoID, reqVO.type, false, true, this.BuVO);
            return mapsto;
        }

        private void ConfirmReceive(bool isConfirm, StorageObjectCriteria mapsto)
        {
            if(mapsto.eventStatus == StorageObjectEventStatus.RECEIVING)
            {
                this.ADOSto.ReceivingConfirm(mapsto.id.Value, mapsto.type, isConfirm, this.BuVO);
                mapsto._onchange = true;
                mapsto.eventStatus = isConfirm ? StorageObjectEventStatus.RECEIVED : StorageObjectEventStatus.RECEIVING;
            }
            if (mapsto.mapstos != null)
            {
                mapsto.mapstos.ForEach(x => ConfirmReceive(isConfirm, x));
            }

            if (!isConfirm)
                mapsto.mapstos.RemoveAll(x => x.eventStatus == StorageObjectEventStatus.RECEIVING);
        }
    }
}
