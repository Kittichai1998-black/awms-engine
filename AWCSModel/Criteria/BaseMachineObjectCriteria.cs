using System;
using System.Collections.Generic;
using System.Text;

namespace AWCSModel.Criteria
{
    public abstract class BaseMachineObjectCriteria
    {
        public int ID;
        public List<StorageObjectCriteria> StorageObjects;
    }
}
