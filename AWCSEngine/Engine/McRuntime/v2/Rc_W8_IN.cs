using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AWCSEngine.Engine.McRuntime.v2
{
    public class Rc_W8_IN : BaseMcRuntime
    {
        public Rc_W8_IN(acs_McMaster mcMst) : base(mcMst)
        {
        }

        protected override McTypeEnum McType => McTypeEnum.CV;

        protected override void OnStart()
        {
        }

        protected override void OnRun()
        {

        }

        protected override void OnEnd()
        {
        }
    }
}
