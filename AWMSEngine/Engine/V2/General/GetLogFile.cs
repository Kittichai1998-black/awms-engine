using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Logger;
using AWMSModel.Criteria;

namespace AWMSEngine.Engine.V2.General
{
    public class GetLogFile : BaseEngine<string, Array>
    {
        protected override Array ExecuteEngine(string reqVO)
        {
            //string text = System.IO.File.ReadAllText(reqVO);
            string[] arrString = System.IO.File.ReadAllLines(reqVO);
            return arrString;
        }
    }
}
