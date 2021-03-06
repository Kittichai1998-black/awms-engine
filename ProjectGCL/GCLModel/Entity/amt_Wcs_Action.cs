using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectGCL.GCLModel.Entity
{
    public class amt_Wcs_Action : AMSModel.Entity.BaseEntityCreateModify
    {
        public string ApiRef;
        public TMode Mode;
        public string ShuCode;
        public string LocName;
        public int? Bay;
        public int? Lv;
        public int? PalletCount;
        public string PalletSort;
        public string Result;

        public enum TMode
        {
            Check_IN = 1,
            Check_Out = 2,
            Counting = 3,
            Sorting = 4,
            Cancel = 99
        }
    }
}
