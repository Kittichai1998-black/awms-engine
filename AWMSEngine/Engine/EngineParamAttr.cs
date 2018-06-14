using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine
{
    [AttributeUsage(AttributeTargets.Field, AllowMultiple = false)]
    public class EngineParamAttr : Attribute
    {
        public enum InOutType
        {
            Request,
            Response
        }
        //public string PName { get; }
        public string PDescription { get; }
        public Type PType { get; }
        public InOutType IOType { get; }
        public EngineParamAttr(InOutType IOType, Type PType, string PDescription = "")
        {
            //this.PName = PName;
            this.PType = PType;
            this.IOType = IOType;
            this.PDescription = PDescription;
        }

    }
}
