﻿using AMSModel.Criteria;
using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWCSEngine.Engine
{
    public class McRGV : BaseEngine
    {
        public McRGV(int mcObject) : base(mcObject)
        {
        }

        protected override void Execute(acs_McMaster mcMst, act_McObject mcObj)
        {
            throw new NotImplementedException();
        }
    }
}
