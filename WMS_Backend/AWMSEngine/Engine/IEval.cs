using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine
{
    public interface IEval
    {
        bool exec(dynamic data);
    }
}
