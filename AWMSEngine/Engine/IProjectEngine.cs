using AMWUtil.Logger;
using AMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine
{
    public abstract class IProjectEngine<TReq, TRes>
        where TRes : class
    {
        protected Type TypeEngine { get; set; }
        protected AMWLogger Logger { get; set; }
        protected VOCriteria BuVO { get; set; }
        protected TReq ReqVO { get; set; }

        protected abstract TRes ExecuteEngine(AMWLogger logger, VOCriteria buVO, TReq reqVO);

        protected TRes BaseExecute(AMWLogger logger, VOCriteria buVO, TReq reqVO)
        {
            var engine = (BaseEngine<TReq,TRes>)Activator.CreateInstance(this.TypeEngine, new object[] { });
            return engine.Execute(logger, buVO, reqVO, false);
        }

        public TRes Execute(Type typeEngine, AMWLogger logger, VOCriteria buVO, TReq reqVO)
        {
            this.TypeEngine = typeEngine;
            this.Logger = logger;
            this.BuVO = BuVO;
            this.ReqVO = reqVO;
            return ExecuteEngine(logger, buVO, reqVO);
        }
    }
}
