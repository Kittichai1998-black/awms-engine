using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWCSEngine.McEngine
{
    public class McRGV : BaseMcEngine
    {
        public McRGV(act_McObject mcObject) : base(mcObject)
        {
        }

        protected override void Execute(act_McObject mcObject, VOCriteria buVO)
        {
            throw new NotImplementedException();
        }
    }
}
