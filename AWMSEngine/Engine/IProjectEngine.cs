using AMWUtil.Logger;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine
{
    public interface IProjectEngine<TReq, TRes>
    {
        TRes ExecuteEngine(AMWLogger logger, VOCriteria buVO, TReq reqVO);
    }
}
