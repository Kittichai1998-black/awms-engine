using AWCSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWCSModel.Criteria
{
    public class RouteLineCriteria
    {
        public int ID;
        public string AreaCode;
        public string LocationCode;
        public int MaxMchineBuffer;
        public List<BaseMachineObjectCriteria> Machines;
        public List<RouteLineCriteria> NextRouteLines;
    }
}
