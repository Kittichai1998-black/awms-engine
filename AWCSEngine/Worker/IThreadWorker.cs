using AMWUtil.Logger;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWCSEngine.Worker
{
    public interface IThreadWorker
    {
        void Initial();
        void WakeUpAll();
        void Run(object _arg);
    }
}
