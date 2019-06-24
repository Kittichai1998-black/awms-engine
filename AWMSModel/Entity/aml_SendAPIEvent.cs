using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Entity
{
    public class aml_SendAPIEvent : BaseEntityID
    {
        public string LogRefID;
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
