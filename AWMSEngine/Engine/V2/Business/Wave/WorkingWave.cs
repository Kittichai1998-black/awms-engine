using AMWUtil.Exception;
using AMSModel.Constant.EnumConst;
using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.Wave
{
    public class WorkingWave : BaseEngine<WorkingWave.TReq, WorkingWave.TRes>
    {
        public class TReq
        {
            public long waveID;
        }
        public class TRes
        {
            public amt_Wave wave;
        }
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            var wave = ADO.WMSDB.WaveADO.GetInstant().Get(reqVO.waveID, this.BuVO);
            if (wave.EventStatus != WaveEventStatus.NEW)
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, "Wave ต้องอยู่ในสถานะ NEW เท่านั้น");

            wave.EventStatus = WaveEventStatus.WORKING;
            ADO.WMSDB.WaveADO.GetInstant().Put(wave, this.BuVO);

            var waveSeq = wave.WaveSeqs.Find(x => x.Start_StorageObject_EventStatus == StorageObjectEventStatus.PACK_ALLOCATING);
            if (waveSeq.EventStatus != WaveEventStatus.NEW)
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, "Wave Sequence ต้องอยู่ในสถานะ NEW เท่านั้น");

            waveSeq.EventStatus = WaveEventStatus.WORKING;
            ADO.WMSDB.WaveADO.GetInstant().PutSeq(waveSeq, this.BuVO);

            var distoWaveSeq = ADO.WMSDB.DistoADO.GetInstant().ListBySouWaveSeq(waveSeq.ID.Value, this.BuVO);
            var distoList = new List<DoneDistoWaveSeq.TReq.DistoList>();
            distoWaveSeq.ForEach(disto =>
            {
                distoList.Add(new DoneDistoWaveSeq.TReq.DistoList()
                {
                    distoID = disto.ID.Value,
                    limitQty = false                    
                });
            });
            var doneAllocateReq = new DoneDistoWaveSeq.TReq() { distos = distoList,  };
            var doneAllocate = new DoneDistoWaveSeq();
            var res = doneAllocate.Execute(this.Logger, this.BuVO, doneAllocateReq);

            if(res.distos.Any(x=> x.Status != EntityStatus.ACTIVE))
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, "มีสินค้าบางชิ้นไม่ถูก Active");

            return new TRes() { wave = wave };
        }

    }
}
