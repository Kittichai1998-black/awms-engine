using AMWUtil.Logger;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace AWCSEngine.McEngine
{
    public abstract class BaseMcEngine
    {
        protected abstract void Execute(act_McObject mcObject, VOCriteria buVO);
        protected int LogDay { get; set; }

        private Task TaskRun { get; set; }

        private act_McObject _McObject { get; set; }
        public act_McObject McObject { get => this._McObject; }

        public int McStatus { get; set; }

        public BaseMcEngine(act_McObject mcObject)
        {
            this._McObject = mcObject;
        }

        public void Start()
        {
            var logger = AMWLoggerManager.GetLogger("Machine", this._McObject.Code);
            
            VOCriteria buVO = new VOCriteria(logger, null);
            this.Run(this._McObject, buVO);
        }

        private void Run(act_McObject mcObject, VOCriteria buVO)
        {
            this.TaskRun = Task.Run(() =>
            {
                if (this.LogDay != DateTime.Now.Day)
                {
                }
                this.Execute(mcObject, buVO);
            });
        }

        public bool Stop()
        {
            if(this.TaskRun != null && this.TaskRun.IsCompleted)
            {
                this.TaskRun.Dispose();
                this.TaskRun = null;
                return true;
            }
            return false;
        }
    }
}
