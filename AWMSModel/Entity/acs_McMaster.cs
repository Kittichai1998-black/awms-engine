﻿using AMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Entity
{
    public class acs_McMaster : BaseEntitySTD
    {
        public string NameEngine;
        public int ThreadCoreIndex;
        public PlcCommunicationType PlcCommunicationType;
        public string LogicalNumber;
    }
}
