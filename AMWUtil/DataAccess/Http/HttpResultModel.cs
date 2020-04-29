using System;
using System.Collections.Generic;
using System.Text;

namespace AMWUtil.DataAccess.Http
{
    public class HttpResultModel
    {
        public string APIService_Module;
        public string APIName;

        public string APIUrl;
        public string PostRefID;
        public string Header;
        public string InputText;
        public string OutputText;
        public int HttpStatus;
        public int ResultStatus;
        public string ResultMessage;
        public DateTime StartTime;
        public DateTime? EndTime;
    }
}
