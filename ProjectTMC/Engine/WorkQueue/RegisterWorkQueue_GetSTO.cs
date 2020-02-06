using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSEngine.Engine;
using AWMSEngine.Engine.Business.Received;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectTMC.Engine.WorkQueue
{
    public class RegisterWorkQueue_GetSTO : IProjectEngine<
        RegisterWorkQueue.TReq,
        StorageObjectCriteria
        >
    {
        public StorageObjectCriteria ExecuteEngine(AMWLogger logger, VOCriteria buVO, RegisterWorkQueue.TReq reqVO)
        {

            if (reqVO.mappingPallets != null && reqVO.mappingPallets.Count > 0)
            {
                if (reqVO.baseCode == null || reqVO.baseCode == "" || reqVO.baseCode == String.Empty)
                    throw new AMWException(logger, AMWExceptionCode.V1001, "Base Code is null");

                var baseMasterData = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<ams_BaseMaster>(
                    new KeyValuePair<string, object>[] {
                    new KeyValuePair<string,object>("Code",reqVO.baseCode),
                    new KeyValuePair<string,object>("Status",1),
                    }, buVO);


                if (baseMasterData.Count <= 0)
                {
                    //ไม่มีในระบบ insert เข้า baseMaster
                    AWMSEngine.ADO.DataADO.GetInstant().Insert<ams_BaseMaster>(buVO, new ams_BaseMaster()
                    {
                        Code = reqVO.baseCode,
                        Name = "Pallet",
                        BaseMasterType_ID = 1,
                        Description = "",
                        ObjectSize_ID = 16,
                        Status = EntityStatus.ACTIVE,
                        UnitType_ID = 98,
                        WeightKG = reqVO.weight
                    });
                }

                foreach (var mappingPallet in reqVO.mappingPallets)
                {
                    if(reqVO.areaCode == "")
                                             
                    if(mappingPallet.qty == 3)
                    {

                    }
                    else if(mappingPallet.qty < 3)
                    {


                    }
                    else
                    {
                        throw new AMWException(logger, AMWExceptionCode.V1001, "qty is greater than 3");
                    }
                   
                }
                //=========================================================
            }

            return null;

        }
    }
}
