using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine
{
    public class BaseEnginePrameterAttr : Attribute
    {
        public enum ParameterInOutType
        {
            Request,
            Response
        }
        public string PName { get; }
        public Type PType { get; }
        public ParameterInOutType InOutType { get; }
        public BaseEnginePrameterAttr(ParameterInOutType InOutType, Type PType, string PName)
        {
            this.PName = PName;
            this.PType = PType;
            this.InOutType = InOutType;
        }

    }
}
