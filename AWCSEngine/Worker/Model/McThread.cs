using ADO.WCSDB;
using AMSModel.Entity;
using AMWUtil.Common;
using AWCSEngine.Engine;
using AWCSEngine.Engine.McRuntime;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;

namespace AWCSEngine.Worker.Model
{

    public class McThread
    {
        private Thread _McThread { get; set; }

        public int Index { get; private set; }
        public List<BaseMcRuntime> McEngines { get; private set; }
        public McThread(int index)
        {
            this.Index = index;
            this.McEngines = new List<BaseMcRuntime>();
        }
        public void WeekUpMcThread(ParameterizedThreadStart runMethod)
        {
            if (this._McThread == null || !this._McThread.IsAlive)
            {
                this._McThread = new Thread(runMethod);
                this._McThread.Start(this);
            }
        }
        public void AddMc(acs_McMaster mcMst)
        {
            Type type = ClassType.GetClassType(typeof(BaseMcRuntime).Namespace + "." + mcMst.NameEngine);
            var mcEngine = (BaseMcRuntime)Activator.CreateInstance(type, new object[] { mcMst });
            McEngines.Add(mcEngine);
            mcEngine.Initial();
        }
    }
}
