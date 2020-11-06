using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWCSEngine.McEngine
{
    public class McRGV : BaseMcEngine
    {
        public McRGV(int mcObject) : base(mcObject)
        {
        }

        protected override void Execute(acs_McMaster mcMst, act_McObject mcObj)
        {
            throw new NotImplementedException();
        }
    }
}
