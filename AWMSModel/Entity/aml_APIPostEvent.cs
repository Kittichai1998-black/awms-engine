using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Entity
{
    public class aml_APIPostEvent : BaseEntityID
    {
        public string LogRefID;
        public string PostRefID;
        public string APIService_Module;
        public string APIName;
        public string APIUrl;
        public string Header;
        public string InputText;
        public string OutputText;
        public int HttpStatus;
        public int ResultStatus;
        public string ResultMessage;
        public int ActionBy;
        public DateTime StartTime;
        public DateTime? EndTime;
    }
}
